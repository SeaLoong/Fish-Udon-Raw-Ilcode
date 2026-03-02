# AES-256 加密实现 — 完整 IL 级别分析

[English](aes256-il-analysis-en.md) | 简体中文

## 目录

1. [程序与函数](#1-程序与函数)
2. [DeriveKey 算法（来自 IL）](#2-derivekey-算法来自-il)
3. [密钥派生 — 非硬编码](#3-密钥派生--非硬编码)
4. [口令与盐值](#4-口令与盐值)
5. [ExpandKey / KeyExpansion（密钥扩展）](#5-expandkey--keyexpansion密钥扩展)
6. [完整解密流程](#6-完整解密流程)

---

## 1. 程序与函数

### CryptoAES256GPU (`c012e9a27db8fea4dbc6cbbe374240c3`)

| 函数                            | 用途                                                                 |
| ------------------------------- | -------------------------------------------------------------------- |
| `_start()`                      | 初始化 `sBox[256]`、`invSBox[256]`、`rcon[10]` — 均为标准 AES 查找表 |
| `__0_DeriveKey()`               | 自定义密钥派生（口令 + 盐 → 32 字节密钥）                            |
| `__0_ExpandKey()`               | 封装函数：确保 sBox 已初始化，然后调用 KeyExpansion                  |
| `__0_KeyExpansion()`            | 标准 AES-256 密钥调度（Nk=8, Nr=14 → 240 字节扩展密钥）              |
| `__0_DecryptStringGPU()`        | 入口点：Base64 解码 → IV/密文分离 → 密钥扩展 → GPU ECB 分发          |
| `_onAsyncGpuReadbackComplete()` | 读取 GPU 输出（Color32[] → 字节），启动 CBC 阶段                     |
| `_ContinueNextChunk()`          | 多帧 GPU 解密调度器                                                  |
| `_ContinueCBC()`                | 软件 CBC 异或 + PKCS7 去填充 + UTF-8 解码 → 返回明文                 |

### DiscordRoleManager (`eebb6f6c069f44a4399c68eb47834581`)

| 函数                         | 用途                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| `_start()`                   | 构建混淆口令/盐，调用 DeriveKey，缓存派生密钥，触发数据获取 |
| `_FetchRoleData()`           | 从 URL 下载加密的角色数据                                   |
| `_onStringLoadSuccess()`     | 处理下载结果，路由至解密或解析                              |
| `_DecryptFetchedData()`      | 将缓存的密钥和加密数据传递给 DecryptStringGPU               |
| `_OnGPUDecryptionComplete()` | 接收解密后的明文，触发解析                                  |
| `_OnGPUDecryptionFailed()`   | 解密失败的错误处理                                          |
| `_ProcessParse()`            | 将解密后的 JSON 解析为角色数据                              |

---

## 2. DeriveKey 算法（来自 IL）

从 CryptoAES256GPU 中指令 22580–24572 处的原始 Udon 字节码重建：

```text
function DeriveKey(passphrase: string, salt: byte[]) → byte[32]:
    // Step 1: Convert passphrase to bytes
    passphraseBytes = UTF8.GetBytes(passphrase)

    // Step 2: Build combined array (passphrase + salt concatenation)
    if salt != null:
        combined = new byte[passphraseBytes.length + salt.length]
        Array.Copy(passphraseBytes → combined[0..])
        Array.Copy(salt → combined[passphraseBytes.length..])
    else:
        combined = copy of passphraseBytes

    // Step 3: Initialize derived key (wrapping fill)
    derived = new byte[32]
    for i = 0 to 31:
        derived[i] = combined[i % combined.length]

    // Step 4: 1000 rounds of mixing
    for round = 0 to 999:
        temp = new byte[32]
        for j = 0 to 31:
            prev = derived[(j + 31) % 32]           // previous byte (wrapping)
            curr = derived[j]                        // current byte
            next = derived[(j + 1) % 32]             // next byte (wrapping)

            if salt != null AND salt.length > 0:
                saltByte = salt[(round + j) % salt.length]
            else:
                saltByte = 0                         // DEFAULT = 0x00, NOT 0x52

            mixed  = prev ^ curr ^ next ^ saltByte
            mixed ^= (round % 256)                   // EXTRA: round-dependent XOR
            temp[j] = sBox[mixed & 0xFF]             // S-box applied AFTER mixing

        derived = temp      // copy temp → derived for next round

    return derived
```

### 关键常量（来自堆）

| 常量                      | 堆地址 | 值       | 用途                             |
| ------------------------- | ------ | -------- | -------------------------------- |
| `__const_SystemInt32_0`   | 24     | **256**  | 取模运算：`round % 256`          |
| `__const_SystemInt32_256` | 551    | **255**  | 位掩码：`mixed & 0xFF`           |
| `__const_SystemInt32_257` | 577    | **1000** | 总轮数                           |
| `__const_SystemInt32_34`  | —      | **31**   | 前一字节偏移：`(j + 31) % 32`    |
| `__const_SystemInt32_35`  | —      | **32**   | 派生密钥长度 / 模数              |
| `__const_SystemByte_82`   | 206    | **0**    | 默认盐字节（当 salt 为 null 时） |

### 单次混合迭代的指令级跟踪

从原始操作码（指令 23916–24260）：

```text
23916  ToInt32(prev)            → int_32
23940  ToInt32(curr)            → int_33
23988  int_32 XOR int_33        → int_34        // prev ^ curr
24012  ToInt32(next)            → int_35
24044  int_34 XOR int_35        → int_36        // (prev ^ curr) ^ next
24068  ToInt32(saltByte)        → int_37
24100  int_36 XOR int_37        → int_38        // prev ^ curr ^ next ^ saltByte
24132  round % 256              → int_39        // round-dependent term
24164  int_38 XOR int_39        → mixed         // prev ^ curr ^ next ^ saltByte ^ (round%256)
24196  mixed AND 255            → int_40        // mask to byte range
24228  sBox[int_40]             → byte_5        // S-box substitution
24260  temp[j] = byte_5                         // store result
```

---

## 3. 密钥派生 — 非硬编码

AES-256 密钥是在**运行时派生**的，并非硬编码或存储的：

1. **DiscordRoleManager.\_start()** 从混淆的字节常量构建 32 字节口令和 32 字节盐
2. 每个字节通过 **XOR 去混淆**：`decoded[i] = (raw[i] ^ 163) ^ (i & 15)`
3. 解码后的字节被转换为 `char[]`，然后构造为 `String` 对象
4. 口令字符串直接传递给 CryptoAES256GPU
5. 盐字符串先经过 UTF-8 编码（`Encoding.UTF8.GetBytes()`）生成 `byte[]` 后再传递
6. 调用 `DeriveKey`，产生 32 字节密钥
7. 结果缓存为 `_cachedKey`，供后续解密调用使用

32 字节硬编码的字节常量构成了**混淆输入**。经过 XOR 去混淆后，它们变为 ASCII 口令和盐字符串。最终的 32 字节 AES 密钥由 1000 轮迭代混合加 S-box 替换产生。

### UTF-8 编码的影响

XOR 去混淆后，所有解码值都落在 ASCII 范围（32–122）内。每个字符编码为**单个 UTF-8 字节**：

- 原始口令：32 个混淆字节 → XOR 解码 → 32 个 ASCII 字符 → `UTF8.GetBytes()` → **32 字节**
- 原始盐：32 个混淆字节 → XOR 解码 → 32 个 ASCII 字符 → `UTF8.GetBytes()` → **32 字节**
- 组合数组：**64 字节**（口令字节 ∥ 盐字节）
- 初始派生密钥：`derived[i] = combined[i % 64]`，i ∈ [0, 31]

### 正确的派生密钥

```text
Passphrase: "m4EdEzCJVqIyRc6pfQL3k0SH6RIYdtIY"
Salt:       "QFFtTqCrP0fAzB1iu2uw02KAmtZu0Iba"
Key (hex):  f2ebf5452421480686863c3e7c6664ae1e6d416c2b66abbcbc8175f3ce0e827a
```

已通过成功解密来自 `https://gamerexde.github.io/trickforge-public/roles.txt` 的实时数据验证。

---

## 4. 口令与盐值

### 原始口令字节（32 字节）

在 DiscordRoleManager.\_start() 的指令 6448–7904 处构建：

| 索引 | 字节常量 | 堆地址 | 值      | 索引 | 字节常量 | 堆地址 | 值      |
| ---- | -------- | ------ | ------- | ---- | -------- | ------ | ------- |
| 0    | byte_0   | 104    | **206** | 16   | byte_14  | 132    | **197** |
| 1    | byte_1   | 105    | **150** | 17   | byte_15  | 134    | **243** |
| 2    | byte_2   | 106    | **228** | 18   | byte_16  | 136    | **237** |
| 3    | byte_3   | 108    | **196** | 19   | byte_17  | 138    | **147** |
| 4    | byte_4   | 110    | **226** | 20   | byte_18  | 140    | **204** |
| 5    | byte_5   | 112    | **220** | 21   | byte_1   | 105    | **150** |
| 6    | byte_6   | 114    | **230** | 22   | byte_19  | 143    | **246** |
| 7    | byte_7   | 116    | **238** | 23   | byte_20  | 145    | **236** |
| 8    | byte_8   | 118    | **253** | 24   | byte_21  | 147    | **157** |
| 9    | byte_9   | 120    | **219** | 25   | byte_22  | 149    | **248** |
| 10   | byte_10  | 122    | **224** | 26   | byte_10  | 122    | **224** |
| 11   | byte_11  | 124    | **209** | 27   | byte_23  | 152    | **241** |
| 12   | byte_8   | 118    | **253** | 28   | byte_24  | 154    | **203** |
| 13   | byte_12  | 127    | **205** | 29   | byte_25  | 156    | **218** |
| 14   | byte_13  | 129    | **155** | 30   | byte_2   | 106    | **228** |
| 15   | byte_5   | 112    | **220** | 31   | byte_26  | 159    | **245** |

**口令数组：**

```text
[206, 150, 228, 196, 226, 220, 230, 238, 253, 219, 224, 209, 253, 205, 155, 220,
 197, 243, 237, 147, 204, 150, 246, 236, 157, 248, 224, 241, 203, 218, 228, 245]
```

十六进制：`CE 96 E4 C4 E2 DC E6 EE FD DB E0 D1 FD CD 9B DC C5 F3 ED 93 CC 96 F6 EC 9D F8 E0 F1 CB DA E4 F5`

### 原始盐字节（32 字节）

在指令 7948–9424 处构建：

| 索引 | 字节常量 | 堆地址 | 值      | 索引 | 字节常量 | 堆地址 | 值      |
| ---- | -------- | ------ | ------- | ---- | -------- | ------ | ------- |
| 0    | byte_27  | 161    | **242** | 16   | byte_31  | 165    | **214** |
| 1    | byte_2   | 106    | **228** | 17   | byte_38  | 172    | **144** |
| 2    | byte_28  | 162    | **231** | 18   | byte_29  | 163    | **212** |
| 3    | byte_29  | 163    | **212** | 19   | byte_30  | 164    | **215** |
| 4    | byte_15  | 134    | **243** | 20   | byte_39  | 173    | **151** |
| 5    | byte_30  | 164    | **215** | 21   | byte_40  | 174    | **148** |
| 6    | byte_6   | 114    | **230** | 22   | byte_7   | 116    | **238** |
| 7    | byte_31  | 165    | **214** | 23   | byte_41  | 175    | **229** |
| 8    | byte_32  | 166    | **251** | 24   | byte_42  | 176    | **198** |
| 9    | byte_33  | 167    | **154** | 25   | byte_43  | 177    | **222** |
| 10   | byte_34  | 168    | **207** | 26   | byte_15  | 134    | **243** |
| 11   | byte_35  | 169    | **233** | 27   | byte_44  | 178    | **221** |
| 12   | byte_36  | 170    | **213** | 28   | byte_45  | 179    | **159** |
| 13   | byte_20  | 145    | **236** | 29   | byte_28  | 162    | **231** |
| 14   | byte_37  | 171    | **156** | 30   | byte_34  | 168    | **207** |
| 15   | byte_14  | 132    | **197** | 31   | byte_12  | 127    | **205** |

**盐数组：**

```text
[242, 228, 231, 212, 243, 215, 230, 214, 251, 154, 207, 233, 213, 236, 156, 197,
 214, 144, 212, 215, 151, 148, 238, 229, 198, 222, 243, 221, 159, 231, 207, 205]
```

十六进制：`F2 E4 E7 D4 F3 D7 E6 D6 FB 9A CF E9 D5 EC 9C C5 D6 90 D4 D7 97 94 EE E5 C6 DE F3 DD 9F E7 CF CD`

### XOR 去混淆

上面显示的原始字节数组是**经过混淆的**。在运行时，每个字节在使用前进行解码：

```text
decoded[i] = (raw[i] ^ 163) ^ (i & 15)
```

这在 DiscordRoleManager.\_start() 中通过地址 7500–7920（口令）和 9000–9430（盐）处的 IL 指令实现。常量 `163` 和 `15` 分别来自 `__const_SystemInt32_33` 和 `__const_SystemInt32_16`。

**解码后的口令**（32 个 ASCII 字符）：

```text
Raw:     [206, 150, 228, 196, 226, 220, 230, 238, 253, 219, 224, 209, 253, 205, 155, 220,
          197, 243, 237, 147, 204, 150, 246, 236, 157, 248, 224, 241, 203, 218, 228, 245]
Decoded: m  4  E  d  E  z  C  J  V  q  I  y  R  c  6  p  f  Q  L  3  k  0  S  H  6  R  I  Y  d  t  I  Y
String:  "m4EdEzCJVqIyRc6pfQL3k0SH6RIYdtIY"
```

**解码后的盐**（32 个 ASCII 字符）：

```text
Raw:     [242, 228, 231, 212, 243, 215, 230, 214, 251, 154, 207, 233, 213, 236, 156, 197,
          214, 144, 212, 215, 151, 148, 238, 229, 198, 222, 243, 221, 159, 231, 207, 205]
Decoded: Q  F  F  t  T  q  C  r  P  0  f  A  z  B  1  i  u  2  u  w  0  2  K  A  m  t  Z  u  0  I  b  a
String:  "QFFtTqCrP0fAzB1iu2uw02KAmtZu0Iba"
```

> 注意：两个数组在不同位置复用了字节常量（例如 `byte_8` 在口令索引 8 和 12 处使用；`byte_15` 在盐索引 4 和 26 处使用）。这是编译器对相同字面值的去重优化。

---

## 5. ExpandKey / KeyExpansion（密钥扩展）

**ExpandKey 并未被跳过。** 它在 `DeriveKey` 完成后由 `DecryptStringGPU` 正常调用。

### KeyExpansion 参数

| 参数           | 常量                     | 值           |
| -------------- | ------------------------ | ------------ |
| Nk（密钥字数） | `__const_SystemInt32_12` | **8**        |
| Nr（轮数）     | `__const_SystemInt32_18` | **14**       |
| 总字数         | `4 × (Nr + 1)`           | **60**       |
| 扩展密钥大小   | `4 × 60`                 | **240 字节** |

### 算法

标准 AES-256 密钥调度：

```text
KeyExpansion(key: byte[32]) → byte[240]:
    expandedKey = new byte[240]

    // Copy original key
    for i = 0 to 31:
        expandedKey[i] = key[i]

    // Expand
    for i = Nk to totalWords-1:
        offset = i * 4
        prevOffset = (i - 1) * 4
        nkBackOffset = (i - Nk) * 4

        t0..t3 = expandedKey[prevOffset..prevOffset+3]

        if i % Nk == 0:
            // RotWord: rotate [t0,t1,t2,t3] → [t1,t2,t3,t0]
            tmp = t0
            t0 = sBox[t1]; t1 = sBox[t2]; t2 = sBox[t3]; t3 = sBox[tmp]
            t0 ^= rcon[i / Nk - 1]     // XOR with round constant

        else if i % Nk == 4:           // AES-256 specific
            // SubWord only
            t0 = sBox[t0]; t1 = sBox[t1]; t2 = sBox[t2]; t3 = sBox[t3]

        // XOR with key Nk positions back
        expandedKey[offset+0] = t0 ^ expandedKey[nkBackOffset+0]
        expandedKey[offset+1] = t1 ^ expandedKey[nkBackOffset+1]
        expandedKey[offset+2] = t2 ^ expandedKey[nkBackOffset+2]
        expandedKey[offset+3] = t3 ^ expandedKey[nkBackOffset+3]

    return expandedKey
```

此处使用的 S-box 是**标准 AES S-box**（已验证：`sBox[0]=0x63`、`sBox[1]=0x7C`、`sBox[2]=0x77`、`sBox[3]=0x7B`……）。

rcon 表为标准值：`[0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36]`。

---

## 6. 完整解密流程

### 阶段 1：初始化（DiscordRoleManager.\_start）

```text
1. Construct passphrase byte[32] from obfuscated heap constants
2. XOR-deobfuscate each byte: decoded[i] = (raw[i] ^ 163) ^ (i & 15)
3. Cast decoded bytes → char[], build String (passphrase = "m4EdEzCJVqIyRc6pfQL3k0SH6RIYdtIY")
4. Construct salt byte[32] from obfuscated heap constants
5. XOR-deobfuscate each byte (same formula)
6. Cast decoded bytes → char[], build String (saltString = "QFFtTqCrP0fAzB1iu2uw02KAmtZu0Iba")
7. saltBytes = Encoding.UTF8.GetBytes(saltString)           → 32 bytes (ASCII)
8. Set CryptoAES256GPU.passphrase = passphrase (string)
9. Set CryptoAES256GPU.salt = saltBytes (byte[])
10. Call CryptoAES256GPU.DeriveKey()
11. _cachedKey = GetProgramVariable("__0___0_DeriveKey__ret")
12. Schedule data fetch
```

### 阶段 2：数据获取

```text
1. Download from trustedRoleDataUrl:
   "https://gamerexde.github.io/trickforge-public/roles.txt"
   (fallback: "https://api.trickforgestudios.com/api/v1/roles/vrc/all")
2. On success → _DecryptFetchedData() (if useEncryption=true)
              → _ProcessParse() (if useEncryption=false)
```

### 阶段 3：解密（CryptoAES256GPU.DecryptStringGPU）

```text
1. base64Data = received encrypted string
2. rawBytes = Convert.FromBase64String(base64Data)
3. iv = rawBytes[0..15]                            → 16 bytes (IV)
4. ciphertext = rawBytes[16..]                     → remaining bytes
5. expandedKey = ExpandKey(_cachedKey)              → 240 bytes
6. Upload expandedKey + ciphertext to GPU compute shader
7. GPU performs AES-256 ECB decryption on all 16-byte blocks in parallel
8. Read back ECB-decrypted blocks via AsyncGPUReadback
```

### 阶段 4：CBC 与最终处理（\_ContinueCBC）

```text
1. For each 16-byte block i (starting from last):
     plainBlock[i] = ecbDecrypted[i] XOR ciphertext[i-1]
   First block:
     plainBlock[0] = ecbDecrypted[0] XOR iv

2. Remove PKCS7 padding:
     padLen = plaintext[last]
     plaintext = plaintext[0 .. length-padLen-1]

3. result = Encoding.UTF8.GetString(plaintext)
4. Return result via callback to DiscordRoleManager._OnGPUDecryptionComplete
```

### 架构图

```text
DiscordRoleManager                    CryptoAES256GPU
─────────────────                    ────────────────
_start()
  │
  ├─ 构建口令（32 个混淆字节 → XOR 解码 → 32 个 ASCII 字符）
  ├─ 构建盐（32 个混淆字节 → XOR 解码 → 32 个 ASCII 字符）
  ├─ UTF8.GetBytes(salt) → 32 字节（ASCII）
  ├─ SetProgramVariable("passphrase", string)
  ├─ SetProgramVariable("salt", byte[])
  ├─ SendCustomEvent("DeriveKey") ──→ __0_DeriveKey()
  │                                    ├─ UTF8.GetBytes(passphrase) → 32 字节（ASCII）
  │                                    ├─ combined = 口令 ∥ 盐（64 字节）
  │                                    ├─ derived[i] = combined[i % 64]
  │                                    ├─ 1000 轮混合
  │                                    └─ 返回 derived（32 字节）
  ├─ _cachedKey = GetProgramVariable("__0___0_DeriveKey__ret")
  ├─ _FetchRoleData() ──→ HTTP GET
  │
_onStringLoadSuccess()
  ├─ _DecryptFetchedData()
  │   ├─ SetProgramVariable("__0_key__param", _cachedKey)
  │   ├─ SetProgramVariable("base64", encryptedData)
  │   └─ SendCustomEvent("DecryptStringGPU") ──→ __0_DecryptStringGPU()
  │                                                ├─ Base64 解码
  │                                                ├─ 分离 IV / 密文
  │                                                ├─ __0_ExpandKey(key)
  │                                                │   └─ __0_KeyExpansion(key)
  │                                                ├─ GPU ECB 分发
  │                                                ├─ _onAsyncGpuReadbackComplete()
  │                                                └─ _ContinueCBC()
  │                                                    ├─ CBC 异或
  │                                                    ├─ PKCS7 去填充
  │                                                    └─ UTF8 解码 → 明文
  │                                                        │
_OnGPUDecryptionComplete() ←────────────────────────────────┘
  └─ _ProcessParse(plaintext)
```

---

## 附录：序列化配置默认值

来自 DiscordRoleManager 的 `variablesjs`：

| 变量                        | 值                                                        |
| --------------------------- | --------------------------------------------------------- |
| `trustedroleDataUrl`        | `https://gamerexde.github.io/trickforge-public/roles.txt` |
| `untrustedroleDataUrl`      | `https://api.trickforgestudios.com/api/v1/roles/vrc/all`  |
| `useEncryption`             | `true`                                                    |
| `LOCAL_STAFF_DISPLAY_NAMES` | `["KittehKun", "Godfall", "svenssko", "Gamerexde"]`       |
| `guessIt`                   | `"AKIxUr2cbklAc9yDoXqjovAPyhkIQFPu"`                      |
| `initialRetryDelay`         | `5.0`                                                     |
| `maxRetryDelay`             | `60.0`                                                    |
| `maxRetries`                | `5`                                                       |
