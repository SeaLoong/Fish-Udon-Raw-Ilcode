# IL 代码变更日志

[English](changelog-en.md) | 简体中文

> 本文档记录 Fish World Udon IL 字节码在各反编译快照之间的变更。

---

## 03-01 快照

**反编译日期**：2025 年 3 月 1 日

| 指标       | 值         |
| ---------- | ---------- |
| 程序总数   | 174        |
| 对象引用数 | 5,765      |
| 预热耗时   | 64,346 ms  |
| 世界数据   | 2,047 ms   |
| 操作码处理 | 1,584 ms   |
| 执行日志   | 692 ms     |
| 总耗时     | 119,684 ms |

### 与 02-28 快照对比

**IL 内容变更：无。** 全部 174 个程序的 IL 字节码、变量定义（`variablesjs`）及操作码（`altopcode`/`opcode`）与 02-28 快照完全一致。

仅反编译工具的运行时统计数据不同（03-01 的处理时间更长），证明反编译结果具备可重复性——不同运行产生相同的 IL 输出。

---

## 02-28 快照

**反编译日期**：2025 年 2 月 28 日

| 指标       | 值        |
| ---------- | --------- |
| 程序总数   | 174       |
| 对象引用数 | 5,765     |
| 预热耗时   | 7,679 ms  |
| 世界数据   | 1,267 ms  |
| 操作码处理 | 902 ms    |
| 执行日志   | 569 ms    |
| 总耗时     | 47,015 ms |

### 初始快照内容

首次反编译获得 **174 个 Udon 程序**，涵盖以下模块：

| 模块分类     | 代表程序                                                                          |
| ------------ | --------------------------------------------------------------------------------- |
| 钓鱼核心     | FishDatabase、FishSpawner、FishingRodController、FishBiteDetection、CatchMinigame |
| 装备系统     | RodStats、BobberStats、LineStats、EnchantmentEntry、EquipmentManager              |
| 船只系统     | BoatController、BoatPhysics、BoatSkinManager、BoatEntry                           |
| 宠物系统     | PetCompanion、PetStats、AFKPetController                                          |
| 经济系统     | ShopManager、InventoryManager、CurrencyManager、BountySystem                      |
| 世界环境     | WeatherSystem、DayNightCycle、ZoneManager、SeaEventManager、MusicController       |
| 玩家系统     | PlayerStats、LevelSystem、AchievementManager、TitleManager、DailyRewards          |
| 社交与 UI    | DialogueManager、Leaderboard、FishCodex、TutorialManager、NPCInteraction          |
| 安全与网络   | CryptoAES256GPU、DiscordRoleManager、NetworkSync、SyncZone                        |
| VRC 基础设施 | VRCChair3、VRCStation、VRCPickup 等                                               |
