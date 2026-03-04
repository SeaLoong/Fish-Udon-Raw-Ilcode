# IL 代码变更日志

[English](changelog-en.md) | 简体中文

> 本文档记录 Fish World Udon IL 字节码的反编译快照信息。

---

## 03-04 快照

**反编译日期**：2025 年 3 月 4 日

| 指标       | 值         |
| ---------- | ---------- |
| 程序总数   | 172        |
| 对象引用数 | 4,359      |
| baseobject | 29.82 MB   |
| functiondb | 710.30 KB  |
| declibrary | 22.42 MB   |

### 加密参数 🔐

DiscordRoleManager (`8Bd1F9CA`) 的加密参数：

| 参数                   | 值                                        |
| ---------------------- | ----------------------------------------- |
| 口令混淆方案           | `(raw[i] ^ k[i%7]) ^ ((i*15+69) & 255)`  |
| 盐值混淆方案           | `(raw[i] ^ 96) ^ (i & 31)`               |
| 密钥因子 k             | 7 字节: `[91, 13, 177, 166, 164, 151, 73]` |
| 口令明文               | `iCdX1ONKFplcYOZ41GJvLr9rYUsEkzXe`       |
| 盐值明文               | `eumW2MJmU0FSVVnEa9hcNLs0Cw9ggIjQ`       |
| 派生密钥 (hex)         | `da42028b0b24a0a98e18b95e9b7d19d9dfd5ce3cc20316c530714ad3c7e712e1` |

混淆方案特点：
- 口令和盐使用独立的混淆公式
- 7 字节密钥因子数组参与口令去混淆
- 口令使用多项式掩码 `(i*15+69) & 255`
- 底层使用 AES-256-CBC 解密，DeriveKey 为 1000 轮 S-box 混合

### IL 逻辑变更（53 个程序）

172 个程序中，**53 个程序的 altopcode 存在逻辑层面的变更**：

| 程序     | 模块                  | diff 行数 | 变更性质                               |
| -------- | --------------------- | --------- | -------------------------------------- |
| `E2CD7e` | BoatController        | ~4648     | 整合 BoatSpawnManager，大规模重构      |
| `8f6758` | PlayerInventoryData   | ~2315     | 新增空检查、任务背包管理器整合         |
| `355e2a` | FishingRod            | ~1572     | 交互逻辑、任务物品系统整合             |
| `472Eea` | EquipmentStats        | ~1316     | 增益管理器整合、附魔计算更新           |
| `fFd598` | PlayerData            | ~1198     | 经验/升级/显示系统重构                 |
| `CaaE9B` | FishingMinigame       | ~906      | 钓鱼小游戏交互重写                     |
| `f655Ab` | NetworkSync           | ~546      | 网络同步逻辑更新                       |
| 其余 46 | 各模块                | <500      | 函数名规范化、偏移修正等               |

### 函数名规范化

多个程序的公有事件方法名统一添加 `_` 前缀：
- `OnClaimButtonClick` → `_OnClaimButtonClick`
- `StartGame` → `_StartGame`
- 符合 UdonSharp 编码规范

### 模块分类

本快照包含 **172 个 Udon 程序**，涵盖以下模块：

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
