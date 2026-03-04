# AES-256 Encryption Implementation — Complete IL-Level Analysis

English | [简体中文](aes256-il-analysis-zh.md)

## Table of Contents

1. [Programs & Functions](#1-programs--functions)
2. [DeriveKey Algorithm (from IL)](#2-derivekey-algorithm-from-il)
3. [Key Derivation — Not Hardcoded](#3-key-derivation--not-hardcoded)
4. [Passphrase & Salt Values](#4-passphrase--salt-values)
5. [ExpandKey / KeyExpansion](#5-expandkey--keyexpansion)
6. [Complete Decryption Flow](#6-complete-decryption-flow)

---

## 1. Programs & Functions

### CryptoAES256GPU (`c012e9a27db8fea4dbc6cbbe374240c3`)

| Function                        | Purpose                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `_start()`                      | Initializes `sBox[256]`, `invSBox[256]`, `rcon[10]` — all standard AES tables       |
| `__0_DeriveKey()`               | Custom key derivation (passphrase + salt → 32-byte key)                             |
| `__0_ExpandKey()`               | Wrapper: ensures sBox is initialized, then calls KeyExpansion                       |
| `__0_KeyExpansion()`            | Standard AES-256 key schedule (Nk=8, Nr=14 → 240-byte expanded key)                 |
| `__0_DecryptStringGPU()`        | Entry point: base64 decode → IV/ciphertext split → key expansion → GPU ECB dispatch |
| `_onAsyncGpuReadbackComplete()` | Reads GPU output (Color32[] → bytes), starts CBC phase                              |
| `_ContinueNextChunk()`          | Multi-frame GPU decryption scheduler                                                |
| `_ContinueCBC()`                | Software CBC XOR + PKCS7 unpadding + UTF-8 decode → returns plaintext               |

### DiscordRoleManager (`eebb6f6c069f44a4399c68eb47834581`)

| Function                     | Purpose                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `_start()`                   | Builds obfuscated passphrase/salt, calls DeriveKey, caches derived key, triggers data fetch |
| `_FetchRoleData()`           | Downloads encrypted role data from URLs                                                     |
| `_onStringLoadSuccess()`     | Handles download result, routes to decrypt or parse                                         |
| `_DecryptFetchedData()`      | Passes cached key + encrypted data to DecryptStringGPU                                      |
| `_OnGPUDecryptionComplete()` | Receives decrypted plaintext, triggers parsing                                              |
| `_OnGPUDecryptionFailed()`   | Error handling for decryption failures                                                      |
| `_ProcessParse()`            | Parses decrypted JSON into role data                                                        |

---

## 2. DeriveKey Algorithm (from IL)

Reconstructed from raw Udon bytecode at instructions 22580–24572 in CryptoAES256GPU:

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

### Key Constants (from heap)

| Constant                  | Heap Address | Value    | Usage                                 |
| ------------------------- | ------------ | -------- | ------------------------------------- |
| `__const_SystemInt32_0`   | 24           | **256**  | Modulus: `round % 256`                |
| `__const_SystemInt32_256` | 551          | **255**  | Bitmask: `mixed & 0xFF`               |
| `__const_SystemInt32_257` | 577          | **1000** | Total rounds                          |
| `__const_SystemInt32_34`  | —            | **255**  | Passphrase mask AND width              |
| `__const_SystemInt32_35`  | —            | **96**   | Salt XOR constant                      |
| `__const_SystemInt32_32`  | —            | **31**   | Salt AND mask                          |
| `__const_SystemByte_82`   | 206          | **0**    | Default salt byte (when salt is null) |

### Instruction-Level Trace of One Mixing Iteration

From raw opcode (instructions 23916–24260):

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

## 3. Key Derivation — Not Hardcoded

The AES-256 key is **derived at runtime**, not hardcoded or stored:

1. **DiscordRoleManager.\_start()** constructs a 32-byte passphrase and 32-byte salt from obfuscated byte constants
2. Passphrase is deobfuscated using **7-byte key factor + polynomial mask**: `decoded[i] = (raw[i] ^ k[i % 7]) ^ ((i * 15 + 69) & 255)`
3. Salt is deobfuscated using an **independent XOR formula**: `decoded[i] = (raw[i] ^ 96) ^ (i & 31)`
4. Decoded bytes are cast to `char[]`, then constructed into `String` objects
5. The passphrase string is passed directly to CryptoAES256GPU
6. The salt string is first UTF-8 encoded (`Encoding.UTF8.GetBytes()`) to produce a `byte[]` before passing
7. `DeriveKey` is called, producing a 32-byte key
8. The result is cached as `_cachedKey` for subsequent decryption calls

The 32-byte hardcoded byte constants form the **obfuscated input**. After XOR deobfuscation, they become ASCII passphrase and salt strings. The final 32-byte AES key is produced by 1000 rounds of iterative mixing with S-box substitution.

### UTF-8 Encoding Impact

After XOR deobfuscation, all decoded values fall in the ASCII range (32–122). Each character encodes as a **single UTF-8 byte**:

- Original passphrase: 32 obfuscated bytes → XOR decode → 32 ASCII chars → `UTF8.GetBytes()` → **32 bytes**
- Original salt: 32 obfuscated bytes → XOR decode → 32 ASCII chars → `UTF8.GetBytes()` → **32 bytes**
- Combined array: **64 bytes** (passphrase bytes ∥ salt bytes)
- Initial derived key: `derived[i] = combined[i % 64]` for i ∈ [0, 31]

### Correct Derived Key

```text
Passphrase: "iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe"
Salt:       "eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ"
Key (hex):  da42028b0b24a0a98e18b95e9b7d19d9dfd5ce3cc20316c530714ad3c7e712e1
```

Verified by successfully decrypting live data from `https://gamerexde.github.io/trickforge-public/roles.txt`.

---

## 4. Passphrase & Salt Values

### Passphrase Deobfuscation Scheme

Uses a **7-byte key factor array `k`** and **polynomial mask**:

```text
k = [91, 13, 177, 166, 164, 151, 73]    // __const_SystemByte_32..37 + byte_9
decoded[i] = (raw[i] ^ k[i % 7]) ^ ((i * 15 + 69) & 255)
```

Corresponding IL instructions (opcode 8036–8300):

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

### Salt Deobfuscation Scheme

Salt uses an **independent, simpler** formula (does not use key factor k):

```text
decoded[i] = (raw[i] ^ 96) ^ (i & 31)
```

Corresponding IL instructions (opcode 9696–9800):

```text
9696  ToInt32(a[i]) → int_16
9720  int_16 XOR __const_SystemInt32_35(=96) → int_17   // raw[i] ^ 96
9752  i AND __const_SystemInt32_32(=31) → int_18         // i & 31
9800  int_17 XOR int_18 → int_19                         // final decoded char
```

### Deobfuscation Constants

| Constant                  | Value    | Purpose                       |
| ------------------------- | -------- | ----------------------------- |
| `__const_SystemInt32_33`  | **69**   | Passphrase polynomial addend  |
| `__const_SystemInt32_16`  | **15**   | Passphrase mask multiplier    |
| `__const_SystemInt32_34`  | **255**  | Passphrase mask AND width     |
| `__const_SystemInt32_35`  | **96**   | Salt XOR constant             |
| `__const_SystemInt32_32`  | **31**   | Salt AND mask                 |

### Key Factor k (7 bytes)

```text
Raw:     [91, 13, 177, 166, 164, 151, 73]
Hex:     5B 0D B1 A6 A4 97 49
```

Constructed from `__const_SystemByte_32` (91), `byte_9` (13), `byte_33` (177), `byte_34` (166), `byte_35` (164), `byte_36` (151), `byte_37` (73).

IL construction location at opcode 7632–7824:
```text
7632  PUSH byte_32(=91)   → k[0]
7664  PUSH byte_9(=13)    → k[1]
7696  PUSH byte_33(=177)  → k[2]
7728  PUSH byte_34(=166)  → k[3]
7760  PUSH byte_35(=164)  → k[4]
7792  PUSH byte_36(=151)  → k[5]
7824  PUSH byte_37(=73)   → k[6]
```

### Raw Passphrase Bytes (32 bytes)

Constructed in DiscordRoleManager.\_start() using **32 independent** `__const_SystemByte_0..31`:

```text
Raw:     [119, 26, 182, 140, 20, 72, 152, 190, 246, 13, 17, 45, 55, 14, 22, 31,
          181, 165, 189, 131, 116, 169, 187, 93, 82, 77, 47, 214, 217, 143, 238, 213]
Hex:     77 1A B6 8C 14 48 98 BE F6 0D 11 2D 37 0E 16 1F B5 A5 BD 83 74 A9 BB 5D 52 4D 2F D6 D9 8F EE D5
Decoded: i  C  d  X  1  O  N  K  F  p  l  c  Y  O  Z  4  1  G  J  v  L  r  9  r  Y  U  s  E  k  z  X  e
String:  "iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe"
```

### Raw Salt Bytes (32 bytes)

Some constants are reused across positions in the salt array (e.g., `byte_43` at indices 6 and 10, `byte_48` at indices 12 and 20):

```text
Raw:     [5, 20, 15, 52, 86, 40, 44, 10, 61, 89, 44, 56, 58, 59, 0, 42,
          17, 72, 26, 16, 58, 57, 5, 71, 59, 14, 67, 28, 27, 52, 20, 46]
Hex:     05 14 0F 34 56 28 2C 0A 3D 59 2C 38 3A 3B 00 2A 11 48 1A 10 3A 39 05 47 3B 0E 43 1C 1B 34 14 2E
Decoded: e  u  m  W  2  M  J  m  U  0  F  S  V  V  n  E  a  9  h  c  N  L  s  0  C  w  9  g  g  I  j  Q
String:  "eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ"
```

---

## 5. ExpandKey / KeyExpansion

**ExpandKey is NOT bypassed.** It is called normally by `DecryptStringGPU` after `DeriveKey` completes.

### KeyExpansion Parameters

| Parameter         | Constant                 | Value         |
| ----------------- | ------------------------ | ------------- |
| Nk (key words)    | `__const_SystemInt32_12` | **8**         |
| Nr (rounds)       | `__const_SystemInt32_18` | **14**        |
| Total words       | `4 × (Nr + 1)`           | **60**        |
| Expanded key size | `4 × 60`                 | **240 bytes** |

### Algorithm

Standard AES-256 key schedule:

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

The S-box used is the **standard AES S-box** (verified: `sBox[0]=0x63`, `sBox[1]=0x7C`, `sBox[2]=0x77`, `sBox[3]=0x7B`, ...).

The rcon table is standard: `[0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36]`.

---

## 6. Complete Decryption Flow

### Phase 1: Initialization (DiscordRoleManager.\_start)

```text
1. Construct passphrase byte[32] from obfuscated heap constants (byte_0..byte_31)
2. Construct key factor k[7] from byte_32, byte_9, byte_33..byte_37
3. Deobfuscate passphrase: decoded[i] = (raw[i] ^ k[i % 7]) ^ ((i * 15 + 69) & 255)
4. Cast decoded bytes → char[], build String (passphrase = "iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe")
5. Construct salt byte[32] from obfuscated heap constants (byte_38..byte_58 etc.)
6. Deobfuscate salt: decoded[i] = (raw[i] ^ 96) ^ (i & 31)
7. Cast decoded bytes → char[], build String (saltString = "eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ")
8. saltBytes = Encoding.UTF8.GetBytes(saltString)           → 32 bytes (ASCII)
9. Set CryptoAES256GPU.passphrase = passphrase (string)
10. Set CryptoAES256GPU.salt = saltBytes (byte[])
11. Call CryptoAES256GPU.DeriveKey()
12. _cachedKey = GetProgramVariable("__0___0_DeriveKey__ret")
13. Schedule data fetch
```

### Phase 2: Data Fetch

```text
1. Download from trustedRoleDataUrl:
   "https://gamerexde.github.io/trickforge-public/roles.txt"
   (fallback: "https://api.trickforgestudios.com/api/v1/roles/vrc/all")
2. On success → _DecryptFetchedData() (if useEncryption=true)
              → _ProcessParse() (if useEncryption=false)
```

### Phase 3: Decryption (CryptoAES256GPU.DecryptStringGPU)

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

### Phase 4: CBC & Finalization (\_ContinueCBC)

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

### Architecture Diagram

```text
DiscordRoleManager                    CryptoAES256GPU
─────────────────                    ────────────────
_start()
  │
  ├─ Build passphrase a[32] from byte_0..byte_31
  ├─ Build key factor k[7] from byte_32, byte_9, byte_33..byte_37
  ├─ Deobfuscate passphrase: for i in 0..31:
  │     decoded[i] = (a[i] ^ k[i % 7]) ^ ((i * 15 + 69) & 255)
  ├─ passphrase = "iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe"
  │
  ├─ Build salt a[32] from byte_38, byte_4, byte_39..byte_58
  ├─ Deobfuscate salt: for i in 0..31:
  │     decoded[i] = (a[i] ^ 96) ^ (i & 31)
  ├─ saltStr = "eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ"
  ├─ saltBytes = UTF8.GetBytes(saltStr) → 32 bytes
  │
  ├─ SetProgramVariable("passphrase", string)
  ├─ SetProgramVariable("salt", byte[])
  ├─ SendCustomEvent("DeriveKey") ──→ __0_DeriveKey()
  │                                    ├─ UTF8.GetBytes(passphrase) → 32 bytes (ASCII)
  │                                    ├─ combined = passphrase ∥ salt (64 bytes)
  │                                    ├─ derived[i] = combined[i % 64]
  │                                    ├─ 1000 rounds of mixing
  │                                    └─ return derived (32 bytes)
  ├─ _cachedKey = GetProgramVariable("__0___0_DeriveKey__ret")
  ├─ _FetchRoleData() ──→ HTTP GET
  │
_onStringLoadSuccess()
  ├─ _DecryptFetchedData()
  │   ├─ SetProgramVariable("__0_key__param", _cachedKey)
  │   ├─ SetProgramVariable("base64", encryptedData)
  │   └─ SendCustomEvent("DecryptStringGPU") ──→ __0_DecryptStringGPU()
  │                                                ├─ Base64 decode
  │                                                ├─ Split IV / ciphertext
  │                                                ├─ __0_ExpandKey(key)
  │                                                │   └─ __0_KeyExpansion(key)
  │                                                ├─ GPU ECB dispatch
  │                                                ├─ _onAsyncGpuReadbackComplete()
  │                                                └─ _ContinueCBC()
  │                                                    ├─ CBC XOR
  │                                                    ├─ PKCS7 unpad
  │                                                    └─ UTF8 decode → plaintext
  │                                                        │
_OnGPUDecryptionComplete() ←────────────────────────────────┘
  └─ _ProcessParse(plaintext)
```

---

## Appendix: Serialized Configuration Defaults

From DiscordRoleManager `variablesjs`:

| Variable                    | Value                                                     |
| --------------------------- | --------------------------------------------------------- |
| `trustedroleDataUrl`        | `https://gamerexde.github.io/trickforge-public/roles.txt` |
| `untrustedroleDataUrl`      | `https://api.trickforgestudios.com/api/v1/roles/vrc/all`  |
| `useEncryption`             | `true`                                                    |
| `LOCAL_STAFF_DISPLAY_NAMES` | `["KittehKun", "Godfall", "svenssko", "Gamerexde"]`       |
| `guessIt`                   | `"AKIxUr2cbklAc9yDoXqjovAPyhkIQFPu"`                      |
| `initialRetryDelay`         | `10.0`                                                    |
| `maxRetryDelay`             | `120.0`                                                   |
| `maxRetries`                | `5`                                                       |

> Note: `guessIt` at heap address 82 is a separate serialized string field — it is **not** the passphrase and is not used in the derivation process. The actual passphrase and salt are constructed from inline byte constants at runtime.
