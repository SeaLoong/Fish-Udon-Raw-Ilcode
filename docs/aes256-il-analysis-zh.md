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
| `__const_SystemInt32_34`  | —      | **255**  | 口令掩码 AND 位宽                |
| `__const_SystemInt32_35`  | —      | **96**   | 盐值 XOR 常量                    |
| `__const_SystemInt32_32`  | —      | **31**   | 盐值 AND 掩码                    |
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
2. 口令通过 **7 字节密钥因子 + 多项式掩码去混淆**：`decoded[i] = (raw[i] ^ k[i % 7]) ^ ((i * 15 + 69) & 255)`
3. 盐通过 **独立 XOR 去混淆**：`decoded[i] = (raw[i] ^ 96) ^ (i & 31)`
4. 解码后的字节被转换为 `char[]`，然后构造为 `String` 对象
5. 口令字符串直接传递给 CryptoAES256GPU
6. 盐字符串先经过 UTF-8 编码（`Encoding.UTF8.GetBytes()`）生成 `byte[]` 后再传递
7. 调用 `DeriveKey`，产生 32 字节密钥
8. 结果缓存为 `_cachedKey`，供后续解密调用使用

32 字节硬编码的字节常量构成了**混淆输入**。经过 XOR 去混淆后，它们变为 ASCII 口令和盐字符串。最终的 32 字节 AES 密钥由 1000 轮迭代混合加 S-box 替换产生。

### UTF-8 编码的影响

XOR 去混淆后，所有解码值都落在 ASCII 范围（32–122）内。每个字符编码为**单个 UTF-8 字节**：

- 原始口令：32 个混淆字节 → XOR 解码 → 32 个 ASCII 字符 → `UTF8.GetBytes()` → **32 字节**
- 原始盐：32 个混淆字节 → XOR 解码 → 32 个 ASCII 字符 → `UTF8.GetBytes()` → **32 字节**
- 组合数组：**64 字节**（口令字节 ∥ 盐字节）
- 初始派生密钥：`derived[i] = combined[i % 64]`，i ∈ [0, 31]

### 正确的派生密钥

```text
Passphrase: "iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe"
Salt:       "eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ"
Key (hex):  da42028b0b24a0a98e18b95e9b7d19d9dfd5ce3cc20316c530714ad3c7e712e1
```

已通过成功解密来自 `https://gamerexde.github.io/trickforge-public/roles.txt` 的实时数据验证。

---

## 4. 口令与盐值

### 口令去混淆方案

使用 **7 字节密钥因子数组 `k`** 和**多项式掩码**：

```text
k = [91, 13, 177, 166, 164, 151, 73]    // __const_SystemByte_32..37 + byte_9
decoded[i] = (raw[i] ^ k[i % 7]) ^ ((i * 15 + 69) & 255)
```

对应 IL 指令（opcode 8036–8300）：

```text
8036  k.Length → int_6
8060  i % int_6 → int_7                    // i % k.length
8092  k[int_7] → byte_1                    // k[i % k.length]
8140  ToInt32(byte_1) → int_8
8148  int_5 (=ToInt32(a[i]))
8172  int_5 XOR int_8 → int_9              // raw[i] ^ k[i%k.len]
8180  i * __const_SystemInt32_16(=15) → int_10   // i * 15
8220  int_10 + __const_SystemInt32_33(=69) → int_11  // i*15 + 69
8252  int_11 AND __const_SystemInt32_34(=255) → int_12  // (i*15+69) & 255
8300  int_9 XOR int_12 → int_13            // final decoded char
```

### 盐值去混淆方案

盐值使用**独立的、更简单的**公式（不使用密钥因子 k）：

```text
decoded[i] = (raw[i] ^ 96) ^ (i & 31)
```

对应 IL 指令（opcode 9696–9800）：

```text
9696  ToInt32(a[i]) → int_16
9720  int_16 XOR __const_SystemInt32_35(=96) → int_17   // raw[i] ^ 96
9752  i AND __const_SystemInt32_32(=31) → int_18         // i & 31
9800  int_17 XOR int_18 → int_19                         // final decoded char
```

### 去混淆常量

| 常量                      | 值       | 用途                    |
| ------------------------- | -------- | ----------------------- |
| `__const_SystemInt32_33`  | **69**   | 口令多项式掩码加法项    |
| `__const_SystemInt32_16`  | **15**   | 口令掩码乘数            |
| `__const_SystemInt32_34`  | **255**  | 口令掩码 AND 位宽       |
| `__const_SystemInt32_35`  | **96**   | 盐值 XOR 常量           |
| `__const_SystemInt32_32`  | **31**   | 盐值 AND 掩码           |

### 密钥因子 k（7 字节）

```text
Raw:     [91, 13, 177, 166, 164, 151, 73]
Hex:     5B 0D B1 A6 A4 97 49
```

从 `__const_SystemByte_32`（91）、`byte_9`（13）、`byte_33`（177）、`byte_34`（166）、`byte_35`（164）、`byte_36`（151）、`byte_37`（73）构建。

在 IL 中的构建位置为 opcode 7632–7824：
```text
7632  PUSH byte_32(=91)   → k[0]
7664  PUSH byte_9(=13)    → k[1]
7696  PUSH byte_33(=177)  → k[2]
7728  PUSH byte_34(=166)  → k[3]
7760  PUSH byte_35(=164)  → k[4]
7792  PUSH byte_36(=151)  → k[5]
7824  PUSH byte_37(=73)   → k[6]
```

### 原始口令字节（32 字节）

在 DiscordRoleManager.\_start() 的指令中构建，使用 **32 个独立的** `__const_SystemByte_0..31`：

```text
Raw:     [119, 26, 182, 140, 20, 72, 152, 190, 246, 13, 17, 45, 55, 14, 22, 31,
          181, 165, 189, 131, 116, 169, 187, 93, 82, 77, 47, 214, 217, 143, 238, 213]
Hex:     77 1A B6 8C 14 48 98 BE F6 0D 11 2D 37 0E 16 1F B5 A5 BD 83 74 A9 BB 5D 52 4D 2F D6 D9 8F EE D5
Decoded: i  C  d  X  1  O  N  K  F  p  l  c  Y  O  Z  4  1  G  J  v  L  r  9  r  Y  U  s  E  k  z  X  e
String:  "iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe"
```

### 原始盐字节（32 字节）

盐值数组中部分常量被复用（例如 `byte_43` 在索引 6 和 10、`byte_48` 在索引 12 和 20 处出现）：

```text
Raw:     [5, 20, 15, 52, 86, 40, 44, 10, 61, 89, 44, 56, 58, 59, 0, 42,
          17, 72, 26, 16, 58, 57, 5, 71, 59, 14, 67, 28, 27, 52, 20, 46]
Hex:     05 14 0F 34 56 28 2C 0A 3D 59 2C 38 3A 3B 00 2A 11 48 1A 10 3A 39 05 47 3B 0E 43 1C 1B 34 14 2E
Decoded: e  u  m  W  2  M  J  m  U  0  F  S  V  V  n  E  a  9  h  c  N  L  s  0  C  w  9  g  g  I  j  Q
String:  "eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ"
```

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
1. Construct passphrase byte[32] from obfuscated heap constants (byte_0..byte_31)
2. Construct key factor k[7] from byte_32, byte_9, byte_33..byte_37
3. Deobfuscate passphrase: decoded[i] = (raw[i] ^ k[i % 7]) ^ ((i * 15 + 69) & 255)
4. Cast decoded bytes → char[], build String (passphrase = "iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe")
5. Construct salt byte[32] from obfuscated heap constants (byte_38..byte_58 等)
6. Deobfuscate salt: decoded[i] = (raw[i] ^ 96) ^ (i & 31)
7. Cast decoded bytes → char[], build String (saltString = "eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ")
8. saltBytes = Encoding.UTF8.GetBytes(saltString)           → 32 bytes (ASCII)
9. Set CryptoAES256GPU.passphrase = passphrase (string)
10. Set CryptoAES256GPU.salt = saltBytes (byte[])
11. Call CryptoAES256GPU.DeriveKey()
12. _cachedKey = GetProgramVariable("__0___0_DeriveKey__ret")
13. Schedule data fetch
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
  ├─ 构建口令 a[32] 从 byte_0..byte_31
  ├─ 构建密钥因子 k[7] 从 byte_32, byte_9, byte_33..byte_37
  ├─ 口令去混淆: for i in 0..31:
  │     decoded[i] = (a[i] ^ k[i % 7]) ^ ((i * 15 + 69) & 255)
  ├─ passphrase = "iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe"
  │
  ├─ 构建盐 a[32] 从 byte_38, byte_4, byte_39..byte_58
  ├─ 盐去混淆: for i in 0..31:
  │     decoded[i] = (a[i] ^ 96) ^ (i & 31)
  ├─ saltStr = "eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ"
  ├─ saltBytes = UTF8.GetBytes(saltStr) → 32 bytes
  │
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
| `initialRetryDelay`         | `10.0`                                                    |
| `maxRetryDelay`             | `120.0`                                                   |
| `maxRetries`                | `5`                                                       |
