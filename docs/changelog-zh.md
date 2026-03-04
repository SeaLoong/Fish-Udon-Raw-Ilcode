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

---

## 游戏数据变动

> 以下数据通过对比 03-01 与 03-04 两个快照的提取数据得出。

### 统计总览

| 指标         | 03-01  | 03-04  | 变化       |
| ------------ | ------ | ------ | ---------- |
| warmup       | 64,346 | 67,821 | +3,475     |
| worlddata    | 2,047  | 2,072  | +25        |
| opcodealt    | 1,584  | 1,609  | +25        |
| execlog      | 692    | 639    | −53        |
| totaltime    | 119,684| 108,659| −11,025    |
| dirlist 行数 | 1,716  | 1,721  | +5         |
| varlist 行数 | 167,080| 168,396| +1,316     |
| functiondb行 | 29,029 | 29,161 | +132       |

### 鱼类价格经济性重平衡 🐟

**134 种鱼中有 107 种的售价发生变化**，整体趋势为**大规模降价**（105 降价、2 涨价、27 不变）。

不变的 27 种鱼主要为 Rarity 0（垃圾，10 种）和 Rarity 8（遗物，5 种），以及部分低稀有度鱼。

以下按稀有度列出全部 107 种价格变动鱼类的具体 `minPrice` 变化（`maxPrice` 同比例变化）：

#### 稀有度 1 — Common（17 种降价，平均 −13.8%）

| ID  | 鱼名                   | 旧 minPrice | 新 minPrice | 变化    |
| --- | ---------------------- | ----------- | ----------- | ------- |
| 4   | Perch                  | 14          | 12          | −14.3%  |
| 10  | Herring                | 14          | 12          | −14.3%  |
| 11  | GiltHead Bream         | 14          | 12          | −14.3%  |
| 22  | Bream                  | 14          | 12          | −14.3%  |
| 26  | Ide                    | 14          | 12          | −14.3%  |
| 29  | Roach                  | 14          | 12          | −14.3%  |
| 30  | Tench                  | 14          | 12          | −14.3%  |
| 45  | Goldfish               | 14          | 12          | −14.3%  |
| 55  | Haddock                | 14          | 12          | −14.3%  |
| 56  | Mackerel               | 14          | 12          | −14.3%  |
| 57  | Needlefish             | 14          | 12          | −14.3%  |
| 58  | Ocean Perch            | 14          | 12          | −14.3%  |
| 62  | Tarpon                 | 16          | 15          | −6.2%   |
| 67  | Flame Guppy            | 14          | 12          | −14.3%  |
| 70  | Magma Carp             | 14          | 12          | −14.3%  |
| 96  | Bluegill Sunfish       | 14          | 12          | −14.3%  |
| 113 | Tilefish               | 15          | 13          | −13.3%  |

#### 稀有度 2 — Curious（17 种降价，平均 −6.1%）

| ID  | 鱼名                   | 旧 minPrice | 新 minPrice | 变化   |
| --- | ---------------------- | ----------- | ----------- | ------ |
| 1   | Cod                    | 25          | 24          | −4.0%  |
| 2   | Eel                    | 24          | 23          | −4.2%  |
| 7   | Atlantic Salmon        | 24          | 22          | −8.3%  |
| 28  | Rainbow Trout          | 24          | 22          | −8.3%  |
| 31  | Black Sharkminnow      | 24          | 22          | −8.3%  |
| 53  | Black Scorpionfish     | 24          | 22          | −8.3%  |
| 54  | Bluefish               | 24          | 23          | −4.2%  |
| 60  | Pollock                | 25          | 24          | −4.0%  |
| 61  | Snook                  | 25          | 24          | −4.0%  |
| 63  | Ashscale Trout         | 24          | 23          | −4.2%  |
| 64  | Basalt Eel             | 24          | 22          | −8.3%  |
| 97  | Bowfin                 | 24          | 23          | −4.2%  |
| 98  | Channel Catfish        | 25          | 24          | −4.0%  |
| 106 | Boxfish                | 24          | 22          | −8.3%  |
| 108 | Gulper Eel             | 25          | 24          | −4.0%  |
| 109 | Hawaiian Triggerfish   | 24          | 22          | −8.3%  |
| 111 | John Dory              | 24          | 22          | −8.3%  |

#### 稀有度 3 — Abundant（17 种降价，平均 −10.2%）

| ID  | 鱼名                   | 旧 minPrice | 新 minPrice | 变化    |
| --- | ---------------------- | ----------- | ----------- | ------- |
| 3   | Halibut                | 36          | 35          | −2.8%   |
| 8   | Albacore Tuna          | 35          | 32          | −8.6%   |
| 12  | Barracuda              | 34          | 31          | −8.8%   |
| 14  | Flying Fish            | 33          | 29          | −12.1%  |
| 15  | Mahi-Mahi              | 34          | 31          | −8.8%   |
| 16  | Lionfish               | 33          | 29          | −12.1%  |
| 18  | Northern Pufferfish    | 33          | 29          | −12.1%  |
| 19  | Crab                   | 33          | 29          | −12.1%  |
| 42  | Clownfish              | 33          | 29          | −12.1%  |
| 48  | Red Melon Discus       | 33          | 29          | −12.1%  |
| 49  | Regal Blue Tang        | 33          | 29          | −12.1%  |
| 51  | Snow Yellow Discus     | 33          | 29          | −12.1%  |
| 65  | Cinderfin              | 33          | 29          | −12.1%  |
| 72  | Obsidian Fish          | 34          | 30          | −11.8%  |
| 99  | Cottonmouth Snake      | 33          | 30          | −9.1%   |
| 101 | Frog                   | 33          | 29          | −12.1%  |
| 115 | Amberjack              | 37          | 36          | −2.7%   |

#### 稀有度 4 — Elusive（17 种降价，平均 −11.7%）

| ID  | 鱼名                         | 旧 minPrice | 新 minPrice | 变化    |
| --- | ---------------------------- | ----------- | ----------- | ------- |
| 6   | Sailfish                     | 72          | 64          | −11.1%  |
| 17  | Parrotfish                   | 71          | 62          | −12.7%  |
| 20  | Alligator Gar                | 72          | 63          | −12.5%  |
| 32  | European Anglerfish          | 72          | 63          | −12.5%  |
| 34  | Goonch Catfish               | 72          | 63          | −12.5%  |
| 38  | Salween Rita Catfish         | 71          | 62          | −12.7%  |
| 39  | Siamese Giant Carp           | 72          | 64          | −11.1%  |
| 41  | Blobfish                     | 71          | 62          | −12.7%  |
| 43  | Common Stingray              | 72          | 63          | −12.5%  |
| 50  | Seahorse                     | 71          | 62          | −12.7%  |
| 52  | Sunfish                      | 79          | 76          | −3.8%   |
| 59  | Permit                       | 71          | 63          | −11.3%  |
| 66  | Crystal Pike                 | 71          | 62          | −12.7%  |
| 71  | Molten Angler                | 72          | 63          | −12.5%  |
| 94  | Alligator Snapping Turtle    | 72          | 64          | −11.1%  |
| 110 | Hogfish                      | 71          | 62          | −12.7%  |
| 114 | Wahoo                        | 72          | 63          | −12.5%  |

#### 稀有度 5 — Exotic（11 降价 + 1 涨价，平均 −5.8%）

| ID  | 鱼名                | 旧 minPrice | 新 minPrice | 变化   |
| --- | ------------------- | ----------- | ----------- | ------ |
| 13  | Hammerhead Shark     | 975         | 923         | −5.3%  |
| 24  | Goliath Tigerfish    | 955         | 885         | −7.3%  |
| 36  | Oarfish              | 968         | 910         | −6.0%  |
| 46  | Ironfin Stalker      | 954         | 881         | −7.7%  |
| **47**  | **Manta Ray**    | **1,050**   | **1,069**   | **+1.8%** |
| 69  | Ifrit Barracuda      | 957         | 888         | −7.2%  |
| 73  | Pyrite Snapper       | 961         | 896         | −6.8%  |
| 95  | American Alligator   | 976         | 925         | −5.2%  |
| 102 | Giant Gharial        | 1,000       | 971         | −2.9%  |
| 107 | Frilled Shark        | 961         | 895         | −6.9%  |
| 112 | Pinnate Batfish      | 950         | 874         | −8.0%  |
| 127 | Brickfish            | 951         | 877         | −7.8%  |

#### 稀有度 6 — Fabled（10 种降价，平均 −22.1%）

| ID  | 鱼名                 | 旧 minPrice | 新 minPrice | 变化    |
| --- | -------------------- | ----------- | ----------- | ------- |
| 33  | Giant Squid          | 4,898       | 3,837       | −21.7%  |
| 40  | Great White Shark    | 5,236       | 4,378       | −16.4%  |
| 119 | Ancient Warriorfish  | 4,750       | 3,600       | −24.2%  |
| 120 | Venomous Watcher     | 4,750       | 3,600       | −24.2%  |
| 122 | Blind Bladefish      | 4,750       | 3,600       | −24.2%  |
| 124 | Armored Brutefish    | 4,767       | 3,628       | −23.9%  |
| 129 | Igneous Stingray     | 5,250       | 4,400       | −16.2%  |
| 130 | Red Demonfish        | 4,854       | 3,767       | −22.4%  |
| 131 | Red Dartfin          | 4,755       | 3,608       | −24.1%  |
| 133 | Humpback Gar         | 4,787       | 3,660       | −23.5%  |

#### 稀有度 7 — Mythic（10 种降价，平均 −29.8%）

| ID  | 鱼名                   | 旧 minPrice | 新 minPrice | 变化    |
| --- | ---------------------- | ----------- | ----------- | ------- |
| 68  | Hellmaw Grouper        | 11,416      | 7,868       | −31.1%  |
| 85  | Abyssal Serpentfish    | 11,425      | 7,880       | −31.0%  |
| 86  | Baby Megalodon         | 12,600      | 9,587       | −23.9%  |
| 87  | Celestial Whitefin     | 11,412      | 7,862       | −31.1%  |
| 88  | Shellonodon            | 11,832      | 8,472       | −28.4%  |
| 89  | Spineback Ray          | 11,448      | 7,914       | −30.9%  |
| 100 | Dreadshell Colossus    | 11,880      | 8,542       | −28.1%  |
| 123 | Three-Headed Salmon    | 11,400      | 7,844       | −31.2%  |
| 126 | Dragonfly Fish         | 11,400      | 7,845       | −31.2%  |
| 132 | Royal Bananafish       | 11,400      | 7,844       | −31.2%  |

#### 稀有度 9 — Secret（5 种降价，平均 −16.4%）

| ID  | 鱼名              | 旧 minPrice | 新 minPrice | 变化    |
| --- | ----------------- | ----------- | ----------- | ------- |
| 74  | Wabubu Fish       | 17,100      | 13,995      | −18.2%  |
| 116 | Steve             | 17,100      | 13,995      | −18.2%  |
| 117 | Ragtime Frog      | 17,100      | 13,995      | −18.2%  |
| 121 | Decimated Fih     | 17,100      | 13,995      | −18.2%  |
| 128 | Luxian Camelshark | 18,900      | 17,105      | −9.5%   |

#### 稀有度 10 — Ultimate（1 涨价 + 1 降价）

| ID  | 鱼名             | 旧 minPrice | 新 minPrice | 变化    |
| --- | ---------------- | ----------- | ----------- | ------- |
| **125** | **Catfish Emperor** | **35,000** | **38,500** | **+10.0%** |
| 134 | Crab of Duality  | 35,000      | 31,500      | −10.0%  |

### 钓竿平衡调整 🎣

| 钓竿                   | 变更属性                                          |
| ---------------------- | ------------------------------------------------- |
| Speedy Rod (#7)        | luck: 20→1, expertise: 15→5, attractionRate: 65→60 |
| Fortunate Rod (#8)     | bigCatchRate: 77→65                               |
| Alien Rod (#10)        | luck: 50→55, expertise: 5→10, attractionRate: 40→45 |
| Rod of the Pharaoh (#12) | bigCatchRate: 30→35, luck: 200→222              |

- Speedy Rod 遭到大幅削弱（luck −95%）
- Rod of the Pharaoh 获得 luck +11% 增强
- Alien Rod 属性重分配（luck↑ expertise↑ attractionRate↑）

### 附魔数值削弱 ✨

| 附魔名称         | 变更                                          |
| ---------------- | --------------------------------------------- |
| Son of Kriptan   | strengthBonus: 50→10, expertiseBonus: 50→10   |
| The Night Watcher| strengthBonus: 30→10, expertiseBonus: 30→10   |

两个附魔的力量和专长加成均被大幅削弱（降低 67%–80%）。

### 海洋事件刷新权重调整 🌊

5 个海洋事件的 `spawnWeight` 从 100 降至 1：

| 事件编号 | 事件名称          | 特性                                 | spawnWeight 变化 |
| -------- | ----------------- | ------------------------------------ | ---------------- |
| Event #1 | Negative Vortex   | 5% 稀有鱼概率                        | 100 → 1         |
| Event #2 | Cursed Vortex     | 诅咒着色器，2× 修饰概率              | 100 → 1         |
| Event #3 | Frozen Vortex     | 冰冻着色器，幸运 ×1.5，2× 修饰概率  | 100 → 1         |
| Event #6 | Shiny Vortex      | 80% 稀有鱼概率，2× 修饰概率          | 100 → 1         |
| Event #7 | Albino Vortex     | 白化着色器，2× 修饰概率              | 100 → 1         |

变更后，10 个海洋事件中有 9 个的权重为 1（低权重），仅剩 Normal Vortex（权重 100、20% 稀有鱼概率）在绝大多数情况下触发。这些低权重事件出现的概率从之前的等概率大幅降低为近乎不出现。

### 新增变量与机制 🆕

**2 个新增命名函数**：
- `LoadRewardState` — 奖励状态加载系统
- `OnSpookyToggleChanged` — 万圣节/恐怖主题切换回调

**关键新增变量**（部分）：

| 变量名                      | 含义推测                     |
| --------------------------- | ---------------------------- |
| `_catchOnceRecoveryAttempts`| 一次性捕获的恢复尝试次数     |
| `_recoveryAttempts`         | 数据恢复尝试计数             |
| `_reloadAuthorized`         | 重新加载授权标志             |
| `_restoreCompleted`         | 恢复完成标志                 |
| `_restoredDiscoveredCount`  | 恢复的已发现鱼类计数         |
| `_restoredFishCaught`       | 恢复的已捕获鱼类数           |
| `_restoredTimePlayed`       | 恢复的游戏时间               |
| `_restoredUnlockedCount`    | 恢复的已解锁数               |
| `_restoredXp`               | 恢复的经验值                 |
| `_legitimateOwnerId`        | 合法拥有者 ID（防作弊）      |
| `_ownershipLocked`          | 所有权锁定标志               |
| `_dynamicallyRegistered`    | 动态注册标志                 |
| `needsRecoveryCheck`        | 需要恢复检查                 |
| `recoveryCheckAttempts`     | 恢复检查尝试次数             |
| `recoveryCheckTime`         | 恢复检查时间                 |
| `staticBoatCount`           | 静态船只计数                 |
| `syncZoneCollider`          | 同步区域碰撞器               |
| `supporterProduct`          | 赞助者产品引用               |
| `isUltimateSecretRarity`    | 终极秘密稀有度标志           |
| `ultimateSecretT`           | 终极秘密动画参数             |
| `luckWeightFactor`          | 幸运-重量因子                |
| 各稀有度颜色变量            | `abundantColor`、`commonColor`、`curiousColor`、`elusiveColor`、`exoticColor`、`fabledColor`、`mythicColor`、`relicColor`、`trashColor` — 稀有度 UI 颜色系统 |

**已移除的变量**（部分）：

| 变量名                      | 含义                         |
| --------------------------- | ---------------------------- |
| `simpleBoatSyncManager`     | 简单船只同步管理器（已被新系统取代）|
| `BoatPoolSize`              | 船只池大小常量               |
| `boatPool`                  | 船只对象池引用               |
| `boatSkinDatabase`          | 船只皮肤数据库（已整合）     |
| `pendingSpawnController`    | 待生成控制器                 |
| `pendingSpawnPool`          | 待生成对象池                 |
| `pendingSpawnPosition/Rotation` | 待生成位置/旋转           |
| `spawnInProgress`           | 生成进行中标志               |
| `orphanCheckTimer`          | 孤儿检查计时器               |
| `previewInstance`           | 预览实例                     |
| `defaultSyncZoneOffset/Size`| 默认同步区域偏移/大小        |
| `achievementIndex`          | 成就索引（已重构）           |

### 架构变更总结

1. **数据恢复系统**：新增完整的玩家数据恢复机制（`_restored*` 系列变量），支持经验值、已发现/已捕获鱼类、游戏时间的恢复
2. **船只系统重构**：移除旧的 `BoatSpawnManager` 和对象池方案，整合进 `BoatController`，新增 `staticBoatCount` 和 `_dynamicallyRegistered` 支持动态船只管理
3. **所有权安全性**：新增 `_legitimateOwnerId` 和 `_ownershipLocked` 强化所有权验证
4. **UI 稀有度颜色系统**：新增 9 种稀有度对应的颜色变量，用于 UI 渲染
5. **经济重平衡**：鱼类价格大规模下调（平均降幅约 12%），高稀有度鱼降幅最大
6. **装备数值调整**：部分钓竿和附魔属性重新平衡
7. **事件系统调整**：5 个海洋事件权重从 100 降至 1，可能为临时禁用或测试配置
8. **万圣节主题切换**：`OnSpookyToggleChanged` 暗示新增了节日主题切换功能
