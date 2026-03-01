# AES-256 Encryption Implementation — Complete IL-Level Analysis

## Table of Contents

1. [Programs & Functions](#1-programs--functions)
2. [DeriveKey Algorithm (from IL)](#2-derivekey-algorithm-from-il)
3. [IL vs JavaScript — Critical Differences](#3-il-vs-javascript--critical-differences)
4. [Key Derivation — Not Hardcoded](#4-key-derivation--not-hardcoded)
5. [Passphrase & Salt Values](#5-passphrase--salt-values)
6. [ExpandKey / KeyExpansion](#6-expandkey--keyexpansion)
7. [Complete Decryption Flow](#7-complete-decryption-flow)

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

```
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
| `__const_SystemInt32_34`  | —            | **31**   | Prev offset: `(j + 31) % 32`          |
| `__const_SystemInt32_35`  | —            | **32**   | Derived key length / modulus          |
| `__const_SystemByte_82`   | 206          | **0**    | Default salt byte (when salt is null) |

### Instruction-Level Trace of One Mixing Iteration

From raw opcode (instructions 23916–24260):

```
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

## 3. IL vs JavaScript — Critical Differences

The JavaScript implementation provided **WILL NOT** produce the same derived key. There are **5 algorithmic differences**:

### Difference 1: S-box Application Position

|             | IL (Actual)                                                      | JavaScript (Reference)                                            |
| ----------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Where**   | AFTER all mixing                                                 | BEFORE mixing (applied to `curr`)                                 |
| **Formula** | `temp[j] = sBox[(prev ^ curr ^ next ^ salt ^ round_xor) & 0xFF]` | `mixed = prev ^ SBOX[curr] ^ next ^ salt; temp[j] = mixed & 0xFF` |

This is the most impactful difference. The IL applies the nonlinear S-box transformation to the fully mixed value, while the JS only transforms `curr` before linear XOR mixing.

### Difference 2: Extra Round-Dependent XOR

|          | IL (Actual)              | JavaScript (Reference) |
| -------- | ------------------------ | ---------------------- |
| **Term** | `mixed ^= (round % 256)` | _(absent)_             |

The IL injects the current round number (mod 256) as an additional XOR term. This makes each round's mixing unique even when the byte neighborhood is identical.

### Difference 3: Salt Byte Indexing

|           | IL (Actual)                       | JavaScript (Reference)  |
| --------- | --------------------------------- | ----------------------- |
| **Index** | `salt[(round + j) % salt.length]` | `salt[j % salt.length]` |

The IL includes the round number in the salt index, causing a different salt byte to be used at the same position `j` across different rounds. The JS always uses the same salt byte for position `j`.

### Difference 4: Default Salt Byte (No-Salt Fallback)

|           | IL (Actual) | JavaScript (Reference) |
| --------- | ----------- | ---------------------- |
| **Value** | `0x00` (0)  | `0x52` (82)            |

Verified from CryptoAES256GPU heap: `__const_SystemByte_82` at address 206 = value **0**.

### Difference 5: Salt Fallback Condition

|               | IL (Actual)                                  | JavaScript (Reference)              |
| ------------- | -------------------------------------------- | ----------------------------------- |
| **Condition** | `salt != null && salt.length > 0`            | `saltBytes && j < saltBytes.length` |
| **Effect**    | Uses salt for ALL j positions if salt exists | Only uses salt when j < salt.length |

In the IL, if salt exists and is non-empty, it's used for every byte position (with wrapping). In JS, positions beyond salt length fall back to 0x52.

---

## 4. Key Derivation — Not Hardcoded

The AES-256 key is **derived at runtime**, not hardcoded or stored:

1. **DiscordRoleManager.\_start()** constructs a 32-byte passphrase and 32-byte salt from obfuscated byte constants
2. Both byte arrays are cast element-by-element to `char[]`, then constructed into `String` objects
3. The passphrase string is passed directly to CryptoAES256GPU
4. The salt string is first UTF-8 encoded (`Encoding.UTF8.GetBytes()`) to produce a `byte[]` before passing
5. `DeriveKey` is called, producing a 32-byte key
6. The result is cached as `_cachedKey` for subsequent decryption calls

The 32-byte hardcoded constants form the **input passphrase and salt**, not the key itself. The key is produced by 1000 rounds of iterative mixing with S-box substitution.

### UTF-8 Encoding Impact

Since all passphrase/salt byte values are > 127 (range 144–253), each value when cast to a C# `char` (UTF-16 code unit) produces a character in the U+0080–U+00FF range. When UTF-8 encoded, each such character becomes **2 bytes**:

- Original passphrase: 32 bytes → 32 chars → string → `UTF8.GetBytes()` → **64 bytes** used by DeriveKey
- Original salt: 32 bytes → 32 chars → string → `UTF8.GetBytes()` → **64 bytes** passed as salt parameter
- Combined array: **128 bytes** (passphrase bytes ∥ salt bytes)
- Initial derived key: `derived[i] = combined[i % 128]` for i ∈ [0, 31]

---

## 5. Passphrase & Salt Values

### Raw Passphrase Bytes (32 bytes)

Constructed in DiscordRoleManager.\_start() at instructions 6448–7904:

| Index | Byte Const | Heap Addr | Value   | Index | Byte Const | Heap Addr | Value   |
| ----- | ---------- | --------- | ------- | ----- | ---------- | --------- | ------- |
| 0     | byte_0     | 104       | **206** | 16    | byte_14    | 132       | **197** |
| 1     | byte_1     | 105       | **150** | 17    | byte_15    | 134       | **243** |
| 2     | byte_2     | 106       | **228** | 18    | byte_16    | 136       | **237** |
| 3     | byte_3     | 108       | **196** | 19    | byte_17    | 138       | **147** |
| 4     | byte_4     | 110       | **226** | 20    | byte_18    | 140       | **204** |
| 5     | byte_5     | 112       | **220** | 21    | byte_1     | 105       | **150** |
| 6     | byte_6     | 114       | **230** | 22    | byte_19    | 143       | **246** |
| 7     | byte_7     | 116       | **238** | 23    | byte_20    | 145       | **236** |
| 8     | byte_8     | 118       | **253** | 24    | byte_21    | 147       | **157** |
| 9     | byte_9     | 120       | **219** | 25    | byte_22    | 149       | **248** |
| 10    | byte_10    | 122       | **224** | 26    | byte_10    | 122       | **224** |
| 11    | byte_11    | 124       | **209** | 27    | byte_23    | 152       | **241** |
| 12    | byte_8     | 118       | **253** | 28    | byte_24    | 154       | **203** |
| 13    | byte_12    | 127       | **205** | 29    | byte_25    | 156       | **218** |
| 14    | byte_13    | 129       | **155** | 30    | byte_2     | 106       | **228** |
| 15    | byte_5     | 112       | **220** | 31    | byte_26    | 159       | **245** |

**Passphrase array:**

```
[206, 150, 228, 196, 226, 220, 230, 238, 253, 219, 224, 209, 253, 205, 155, 220,
 197, 243, 237, 147, 204, 150, 246, 236, 157, 248, 224, 241, 203, 218, 228, 245]
```

Hex: `CE 96 E4 C4 E2 DC E6 EE FD DB E0 D1 FD CD 9B DC C5 F3 ED 93 CC 96 F6 EC 9D F8 E0 F1 CB DA E4 F5`

### Raw Salt Bytes (32 bytes)

Constructed at instructions 7948–9424:

| Index | Byte Const | Heap Addr | Value   | Index | Byte Const | Heap Addr | Value   |
| ----- | ---------- | --------- | ------- | ----- | ---------- | --------- | ------- |
| 0     | byte_27    | 161       | **242** | 16    | byte_31    | 165       | **214** |
| 1     | byte_2     | 106       | **228** | 17    | byte_38    | 172       | **144** |
| 2     | byte_28    | 162       | **231** | 18    | byte_29    | 163       | **212** |
| 3     | byte_29    | 163       | **212** | 19    | byte_30    | 164       | **215** |
| 4     | byte_15    | 134       | **243** | 20    | byte_39    | 173       | **151** |
| 5     | byte_30    | 164       | **215** | 21    | byte_40    | 174       | **148** |
| 6     | byte_6     | 114       | **230** | 22    | byte_7     | 116       | **238** |
| 7     | byte_31    | 165       | **214** | 23    | byte_41    | 175       | **229** |
| 8     | byte_32    | 166       | **251** | 24    | byte_42    | 176       | **198** |
| 9     | byte_33    | 167       | **154** | 25    | byte_43    | 177       | **222** |
| 10    | byte_34    | 168       | **207** | 26    | byte_15    | 134       | **243** |
| 11    | byte_35    | 169       | **233** | 27    | byte_44    | 178       | **221** |
| 12    | byte_36    | 170       | **213** | 28    | byte_45    | 179       | **159** |
| 13    | byte_20    | 145       | **236** | 29    | byte_28    | 162       | **231** |
| 14    | byte_37    | 171       | **156** | 30    | byte_34    | 168       | **207** |
| 15    | byte_14    | 132       | **197** | 31    | byte_12    | 127       | **205** |

**Salt array:**

```
[242, 228, 231, 212, 243, 215, 230, 214, 251, 154, 207, 233, 213, 236, 156, 197,
 214, 144, 212, 215, 151, 148, 238, 229, 198, 222, 243, 221, 159, 231, 207, 205]
```

Hex: `F2 E4 E7 D4 F3 D7 E6 D6 FB 9A CF E9 D5 EC 9C C5 D6 90 D4 D7 97 94 EE E5 C6 DE F3 DD 9F E7 CF CD`

### Obfuscation Note

Both arrays reuse byte constants across positions (e.g., `byte_8` appears at passphrase indices 8 and 12; `byte_15` appears at salt indices 4 and 26). This is likely compiler deduplication of identical literal values, not intentional obfuscation.

---

## 6. ExpandKey / KeyExpansion

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

```
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

## 7. Complete Decryption Flow

### Phase 1: Initialization (DiscordRoleManager.\_start)

```
1. Construct passphrase byte[32] from obfuscated heap constants
2. Cast each byte → char, build char[] → String (passphrase)
3. Construct salt byte[32] from obfuscated heap constants
4. Cast each byte → char, build char[] → String (saltString)
5. saltBytes = Encoding.UTF8.GetBytes(saltString)           → 64 bytes
6. Set CryptoAES256GPU.passphrase = passphrase (string)
7. Set CryptoAES256GPU.salt = saltBytes (byte[])
8. Call CryptoAES256GPU.DeriveKey()
9. _cachedKey = DeriveKey result (byte[32])
10. Schedule data fetch
```

### Phase 2: Data Fetch

```
1. Download from trustedRoleDataUrl:
   "https://gamerexde.github.io/trickforge-public/roles.txt"
   (fallback: "https://api.trickforgestudios.com/api/v1/roles/vrc/all")
2. On success → _DecryptFetchedData() (if useEncryption=true)
              → _ProcessParse() (if useEncryption=false)
```

### Phase 3: Decryption (CryptoAES256GPU.DecryptStringGPU)

```
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

```
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

```
DiscordRoleManager                    CryptoAES256GPU
─────────────────                    ────────────────
_start()
  │
  ├─ Build passphrase (32 bytes)
  ├─ Build salt (32 bytes)
  ├─ UTF8.GetBytes(salt) → 64 bytes
  ├─ SetProgramVariable("passphrase", string)
  ├─ SetProgramVariable("salt", byte[])
  ├─ SendCustomEvent("DeriveKey") ──→ __0_DeriveKey()
  │                                    ├─ UTF8.GetBytes(passphrase) → 64 bytes
  │                                    ├─ combined = passphrase ∥ salt (128 bytes)
  │                                    ├─ derived[i] = combined[i % 128]
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
| `initialRetryDelay`         | `5.0`                                                     |
| `maxRetryDelay`             | `60.0`                                                    |
| `maxRetries`                | `5`                                                       |

> Note: `guessIt` at heap address 82 is a separate serialized string field — it is **not** the passphrase and is not used in the derivation process. The actual passphrase and salt are constructed from inline byte constants at runtime.
