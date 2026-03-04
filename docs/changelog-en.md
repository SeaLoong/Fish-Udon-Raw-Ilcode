# IL Code Changelog

English | [简体中文](changelog-zh.md)

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

---

## Game Data Changes

> The following data was derived by comparing extracted data between the 03-01 and 03-04 snapshots.

### Statistics Overview

| Metric         | 03-01   | 03-04   | Change     |
| -------------- | ------- | ------- | ---------- |
| warmup         | 64,346  | 67,821  | +3,475     |
| worlddata      | 2,047   | 2,072   | +25        |
| opcodealt      | 1,584   | 1,609   | +25        |
| execlog        | 692     | 639     | −53        |
| totaltime      | 119,684 | 108,659 | −11,025    |
| dirlist lines  | 1,716   | 1,721   | +5         |
| varlist lines  | 167,080 | 168,396 | +1,316     |
| functiondb ln  | 29,029  | 29,161  | +132       |

### Fish Economy Rebalance 🐟

**107 out of 134 fish species had price changes**, with an overall trend of **massive price reductions** (105 decreased, 2 increased, 27 unchanged).

The 27 unchanged fish are mainly Rarity 0 (Trash, 10 species) and Rarity 8 (Relic, 5 species), plus some lower-rarity fish.

Below is the complete list of all 107 price-changed fish grouped by rarity, showing `minPrice` changes (`maxPrice` changed proportionally):

#### Rarity 1 — Common (17 decreased, avg −13.8%)

| ID  | Fish Name              | Old minPrice | New minPrice | Change  |
| --- | ---------------------- | ------------ | ------------ | ------- |
| 4   | Perch                  | 14           | 12           | −14.3%  |
| 10  | Herring                | 14           | 12           | −14.3%  |
| 11  | GiltHead Bream         | 14           | 12           | −14.3%  |
| 22  | Bream                  | 14           | 12           | −14.3%  |
| 26  | Ide                    | 14           | 12           | −14.3%  |
| 29  | Roach                  | 14           | 12           | −14.3%  |
| 30  | Tench                  | 14           | 12           | −14.3%  |
| 45  | Goldfish               | 14           | 12           | −14.3%  |
| 55  | Haddock                | 14           | 12           | −14.3%  |
| 56  | Mackerel               | 14           | 12           | −14.3%  |
| 57  | Needlefish             | 14           | 12           | −14.3%  |
| 58  | Ocean Perch            | 14           | 12           | −14.3%  |
| 62  | Tarpon                 | 16           | 15           | −6.2%   |
| 67  | Flame Guppy            | 14           | 12           | −14.3%  |
| 70  | Magma Carp             | 14           | 12           | −14.3%  |
| 96  | Bluegill Sunfish       | 14           | 12           | −14.3%  |
| 113 | Tilefish               | 15           | 13           | −13.3%  |

#### Rarity 2 — Curious (17 decreased, avg −6.1%)

| ID  | Fish Name              | Old minPrice | New minPrice | Change |
| --- | ---------------------- | ------------ | ------------ | ------ |
| 1   | Cod                    | 25           | 24           | −4.0%  |
| 2   | Eel                    | 24           | 23           | −4.2%  |
| 7   | Atlantic Salmon        | 24           | 22           | −8.3%  |
| 28  | Rainbow Trout          | 24           | 22           | −8.3%  |
| 31  | Black Sharkminnow      | 24           | 22           | −8.3%  |
| 53  | Black Scorpionfish     | 24           | 22           | −8.3%  |
| 54  | Bluefish               | 24           | 23           | −4.2%  |
| 60  | Pollock                | 25           | 24           | −4.0%  |
| 61  | Snook                  | 25           | 24           | −4.0%  |
| 63  | Ashscale Trout         | 24           | 23           | −4.2%  |
| 64  | Basalt Eel             | 24           | 22           | −8.3%  |
| 97  | Bowfin                 | 24           | 23           | −4.2%  |
| 98  | Channel Catfish        | 25           | 24           | −4.0%  |
| 106 | Boxfish                | 24           | 22           | −8.3%  |
| 108 | Gulper Eel             | 25           | 24           | −4.0%  |
| 109 | Hawaiian Triggerfish   | 24           | 22           | −8.3%  |
| 111 | John Dory              | 24           | 22           | −8.3%  |

#### Rarity 3 — Abundant (17 decreased, avg −10.2%)

| ID  | Fish Name              | Old minPrice | New minPrice | Change  |
| --- | ---------------------- | ------------ | ------------ | ------- |
| 3   | Halibut                | 36           | 35           | −2.8%   |
| 8   | Albacore Tuna          | 35           | 32           | −8.6%   |
| 12  | Barracuda              | 34           | 31           | −8.8%   |
| 14  | Flying Fish            | 33           | 29           | −12.1%  |
| 15  | Mahi-Mahi              | 34           | 31           | −8.8%   |
| 16  | Lionfish               | 33           | 29           | −12.1%  |
| 18  | Northern Pufferfish    | 33           | 29           | −12.1%  |
| 19  | Crab                   | 33           | 29           | −12.1%  |
| 42  | Clownfish              | 33           | 29           | −12.1%  |
| 48  | Red Melon Discus       | 33           | 29           | −12.1%  |
| 49  | Regal Blue Tang        | 33           | 29           | −12.1%  |
| 51  | Snow Yellow Discus     | 33           | 29           | −12.1%  |
| 65  | Cinderfin              | 33           | 29           | −12.1%  |
| 72  | Obsidian Fish          | 34           | 30           | −11.8%  |
| 99  | Cottonmouth Snake      | 33           | 30           | −9.1%   |
| 101 | Frog                   | 33           | 29           | −12.1%  |
| 115 | Amberjack              | 37           | 36           | −2.7%   |

#### Rarity 4 — Elusive (17 decreased, avg −11.7%)

| ID  | Fish Name                    | Old minPrice | New minPrice | Change  |
| --- | ---------------------------- | ------------ | ------------ | ------- |
| 6   | Sailfish                     | 72           | 64           | −11.1%  |
| 17  | Parrotfish                   | 71           | 62           | −12.7%  |
| 20  | Alligator Gar                | 72           | 63           | −12.5%  |
| 32  | European Anglerfish          | 72           | 63           | −12.5%  |
| 34  | Goonch Catfish               | 72           | 63           | −12.5%  |
| 38  | Salween Rita Catfish         | 71           | 62           | −12.7%  |
| 39  | Siamese Giant Carp           | 72           | 64           | −11.1%  |
| 41  | Blobfish                     | 71           | 62           | −12.7%  |
| 43  | Common Stingray              | 72           | 63           | −12.5%  |
| 50  | Seahorse                     | 71           | 62           | −12.7%  |
| 52  | Sunfish                      | 79           | 76           | −3.8%   |
| 59  | Permit                       | 71           | 63           | −11.3%  |
| 66  | Crystal Pike                 | 71           | 62           | −12.7%  |
| 71  | Molten Angler                | 72           | 63           | −12.5%  |
| 94  | Alligator Snapping Turtle    | 72           | 64           | −11.1%  |
| 110 | Hogfish                      | 71           | 62           | −12.7%  |
| 114 | Wahoo                        | 72           | 63           | −12.5%  |

#### Rarity 5 — Exotic (11 decreased + 1 increased, avg −5.8%)

| ID  | Fish Name            | Old minPrice | New minPrice | Change |
| --- | -------------------- | ------------ | ------------ | ------ |
| 13  | Hammerhead Shark     | 975          | 923          | −5.3%  |
| 24  | Goliath Tigerfish    | 955          | 885          | −7.3%  |
| 36  | Oarfish              | 968          | 910          | −6.0%  |
| 46  | Ironfin Stalker      | 954          | 881          | −7.7%  |
| **47**  | **Manta Ray**    | **1,050**    | **1,069**    | **+1.8%** |
| 69  | Ifrit Barracuda      | 957          | 888          | −7.2%  |
| 73  | Pyrite Snapper       | 961          | 896          | −6.8%  |
| 95  | American Alligator   | 976          | 925          | −5.2%  |
| 102 | Giant Gharial        | 1,000        | 971          | −2.9%  |
| 107 | Frilled Shark        | 961          | 895          | −6.9%  |
| 112 | Pinnate Batfish      | 950          | 874          | −8.0%  |
| 127 | Brickfish            | 951          | 877          | −7.8%  |

#### Rarity 6 — Fabled (10 decreased, avg −22.1%)

| ID  | Fish Name            | Old minPrice | New minPrice | Change  |
| --- | -------------------- | ------------ | ------------ | ------- |
| 33  | Giant Squid          | 4,898        | 3,837        | −21.7%  |
| 40  | Great White Shark    | 5,236        | 4,378        | −16.4%  |
| 119 | Ancient Warriorfish  | 4,750        | 3,600        | −24.2%  |
| 120 | Venomous Watcher     | 4,750        | 3,600        | −24.2%  |
| 122 | Blind Bladefish      | 4,750        | 3,600        | −24.2%  |
| 124 | Armored Brutefish    | 4,767        | 3,628        | −23.9%  |
| 129 | Igneous Stingray     | 5,250        | 4,400        | −16.2%  |
| 130 | Red Demonfish        | 4,854        | 3,767        | −22.4%  |
| 131 | Red Dartfin          | 4,755        | 3,608        | −24.1%  |
| 133 | Humpback Gar         | 4,787        | 3,660        | −23.5%  |

#### Rarity 7 — Mythic (10 decreased, avg −29.8%)

| ID  | Fish Name              | Old minPrice | New minPrice | Change  |
| --- | ---------------------- | ------------ | ------------ | ------- |
| 68  | Hellmaw Grouper        | 11,416       | 7,868        | −31.1%  |
| 85  | Abyssal Serpentfish    | 11,425       | 7,880        | −31.0%  |
| 86  | Baby Megalodon         | 12,600       | 9,587        | −23.9%  |
| 87  | Celestial Whitefin     | 11,412       | 7,862        | −31.1%  |
| 88  | Shellonodon            | 11,832       | 8,472        | −28.4%  |
| 89  | Spineback Ray          | 11,448       | 7,914        | −30.9%  |
| 100 | Dreadshell Colossus    | 11,880       | 8,542        | −28.1%  |
| 123 | Three-Headed Salmon    | 11,400       | 7,844        | −31.2%  |
| 126 | Dragonfly Fish         | 11,400       | 7,845        | −31.2%  |
| 132 | Royal Bananafish       | 11,400       | 7,844        | −31.2%  |

#### Rarity 9 — Secret (5 decreased, avg −16.4%)

| ID  | Fish Name         | Old minPrice | New minPrice | Change  |
| --- | ----------------- | ------------ | ------------ | ------- |
| 74  | Wabubu Fish       | 17,100       | 13,995       | −18.2%  |
| 116 | Steve             | 17,100       | 13,995       | −18.2%  |
| 117 | Ragtime Frog      | 17,100       | 13,995       | −18.2%  |
| 121 | Decimated Fih     | 17,100       | 13,995       | −18.2%  |
| 128 | Luxian Camelshark | 18,900       | 17,105       | −9.5%   |

#### Rarity 10 — Ultimate (1 increased + 1 decreased)

| ID  | Fish Name            | Old minPrice | New minPrice | Change  |
| --- | -------------------- | ------------ | ------------ | ------- |
| **125** | **Catfish Emperor** | **35,000** | **38,500**   | **+10.0%** |
| 134 | Crab of Duality      | 35,000       | 31,500       | −10.0%  |

### Rod Balance Adjustments 🎣

| Rod                      | Changed Stats                                      |
| ------------------------ | -------------------------------------------------- |
| Speedy Rod (#7)          | luck: 20→1, expertise: 15→5, attractionRate: 65→60 |
| Fortunate Rod (#8)       | bigCatchRate: 77→65                                |
| Alien Rod (#10)          | luck: 50→55, expertise: 5→10, attractionRate: 40→45 |
| Rod of the Pharaoh (#12) | bigCatchRate: 30→35, luck: 200→222                 |

- Speedy Rod received a major nerf (luck −95%)
- Rod of the Pharaoh buffed with luck +11%
- Alien Rod stats redistributed (luck↑ expertise↑ attractionRate↑)

### Enchantment Nerfs ✨

| Enchantment       | Changes                                        |
| ----------------- | ---------------------------------------------- |
| Son of Kriptan    | strengthBonus: 50→10, expertiseBonus: 50→10    |
| The Night Watcher | strengthBonus: 30→10, expertiseBonus: 30→10    |

Both enchantments had their strength and expertise bonuses significantly nerfed (67%–80% reduction).

### Sea Event Spawn Weight Changes 🌊

5 sea events had their `spawnWeight` reduced from 100 to 1:

| Event    | Event Name        | Characteristics                          | spawnWeight Change |
| -------- | ----------------- | ---------------------------------------- | ------------------ |
| Event #1 | Negative Vortex   | 5% rare fish probability                 | 100 → 1           |
| Event #2 | Cursed Vortex     | Cursed shader, 2× modifier prob          | 100 → 1           |
| Event #3 | Frozen Vortex     | Frozen shader, Luck ×1.5, 2× modifier   | 100 → 1           |
| Event #6 | Shiny Vortex      | 80% rare fish prob, 2× modifier prob     | 100 → 1           |
| Event #7 | Albino Vortex     | Albino shader, 2× modifier prob          | 100 → 1           |

After these changes, 9 out of 10 sea events have weight 1 (low-weight), leaving only Normal Vortex (weight 100, 20% rare fish probability) to trigger in the vast majority of cases. These low-weight events' spawn probability dropped from previously equal-weight to near-zero.

### New Variables & Mechanics 🆕

**2 new named functions**:
- `LoadRewardState` — Reward state loading system
- `OnSpookyToggleChanged` — Halloween/spooky theme toggle callback

**Key new variables** (partial list):

| Variable                      | Inferred Purpose                      |
| ----------------------------- | ------------------------------------- |
| `_catchOnceRecoveryAttempts`  | Recovery attempts for catch-once fish |
| `_recoveryAttempts`           | Data recovery attempt counter         |
| `_reloadAuthorized`           | Reload authorization flag             |
| `_restoreCompleted`           | Restore completion flag               |
| `_restoredDiscoveredCount`    | Restored discovered fish count        |
| `_restoredFishCaught`         | Restored fish caught count            |
| `_restoredTimePlayed`         | Restored play time                    |
| `_restoredUnlockedCount`      | Restored unlock count                 |
| `_restoredXp`                 | Restored experience points            |
| `_legitimateOwnerId`          | Legitimate owner ID (anti-cheat)      |
| `_ownershipLocked`            | Ownership lock flag                   |
| `_dynamicallyRegistered`      | Dynamic registration flag             |
| `needsRecoveryCheck`          | Recovery check needed flag            |
| `recoveryCheckAttempts`       | Recovery check attempt count          |
| `recoveryCheckTime`           | Recovery check timestamp              |
| `staticBoatCount`             | Static boat count                     |
| `syncZoneCollider`            | Sync zone collider reference          |
| `supporterProduct`            | Supporter product reference           |
| `isUltimateSecretRarity`      | Ultimate secret rarity flag           |
| `ultimateSecretT`             | Ultimate secret animation parameter   |
| `luckWeightFactor`            | Luck-weight factor                    |
| Rarity color variables        | `abundantColor`, `commonColor`, `curiousColor`, `elusiveColor`, `exoticColor`, `fabledColor`, `mythicColor`, `relicColor`, `trashColor` — Rarity UI color system |

**Removed variables** (partial list):

| Variable                        | Purpose                                  |
| ------------------------------- | ---------------------------------------- |
| `simpleBoatSyncManager`         | Simple boat sync manager (replaced)      |
| `BoatPoolSize`                  | Boat pool size constant                  |
| `boatPool`                      | Boat object pool reference               |
| `boatSkinDatabase`              | Boat skin database (merged)              |
| `pendingSpawnController`        | Pending spawn controller                 |
| `pendingSpawnPool`              | Pending spawn object pool                |
| `pendingSpawnPosition/Rotation` | Pending spawn position/rotation          |
| `spawnInProgress`               | Spawn in progress flag                   |
| `orphanCheckTimer`              | Orphan check timer                       |
| `previewInstance`               | Preview instance                         |
| `defaultSyncZoneOffset/Size`    | Default sync zone offset/size            |
| `achievementIndex`              | Achievement index (refactored)           |

### Architecture Change Summary

1. **Data Recovery System**: Added complete player data recovery mechanism (`_restored*` variable family), supporting XP, discovered/caught fish count, and play time restoration
2. **Boat System Refactor**: Removed legacy `BoatSpawnManager` and object pool approach, consolidated into `BoatController` with `staticBoatCount` and `_dynamicallyRegistered` for dynamic boat management
3. **Ownership Security**: Added `_legitimateOwnerId` and `_ownershipLocked` to strengthen ownership verification
4. **UI Rarity Color System**: Added 9 rarity-specific color variables for UI rendering
5. **Economy Rebalance**: Massive fish price reductions (average ~12% decrease), with highest rarity fish receiving the largest cuts
6. **Equipment Tuning**: Select rod and enchantment stats rebalanced
7. **Event System Adjustment**: 5 sea events had weights reduced from 100 to 1, possibly temporary disabling or test configuration
8. **Halloween Theme Toggle**: `OnSpookyToggleChanged` suggests a new seasonal/holiday theme toggle feature
