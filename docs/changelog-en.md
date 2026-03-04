# IL Code Changelog

English | [简体中文](changelog.md)

> This document records information about the Fish World Udon IL bytecode decompilation snapshot.

---

## 03-04 Snapshot

**Decompilation date**: March 4, 2025

| Metric         | Value      |
| -------------- | ---------- |
| Total programs | 172        |
| Object refs    | 4,359      |
| baseobject     | 29.82 MB   |
| functiondb     | 710.30 KB  |
| declibrary     | 22.42 MB   |

### Encryption Parameters 🔐

Encryption parameters for DiscordRoleManager (`8Bd1F9CA`):

| Parameter                | Value                                     |
| ------------------------ | ----------------------------------------- |
| Passphrase obfuscation   | `(raw[i] ^ k[i%7]) ^ ((i*15+69) & 255)`  |
| Salt obfuscation         | `(raw[i] ^ 96) ^ (i & 31)`               |
| Key factor k             | 7 bytes: `[91, 13, 177, 166, 164, 151, 73]` |
| Passphrase (plaintext)   | `iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe`       |
| Salt (plaintext)         | `eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ`       |
| Derived key (hex)        | `da42028b0b24a0a98e18b95e9b7d19d9dfd5ce3cc20316c530714ad3c7e712e1` |

Obfuscation scheme characteristics:
- Passphrase and salt use independent obfuscation formulas
- 7-byte key factor array participates in passphrase deobfuscation
- Passphrase uses polynomial mask `(i*15+69) & 255`
- Underlying AES-256-CBC decryption with DeriveKey using 1000-round S-box mixing

### IL Logic Changes (53 programs)

Among 172 programs, **53 programs have logic-level changes in altopcode**:

| Program  | Module                | diff lines | Change description                           |
| -------- | --------------------- | ---------- | -------------------------------------------- |
| `E2CD7e` | BoatController        | ~4648      | Integrated BoatSpawnManager, major refactor   |
| `8f6758` | PlayerInventoryData   | ~2315      | Added null checks, quest inventory integration |
| `355e2a` | FishingRod            | ~1572      | Interaction logic, quest item system integration |
| `472Eea` | EquipmentStats        | ~1316      | Buff manager integration, enchant calc update  |
| `fFd598` | PlayerData            | ~1198      | XP/leveling/display system refactor           |
| `CaaE9B` | FishingMinigame       | ~906       | Fishing minigame interaction rewrite          |
| `f655Ab` | NetworkSync           | ~546       | Network sync logic update                     |
| Other 46 | Various modules       | <500       | Function name normalization, offset fixes, etc. |

### Function Name Normalization

Public event method names across multiple programs were unified with `_` prefix:
- `OnClaimButtonClick` → `_OnClaimButtonClick`
- `StartGame` → `_StartGame`
- Compliant with UdonSharp coding conventions

### Module Categories

This snapshot contains **172 Udon programs** spanning these modules:

| Module Category | Representative Programs                                                           |
| --------------- | --------------------------------------------------------------------------------- |
| Fishing Core    | FishDatabase, FishSpawner, FishingRodController, FishBiteDetection, CatchMinigame |
| Equipment       | RodStats, BobberStats, LineStats, EnchantmentEntry, EquipmentManager              |
| Boats           | BoatController, BoatPhysics, BoatSkinManager, BoatEntry                           |
| Pets            | PetCompanion, PetStats, AFKPetController                                          |
| Economy         | ShopManager, InventoryManager, CurrencyManager, BountySystem                      |
| World           | WeatherSystem, DayNightCycle, ZoneManager, SeaEventManager, MusicController       |
| Player          | PlayerStats, LevelSystem, AchievementManager, TitleManager, DailyRewards          |
| Social & UI     | DialogueManager, Leaderboard, FishCodex, TutorialManager, NPCInteraction          |
| Security & Net  | CryptoAES256GPU, DiscordRoleManager, NetworkSync, SyncZone                        |
| VRC Infra       | VRCChair3, VRCStation, VRCPickup, etc.                                            |
