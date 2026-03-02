# IL Code Changelog

English | [简体中文](changelog.md)

> This document records changes to the Fish World Udon IL bytecode across decompilation snapshots.

---

## 03-01 Snapshot

**Decompilation date**: March 1, 2025

| Metric         | Value      |
| -------------- | ---------- |
| Total programs | 174        |
| Object refs    | 5,765      |
| Warmup time    | 64,346 ms  |
| World data     | 2,047 ms   |
| Opcode parsing | 1,584 ms   |
| Exec log       | 692 ms     |
| Total time     | 119,684 ms |

### Changes from 02-28

**IL content changes: none.** All 174 programs have identical IL bytecode, variable definitions (`variablesjs`), and opcodes (`altopcode`/`opcode`) compared to the 02-28 snapshot.

Only the decompiler runtime statistics differ (03-01 took longer), confirming that the decompilation is reproducible — different runs produce the same IL output.

---

## 02-28 Snapshot

**Decompilation date**: February 28, 2025

| Metric         | Value     |
| -------------- | --------- |
| Total programs | 174       |
| Object refs    | 5,765     |
| Warmup time    | 7,679 ms  |
| World data     | 1,267 ms  |
| Opcode parsing | 902 ms    |
| Exec log       | 569 ms    |
| Total time     | 47,015 ms |

### Initial Snapshot Contents

First decompilation yielded **174 Udon programs** spanning these modules:

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
