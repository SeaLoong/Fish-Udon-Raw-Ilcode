# Fish World VRChat — 完整游戏数据分析

[English](complete-game-data-analysis-en.md) | 简体中文

> 从反编译的 Udon IL 字节码（174 个程序）中提取。所有数值均为源码原始数据。

---

## 目录

1. [鱼类生成与稀有度系统](#1-鱼类生成与稀有度系统)
2. [钓鱼小游戏机制](#2-钓鱼小游戏机制)
3. [鱼类修饰器（着色器与尺寸）](#3-鱼类修饰器着色器与尺寸)
4. [天气与生态区系统](#4-天气与生态区系统)
5. [昼夜循环](#5-昼夜循环)
6. [装备 — 鱼竿](#6-装备--鱼竿)
7. [装备 — 鱼线](#7-装备--鱼线)
8. [装备 — 浮漂](#8-装备--浮漂)
9. [装备 — 附魔](#9-装备--附魔)
10. [附魔战利品表（遗物 → 附魔）](#10-附魔战利品表遗物--附魔)
11. [装备属性聚合与公式](#11-装备属性聚合与公式)
12. [增益系统](#12-增益系统)
13. [海上事件](#13-海上事件)
14. [船只](#14-船只)
15. [宠物 / AFK 宠物系统](#15-宠物--afk-宠物系统)
16. [经验值、等级与玩家属性](#16-经验值等级与玩家属性)
17. [每日奖励](#17-每日奖励)
18. [经济与鱼类估价](#18-经济与鱼类估价)

---

## 1. 鱼类生成与稀有度系统

**来源：** `FishDatabase` (711854d789cde03439ab365052973864)

### 1.1 稀有度等级基础概率

| 稀有度          | 基础概率     | 幸运力度 |
| --------------- | ------------ | -------- |
| Trash           | 0.09 (9%)    | −1.0     |
| Abundant        | 0.27 (27%)   | −0.8     |
| Common          | 0.25 (25%)   | −0.1     |
| Curious         | 0.18 (18%)   | +0.35    |
| Elusive         | 0.11 (11%)   | +0.6     |
| Fabled          | 0.044 (4.4%) | +0.7     |
| Mythic          | 0.025 (2.5%) | +0.6     |
| Exotic          | 0.01 (1%)    | +0.6     |
| Relic           | 0.03 (3%)    | +0.1     |
| Secret          | 0.01 (1%)    | +2.0     |
| Ultimate Secret | 0.004 (0.4%) | +1.9     |

- **稀有度枚举值（内部）：** Trash=0, Abundant=1, Common=7, Curious=8, Elusive=9, Fabled=10, Mythic=11, Exotic=4, Relic=3, Secret=12, UltimateSecret=（推断为 13+）

### 1.2 稀有度选择算法 (`SelectRarityTier`)

1. 从基础概率构建一个含 10 个元素的 `modifiedChances[]` 数组。
2. 应用**类 sigmoid 幸运值平滑**：每个稀有度的概率通过 `luckPower[i] * luckMultiplier` 进行调整，使用 sigmoid 曲线防止极端偏移。
3. 归一化所有概率使其总和为 1.0。
4. 掷一个 [0, 1) 的随机浮点数，沿累积分布选择一个等级。

### 1.3 区域优先级系统

- **`zoneSpecificChance` = 80** → 80% 的情况下，系统优先尝试选择区域特定的鱼。
- 选择顺序：**区域特定鱼 → 通用鱼 → 公海鱼**（后备池）。
- 每种鱼都有 `allowedZoneIDs[]` 和 `forbiddenZoneIDs[]` 来控制生成。

### 1.4 鱼类生成条件（每种鱼条目）

每种鱼类定义了以下属性：

| 属性                   | 类型  | 描述                     |
| ---------------------- | ----- | ------------------------ |
| `canSpawnInFreshwater` | bool  | 可在淡水区域生成         |
| `canSpawnInSaltwater`  | bool  | 可在咸水区域生成         |
| `canSpawnInSwampwater` | bool  | 可在沼泽区域生成         |
| `canSpawnInLava`       | bool  | 可在岩浆区域生成         |
| `canSpawnInDay`        | bool  | 白天可以生成             |
| `canSpawnInNight`      | bool  | 夜间可以生成             |
| `spawnInAnySaltwater`  | bool  | 任意咸水区域，忽略区域ID |
| `allowedZoneIDs[]`     | int[] | 区域 ID 白名单           |
| `forbiddenZoneIDs[]`   | int[] | 区域 ID 黑名单           |

### 1.5 时间与天气偏好（价值倍率）

每种鱼可以偏好特定的时间/天气。当匹配时，该鱼获得 **×2 价值倍率** (`const_SystemSingle_2`)：

- **时间：** `prefersMorning`、`prefersDay`、`prefersEvening`、`prefersNight`
- **天气：** `prefersClear`、`prefersRainy`、`prefersStormy`、`prefersFoggy`、`prefersMoonrain`、`prefersStarfog`、`prefersSkybloom`

### 1.6 鱼类数据结构（每种鱼）

| 字段               | 类型   | 示例（Crab of Duality） |
| ------------------ | ------ | ----------------------- |
| `fishId`           | int    | 134                     |
| `fishName`         | string | "Crab of Duality"       |
| `enabled`          | bool   | true                    |
| `rarity`           | int    | 10 (Fabled)             |
| `difficulty`       | int    | 5                       |
| `baseValue`        | int    | 10                      |
| `minPrice`         | int    | 35,000                  |
| `maxPrice`         | int    | 45,000                  |
| `minWeight`        | float  | 150 kg                  |
| `maxWeight`        | float  | 350 kg                  |
| `relicDropWeight`  | int    | 10                      |
| `catchOnce`        | bool   | false                   |
| `rewardsQuestItem` | bool   | false                   |

---

## 2. 钓鱼小游戏机制

**来源：** `FishingMinigameScript` (2af157c6afd4f2e479afe773efb9f6ea)

### 2.1 难度插值参数

所有数值在**简单**（difficulty=0）和**困难**（difficulty=1）之间根据鱼的归一化难度进行插值：

| 参数               | 简单  | 困难   |
| ------------------ | ----- | ------ |
| 目标尺寸           | 1.2   | 0.7    |
| 方向变化时间       | 0.5 s | 0.4 s  |
| 鱼的平滑时间       | 1.0 s | 0.19 s |
| 捕获速度（填充率） | 0.2/s | 0.06/s |
| 流失速度（消耗率） | 0.1/s | 0.15/s |
| 最大流失速度倍率   | 1×    | 3×     |

- **`loseSpeedEscalationRate`** = 0.1（流失速度随时间增加）

### 2.2 物理与操控

| 参数             | 值    |
| ---------------- | ----- |
| 重力             | 1.25  |
| 玩家速度         | 3.75  |
| 鱼目标判定框大小 | 0.1   |
| 进度条高度       | 2.8   |
| 准备时间         | 1.0 s |

### 2.3 抖动效果

| 参数                        | 值   |
| --------------------------- | ---- |
| `difficultyShakeMultiplier` | 0.2  |
| `shakeSpeed`                | 50   |
| `maxShakeRotation`          | 0.8  |
| `shakeIntensity`            | 0.01 |

### 2.4 VR 调整

| 参数                    | 值   |
| ----------------------- | ---- |
| `vrLoseSpeedMultiplier` | 1.0  |
| `vrTargetSizeBonus`     | 0.04 |
| `vrTriggerThreshold`    | 0.15 |

### 2.5 FPS 辅助

| 参数                             | 值   |
| -------------------------------- | ---- |
| `fpsAssistCutoffFPS`             | 30   |
| `fpsAssistMaxBenefitFPS`         | 15   |
| `fpsAssistMaxBonus`              | 0.05 |
| `fpsFishSpeedMinMultiplier`      | 0.95 |
| `fpsFishVRSlowdownMultiplier`    | 0.95 |
| `fpsFishSlowdownStartDifficulty` | 6    |

### 2.6 装备对小游戏的影响

- **Strength（力量）** → 减少鱼的衰减/流失速度。公式：`Clamp(value, 0.25, 1.0)` — 力量可有效将流失率降低至 1/2 到 1/4。
- **Expertise（专精）** → 增大目标判定框大小。最低倍率 = 0.5×。
- **新手捕捉阈值** = 20（前 20 次捕捉处于新手模式）。

### 2.7 UI 动画

| 参数                     | 值     |
| ------------------------ | ------ |
| `panelPopOvershoot`      | 1.1    |
| `panelPopDuration`       | 0.25 s |
| `scaleOvershoot`         | 1.15   |
| `scaleAnimationDuration` | 0.5 s  |
| `buttonAnimationSpeed`   | 0.8    |
| `tooltipVisibleDuration` | 8.0 s  |

---

## 3. 鱼类修饰器（着色器与尺寸）

**来源：** `FishModifierManager` (281c3f3520b06e64686282e5951ab067)

### 3.1 基础修饰器概率

| 参数                          | 值                         |
| ----------------------------- | -------------------------- |
| `sizeModifierChancePercent`   | 10%                        |
| `shaderModifierChancePercent` | 7.5%                       |
| `doubleModifierChancePercent` | 5%                         |
| `hugeVsTinyRatio`             | 50（50% 概率为巨型或微型） |

### 3.2 修饰器判定流程

1. 判定 `doubleModifierChancePercent` (5%) — 若成功，同时判定尺寸和着色器。
2. 否则，判定 `sizeModifierChancePercent` (10%) 仅判定尺寸。
3. 否则，判定 `shaderModifierChancePercent` (7.5%) 仅判定着色器。
4. 海上事件增强类型可覆盖判定结果。
5. **最终价值 = sizeMultiplier × shaderMultiplier**（乘法叠加）。

### 3.3 着色器修饰器价值倍率

| ID  | 着色器名称    | 价值倍率 |
| --- | ------------- | -------- |
| 0   | None          | 1.0×     |
| 1   | _（未命名）_  | —        |
| 2   | Albino        | 1.5×     |
| 3   | Shiny         | 2.0×     |
| 4   | Golden        | 3.0×     |
| 5   | Ghastly       | 1.5×     |
| 6   | Blessed       | 3.0×     |
| 7   | Cursed        | 1.1×     |
| 8   | Radioactive   | 3.0×     |
| 9   | MissingShader | 1.5×     |
| 10  | Sandy         | 1.2×     |
| 11  | Holographic   | 5.0×     |
| 12  | Burning       | 4.0×     |
| 13  | Rainbow       | 3.0×     |
| 14  | Stone         | 1.3×     |
| 15  | Zebra         | 1.3×     |
| 16  | Tiger         | 1.6×     |
| 17  | Camo          | 1.8×     |
| 18  | Electric      | 4.0×     |
| 19  | Static        | 5.0×     |
| 20  | Void          | 2.0×     |
| 21  | Frozen        | 2.0×     |
| 22  | Shadow        | 2.0×     |
| 23  | Negative      | 1.5×     |
| 24  | Galaxy        | 3.0×     |

### 3.4 尺寸修饰器价值倍率

| 尺寸类型 | 倍率 |
| -------- | ---- |
| None     | 1.0× |
| Huge     | 1.5× |

---

## 4. 天气与生态区系统

**来源：** `BiomeWeatherManager` (ab4526b1e2c72f04482e668077491462)

### 4.1 全局天气参数

| 参数                            | 值               |
| ------------------------------- | ---------------- |
| `weatherChangeInterval`         | 120 s（2 分钟）  |
| `moonrainChance`                | 0.15（每晚 15%） |
| `atmosphericTransitionDuration` | 10 s             |
| `audioTransitionDuration`       | 5 s              |
| `indoorHeightThreshold`         | −100             |
| `belowThresholdWeather`         | 0（Clear/晴天）  |
| `useHeightFiltering`            | true             |

### 4.2 天气类型（推断 ID）

| ID  | 天气             |
| --- | ---------------- |
| 0   | Clear（晴天）    |
| 1   | Rainy（雨天）    |
| 3   | Stormy（暴风雨） |
| 4   | Foggy（雾天）    |

### 4.3 默认天气（生态区外）

| 天气       | 权重 |
| ---------- | ---- |
| Stormy (3) | 25   |
| Clear (0)  | 50   |
| Rainy (1)  | 25   |

### 4.4 生态区定义

| 生态区 | 名称     | 半径   | 优先级 |
| ------ | -------- | ------ | ------ |
| 0      | DESERT   | 426.5  | 50     |
| 1      | TROPICAL | 1296.0 | 0      |
| 2      | SWAMP    | 309.92 | 50     |

### 4.5 各生态区天气权重

**沙漠（Desert）生态区：**

| 天气       | 权重 |
| ---------- | ---- |
| Clear (0)  | 65   |
| Stormy (3) | 30   |
| Rainy (1)  | 5    |

**热带（Tropical）生态区：**

| 天气       | 权重 |
| ---------- | ---- |
| Clear (0)  | 60   |
| Rainy (1)  | 25   |
| Stormy (3) | 15   |

**沼泽（Swamp）生态区：**

| 天气       | 权重 |
| ---------- | ---- |
| Rainy (1)  | 40   |
| Clear (0)  | 20   |
| Stormy (3) | 40   |
| Foggy (4)  | 5    |

---

## 5. 昼夜循环

**来源：** `DayNightCycle` (2aa0a7746b48abe47bdbb4aef4d69c71)

| 参数                   | 值                     |
| ---------------------- | ---------------------- |
| `cycleDurationSeconds` | 1200 s（总计 20 分钟） |
| `startTimeNormalized`  | 0.25（从早晨开始）     |
| `midnightAngle`        | 90°                    |

### 时间段持续时间

| 时段 | 比例 | 持续时间        |
| ---- | ---- | --------------- |
| 早晨 | 0.20 | 240 s（4 分钟） |
| 白天 | 0.30 | 360 s（6 分钟） |
| 傍晚 | 0.20 | 240 s（4 分钟） |
| 夜晚 | 0.30 | 360 s（6 分钟） |

- **日间** = 早晨 + 白天 = 10 分钟（50%）
- **夜间** = 傍晚 + 夜晚 = 10 分钟（50%）

---

## 6. 装备 — 鱼竿

**来源：** 鱼竿条目 (0a7fe06dcadd5694087b8c7d5bdbf8fd)，共 17 个实例

| ID  | 名称               | 幸运 | 力量 | 专精 | 吸引力 | 大鱼率 | 最大重量 (kg) | 备注               |
| --- | ------------------ | ---- | ---- | ---- | ------ | ------ | ------------- | ------------------ |
| 0   | Stick and String   | −50  | 0    | 0    | 0      | −100   | 5             | 初始装备，默认解锁 |
| 1   | Sturdy Wooden Rod  | 15   | 0    | 5    | 20     | 0      | 30            |                    |
| 2   | Telescopic Rod     | 10   | 15   | 15   | 10     | 5      | 2,005         |                    |
| 3   | Darkwood Rod       | 30   | 10   | 10   | 30     | 5      | 1,800         |                    |
| 4   | Runesteel Rod      | 90   | 25   | 20   | 30     | 40     | 100,000       | 综合最佳           |
| 5   | DEBUG ROD          | 0    | 0    | 0    | 0      | 0      | 1             | 仅限调试           |
| 6   | Sunleaf Rod        | 10   | 5    | 10   | 20     | 15     | 250           |                    |
| 7   | Speedy Rod         | 20   | 5    | 15   | 65     | 0      | 1,500         | 最高吸引力         |
| 8   | Fortunate Rod      | 100  | 10   | 5    | 10     | 77     | 1,500         | 最高幸运（中级）   |
| 9   | Toy Rod            | 0    | 0    | 0    | 0      | 0      | 15            | 趣味道具           |
| 10  | Alien Rod          | 50   | 10   | 5    | 40     | 30     | 32,000        |                    |
| 11  | Rod of Perpetuity  | 150  | 30   | 30   | 50     | 10     | 500,000       | 等级 500 解锁      |
| 12  | Rod of the Pharaoh | 200  | 20   | 40   | −10    | 30     | 100,000       | 等级 500 解锁      |
| 13  | Slim Rod           | 20   | 10   | 10   | 25     | 20     | 500           |                    |
| 14a | Polished Wood Rod  | 40   | 10   | 10   | 10     | 45     | 500           |                    |
| 14b | Metallic Rod       | 0    | 55   | 55   | 10     | 10     | 1,000         | 重复 ID=14         |
| 15  | Rustfang Rod       | 70   | 20   | 20   | 25     | 35     | 35,000        |                    |

**属性倍率公式：** `result = (statValue / 100) + 1.0`（例如，幸运 100 → 2.0× 倍率）

---

## 7. 装备 — 鱼线

**来源：** 鱼线条目 (78d79eb2888f3a2409296f3b255eff15)，共 9 个实例

| ID  | 名称               | 幸运 | 力量 | 专精 | 吸引力 | 大鱼率 | 发光 |
| --- | ------------------ | ---- | ---- | ---- | ------ | ------ | ---- |
| 0   | Basic Line         | 0    | 0    | 0    | 0      | 0      | 0    |
| 1   | Carbon Line        | 0    | 7    | 7    | 0      | 0      | 0    |
| 2   | Hair of a Fell God | 0    | 50   | 50   | 50     | 0      | 10   |
| 3   | Lucky Line         | 30   | 0    | 0    | 0      | 0      | 0    |
| 4   | Aquamarine Line    | 0    | 0    | 0    | 5      | 0      | 0    |
| 5   | Fur of Cerberus    | 25   | −5   | −15  | 20     | 10     | 10   |
| 6   | Heavy Duty Line    | 0    | 10   | 10   | 0      | 10     | 0    |
| 7   | Diamond Line       | 25   | 15   | 15   | 10     | 0      | 1    |
| 8   | Flavored Line      | 0    | 0    | 0    | 0      | 30     | 0    |

---

## 8. 装备 — 浮漂

**来源：** 浮漂条目 (64ca1d317b8842b4aa7f64c0f8ef509a)，共 14 个实例

| ID  | 名称                 | 幸运 | 力量 | 专精 | 吸引力 | 大鱼率 |
| --- | -------------------- | ---- | ---- | ---- | ------ | ------ |
| 0   | Basic Bobber         | 0    | 0    | 0    | 0      | 0      |
| 1   | Blue Bobber          | 5    | 0    | 0    | 0      | 0      |
| 2   | Feline Bobber        | 5    | 0    | 0    | 0      | 10     |
| 3   | Lucky Bobber         | 40   | 0    | 0    | 0      | 0      |
| 4   | Dud Bobber           | 5    | 0    | 5    | 0      | 0      |
| 5   | Paulie's Bobber      | 0    | 0    | 5    | 5      | 0      |
| 6   | Default Cube Bobber  | 0    | 5    | 0    | 0      | 0      |
| 7   | DEBUG BOBBER         | 0    | 50   | 50   | 50     | 50     |
| 8   | Boba Burger          | 0    | 5    | 0    | 0      | 0      |
| 9   | Burger Bobber        | 0    | 5    | 0    | 0      | 0      |
| 10  | Cassette Bobber      | 0    | 5    | 0    | 0      | 0      |
| 11  | Floppy Disk Bobber   | 0    | 5    | 0    | 0      | 0      |
| 12  | Ornamental Bobber    | 10   | 5    | 0    | 10     | 0      |
| 13  | Rainbow Slime Bobber | 30   | 10   | 0    | 10     | 10     |

---

## 9. 装备 — 附魔

**来源：** 附魔条目 (2d630e67ab832f64fb2d882bd46fb7ed)，共 42 个实例
所有附魔均为 `equipmentType=0`（鱼竿附魔）。

### 9.1 稀有度分布

| 稀有度    | ID  | 数量 |
| --------- | --- | ---- |
| Common    | 0   | ~12  |
| Uncommon  | 1   | ~10  |
| Rare      | 2   | ~8   |
| Epic      | 3   | ~7   |
| Legendary | 4   | ~5   |

### 9.2 重要附魔

| ID  | 名称                     | 稀有度    | L   | S   | E   | A   | BC  | MW        | 特殊效果              |
| --- | ------------------------ | --------- | --- | --- | --- | --- | --- | --------- | --------------------- |
| 7   | God's Own Luck           | Legendary | 250 | —   | —   | —   | —   | —         | SE type=14            |
| 38  | Strongest Angler         | Legendary | 20  | 85  | 85  | 10  | 20  | 1,000,000 | —                     |
| 30  | Messenger of the Heavens | Legendary | —   | —   | —   | 100 | —   | —         | —                     |
| 39  | Son of Kriptan           | Epic      | 50  | 50  | 50  | 50  | 50  | 50,000    | SE type=7 (DayWalker) |
| 11  | Master of Balance        | Epic      | 20  | 20  | 20  | 20  | 20  | 400       | —                     |
| 2   | Shiny Hunter             | Epic      | 80  | —   | —   | —   | —   | —         | SE type=11 val=20     |
| 17  | Double Up!!              | Epic      | 20  | —   | —   | —   | —   | —         | SE type=1 val=25      |
| 10  | BIG BOYS ONLY            | Epic      | —   | —   | —   | —   | 65  | 100,000   | —                     |
| 6   | Money Maker              | Epic      | —   | —   | —   | —   | 20  | —         | SE type=4 val=20      |
| 9   | Mutator                  | Epic      | 30  | —   | —   | —   | —   | —         | SE type=2 val=2       |
| 24  | Luck of the Chosen       | Epic      | 100 | —   | —   | —   | 10  | —         | SE val=20             |
| 34  | Speed Demon              | Epic      | —   | —   | —   | 60  | —   | —         | SE type=10            |

L=Luck（幸运）, S=Strength（力量）, E=Expertise（专精）, A=AttractionRate（吸引力）, BC=BigCatchRate（大鱼率）, MW=MaxWeightBonus（最大重量加成）, SE=Special Effect（特殊效果）

### 9.3 特殊效果类型

| 类型 | 名称                                  | 描述                                |
| ---- | ------------------------------------- | ----------------------------------- |
| 1    | Double Up                             | 双倍捕获概率（值 = 概率 %）         |
| 2    | Mutator / Unstable                    | 提高变异（修饰器）概率（值 = 倍率） |
| 3    | Dimensional Line                      | 无区域限制抛竿概率                  |
| 4    | Pocket Watcher / Money Maker          | 出售时额外金币 %                    |
| 5    | Enlightened / Student / Curious       | 经验值加成 %                        |
| 6    | Night Stalker / Night Watcher         | 夜间特定加成                        |
| 7    | DayWalker / Son of Kriptan            | 白天特定加成                        |
| 8    | Fog Dweller                           | 雾天天气加成                        |
| 9    | Rain Lover                            | 雨天天气加成                        |
| 10   | Speed Demon / Demon Hunter            | 速度/吸引力加成                     |
| 11   | Shiny Hunter                          | 增加闪光修饰器概率                  |
| 14   | Patient / AllRounder / God's Own Luck | 被动幸运加成                        |

---

## 10. 附魔战利品表（遗物 → 附魔）

**来源：** `EnchantmentDatabase` (5cb0b2eac08c7414a8d97e7c6228ce28)

### 10.1 遗物品质 → 附魔稀有度权重

| 遗物品质        | Common | Uncommon | Rare | Epic | Legendary |
| --------------- | ------ | -------- | ---- | ---- | --------- |
| Common Relic    | 75.0   | 18.0     | 5.0  | 1.5  | 0.1       |
| Rare Relic      | 20.0   | 50.6     | 20.0 | 5.0  | 0.7       |
| Epic Relic      | 1.5    | 14.2     | 39.8 | 7.1  | 1.4       |
| Legendary Relic | 5.0    | 15.0     | 30.0 | 35.0 | 5.0       |

### 10.2 视觉稀有度权重（用于显示/排序）

| 稀有度    | 权重  |
| --------- | ----- |
| Common    | 100.0 |
| Uncommon  | 87.1  |
| Rare      | 62.0  |
| Epic      | 34.6  |
| Legendary | 11.2  |

### 10.3 概率（从权重归一化）

**来自 Common Relic（普通遗物）：**

- Common: 75.3%, Uncommon: 18.1%, Rare: 5.0%, Epic: 1.5%, **Legendary: 0.1%**

**来自 Legendary Relic（传说遗物）：**

- Common: 5.6%, Uncommon: 16.7%, Rare: 33.3%, Epic: 38.9%, **Legendary: 5.6%**

---

## 11. 装备属性聚合与公式

**来源：** `EquipmentStatsManager` (1fbef1203df5cba45bfbe981cd9ec5c8)

### 11.1 公式概览

总原始属性 = `rodStat + lineStat + bobberStat + enchantmentBonus + achievementBonus`

### 11.2 属性倍率公式

| 属性                          | 公式                                               | 备注                            |
| ----------------------------- | -------------------------------------------------- | ------------------------------- |
| **Luck（幸运）**              | `max(1.0, (rawLuck / 100) + 1.0) × buffMultiplier` | 若基础幸运为负值，返回 1.0      |
| **Strength（力量）**          | `(rawStrength / 100) + 1.0`                        | 百分比制                        |
| **Expertise（专精）**         | `(rawExpertise / 100) + 1.0`                       | 百分比制                        |
| **Big Catch Rate（大鱼率）**  | `(rawBCR / 100) + 1.0`                             | 百分比制                        |
| **Attraction Rate（吸引力）** | `min(rawAttraction, 100)`                          | 上限 100；增益将冷却时间除以 2× |
| **Max Weight（最大重量）**    | `rodMaxWeight + enchantmentMaxWeightBonus`         | 加法叠加（kg）                  |

### 11.3 使用的常量

| 常量                   | 值  | 用途                  |
| ---------------------- | --- | --------------------- |
| `const_SystemSingle_0` | 50  | —                     |
| `const_SystemSingle_1` | 1.0 | 属性基础倍率加值      |
| `const_SystemSingle_2` | 100 | 属性除数 / 吸引力上限 |
| `const_SystemSingle_3` | 2.0 | 吸引力增益除数        |
| `const_SystemSingle_4` | 0.0 | 默认/零返回值         |

### 11.4 附魔特殊效果查询

EquipmentStatsManager 暴露以下附魔衍生值：

- **`GetDoubleHookChance()`** — 来自附魔 SE type 1（例如 Double Up!! = 25%）
- **`GetMutationBoostMultiplier()`** — 来自 SE type 2（例如 Mutator = 2×）
- **`GetZonelessCastChance()`** — 来自 SE type 3（Dimensional Line）
- **`GetPocketChangePercent()`** — 来自 SE type 4（Money Maker = 20%）
- **`GetEnlightenedBonusPercent()`** — 来自 SE type 5（经验值加成附魔）
- **`GetDemonHunterChance()`** — 来自 SE type 10
- **`GetShinyHunterChance()`** — 来自 SE type 11（Shiny Hunter = 20%）

---

## 12. 增益系统

**来源：** `BuffManager` (fbccbc1d3dacb6044b4523ef1a879e36)

### 12.1 增益类型与数值

| 增益                                | 倍率                 | 持续时间         | 叠加方式                    |
| ----------------------------------- | -------------------- | ---------------- | --------------------------- |
| **Luck Potion（幸运药水）**（个人） | 2.0×                 | 时间加法叠加     | 持续时间叠加                |
| **Attraction Buff（吸引力增益）**   | 2.0×（冷却时间减半） | 时间加法叠加     | 持续时间叠加                |
| **Weather Luck（天气幸运）**        | 2.0×                 | 激活期间永久生效 | 由 BiomeWeatherManager 设置 |

### 12.2 世界幸运增益（共享，可购买）

| 等级   | 持续时间           | 幸运倍率 | 产品             |
| ------ | ------------------ | -------- | ---------------- |
| Tier 1 | 1,800 s（30 分钟） | 2.0×     | VRC Economy 商品 |
| Tier 2 | 2,700 s（45 分钟） | 4.0×     | VRC Economy 商品 |
| Tier 3 | 5,400 s（90 分钟） | 8.0×     | VRC Economy 商品 |

- 等级升级时将剩余时间加入，但已过时间有 **50% 惩罚**。
- 世界幸运增益使用服务器时间同步（`GetServerTimeInSeconds`）。
- 增益状态通过网络同步并向所有玩家广播。

### 12.3 综合幸运增益公式 (`GetLuckBuffMultiplier`)

```text
combined = 0
if luckPotionActive:    combined += 2.0  (luckPotionMultiplier)
if worldLuckBuffActive: combined += GetWorldLuckMultiplierForTier(tier)  [2/4/8]
if weatherLuckActive:   combined += 2.0  (weatherLuckMultiplier)
return max(combined, 1.0)
```

理论最大幸运增益：**2 + 8 + 2 = 12×**（三者同时激活且世界增益为 Tier 3）。

---

## 13. 海上事件

**来源：** `SeaEventSpawner` (b98606ba772ff3e41a8bd95942bd100c) + 海上事件条目 (25348dbaa17d1894f978aed49d59e50a)

### 13.1 生成器参数

| 参数                  | 值               |
| --------------------- | ---------------- |
| `maxActiveEvents`     | 2                |
| `eventLifetime`       | 600 s（10 分钟） |
| `spawnRadiusPerPoint` | 136.24           |
| `waterSurfaceHeight`  | 12.015           |
| `spawnPoints`         | 6 个位置         |

### 13.2 所有海上事件（10 种类型）

所有事件的 `eventRadius = 15`。

| #   | 生成权重    | 幸运倍率 | 稀有鱼 % | 着色器类型    | 修饰器概率倍率 | 特定修饰器 % |
| --- | ----------- | -------- | -------- | ------------- | -------------- | ------------ |
| 1   | 100（常见） | 1.0      | 0        | 7             | 2×             | 85%          |
| 2   | 100         | 1.5      | 0        | 21            | 2×             | 85%          |
| 3   | 100         | 1.0      | 0        | 14, 15        | 2×             | 85%          |
| 4   | 100         | 1.0      | 0        | 2             | 2×             | 85%          |
| 5   | 100         | 1.0      | 0        | 9             | 2×             | 85%          |
| 6   | 100         | 1.0      | 0        | 0             | 2×             | 85%          |
| 7   | 1（稀有）   | —        | 0.05     | 23            | —              | —            |
| 8   | 1（稀有）   | —        | 0.5      | 6             | —              | —            |
| 9   | 1（稀有）   | —        | 0.8      | 3             | —              | —            |
| 10  | 1（超稀有） | 2.0      | 0.8      | 1（增大尺寸） | 1.5×           | —            |

**常见事件**增强特定着色器修饰器（Cursed、Frozen、Stone/Zebra、Albino、MissingShader、None），修饰器概率 2× 且特定着色器概率为 85%。

**稀有事件**具有极高的稀有鱼生成概率（5%–80%）和独特的主题着色器。

---

## 14. 船只

**来源：** 船只条目 (5e300410777b5d445aaaf83b9351c85b)，共 7 个实例 + BoatController (292a201d1694e6a42a7e9079da128725)

### 14.1 船只属性

| ID  | 名称             | 价格      | 等级 | 速度 | 加速 | 转向 | 加速器 | 加速倍率 | 加速冷却 | 缩放 |
| --- | ---------------- | --------- | ---- | ---- | ---- | ---- | ------ | -------- | -------- | ---- |
| 0   | Surf Board       | 800       | 0    | 5    | 2    | 70   | 否     | —        | —        | 0.5  |
| 1   | RowBoat          | 3,000     | 1    | 5    | 2    | 50   | 否     | —        | —        | 0.15 |
| 2   | Dingy            | 30,000    | 2    | 10   | 4    | 65   | 否     | —        | —        | 0.1  |
| 3   | Luxury Speedboat | 1,000,000 | 4    | 25   | 5    | 65   | 是     | 2.0×     | 8 s      | 0.5  |
| 4   | Lil Yacht        | 200,000   | 3    | 20   | 3    | 55   | 是     | 1.2×     | —        | 0.4  |
| 5   | Enthusiast Boat  | 15,000    | 2    | 8    | 3    | 80   | 否     | —        | —        | 0.1  |
| 6   | Canoe            | 2,000     | 1    | 5    | 2    | 50   | 否     | —        | —        | 0.15 |

### 14.2 船只物理参数 (BoatController)

| 参数                | 值        |
| ------------------- | --------- |
| `waterYLevel`       | 11.9      |
| `bobbingAmount`     | 0.06      |
| `bobbingSpeed`      | 1.0       |
| `maxClimbableSlope` | 30°       |
| `boatBottomOffset`  | 0.25–0.34 |

---

## 15. 宠物 / AFK 宠物系统

**来源：** `PetStats` (0dbc564466389c046bb966d32a787fa0)、`AFKPet` (6753cb5c6a8a6564389806b17fb20644)、`PetDatabase` (cf61144a0e6d9be4eb617c71429e9368)

### 15.1 宠物基础属性

| 参数                       | 值               |
| -------------------------- | ---------------- |
| `baseLuck`                 | 0                |
| `baseCatchIntervalSeconds` | 600 s（10 分钟） |
| `maxCapacity`              | 5 条鱼           |
| `maxWeightKg`              | 10 kg            |
| `canCatchModifiedFish`     | false            |

### 15.2 升级系统

| 升级项      | 最高等级 | 每级加成     | 最大加成                 |
| ----------- | -------- | ------------ | ------------------------ |
| Capacity    | 14       | +5 鱼/等级   | 70 → 总计 75 条鱼        |
| Luck        | 150      | +1 幸运/等级 | +150 幸运                |
| Catch Speed | 20       | −20 s/等级   | −400 s → 最短 200 s 间隔 |
| Max Weight  | 15       | ×2 重量/等级 | ×30 → 总计 300 kg        |

### 15.3 AFK 宠物行为

| 参数                        | 值    |
| --------------------------- | ----- |
| `wanderRadius`              | 0.3   |
| `wanderSpeed`               | 0.5   |
| `turnSpeed`                 | 3.0   |
| `bobAmount`                 | 0.1   |
| `bobSpeed`                  | 2.0   |
| `wobbleAmount`              | 5.0°  |
| `wobbleSpeed`               | 1.5   |
| `animationCullDistance`     | 25    |
| `cullCheckInterval`         | 1.0 s |
| `debugCatchIntervalSeconds` | 5 s   |

### 15.4 AFK 宠物动画

| 动画 | 持续时间 | 缩放峰值 | 弹跳高度 | 挤压/拉伸 |
| ---- | -------- | -------- | -------- | --------- |
| 捕获 | 1.0 s    | 1.25×    | 0.25     | 0.25      |
| 收集 | 0.6 s    | 1.6×     | 0.15     | 0.2       |
| 待机 | —        | —        | —        | 0.05      |

### 15.5 弹窗显示

| 参数                    | 值    |
| ----------------------- | ----- |
| `popupScaleInDuration`  | 0.4 s |
| `popupDisplayDuration`  | 4.0 s |
| `popupScaleOutDuration` | 0.3 s |
| `popupFloatDistance`    | 0.5   |

---

## 16. 经验值、等级与玩家属性

**来源：** `PlayerStatsManager` (2baf2f5f5621a8b408595ec5dd222068)

### 16.1 通用参数

| 参数                   | 值                                                                   |
| ---------------------- | -------------------------------------------------------------------- |
| 最大等级               | 1000                                                                 |
| XP 阈值数组大小        | 1001 个元素                                                          |
| `levelUpParticleRange` | 20（单位）                                                           |
| `xpBarAnimationSpeed`  | 0.2                                                                  |
| 保存间隔               | 3,600 s（1 小时，通过 `const_SystemSingle_1 = 1s` 延迟刷新事件触发） |

### 16.2 追踪属性（全部网络同步）

- `level` — 当前等级
- `xp` — 累计经验值
- `money` — 当前货币
- `fishCaught` — 总捕鱼数
- `rareFishCaught` — 稀有及以上鱼捕获数
- `fishSold` — 总售出鱼数
- `tutorialsCompleted` — 布尔标志
- `timePlayed` — 游戏时长（秒，整数）
- `bountiesCompleted` — 已完成悬赏数

### 16.3 每级经验值系统 (`GetXPRequiredForLevel`)

经验值系统使用**查找表**（`xpRequiredForLevel[]`，含 1001 个条目）。主要路径为 `xpRequiredForLevel[level]`。

边界等级的回退常量：

| 常量                   | 值    | 上下文     |
| ---------------------- | ----- | ---------- |
| `const_SystemInt32_7`  | 4,000 | 高等级回退 |
| `const_SystemInt32_9`  | 2,000 | 中等级回退 |
| `const_SystemInt32_5`  | 1,000 | 低等级回退 |
| `const_SystemInt32_11` | 650   | 默认回退   |

### 16.4 等级计算

`CalculateLevelFromXP` 使用**二分查找**在累积经验值阈值数组（`cumulativeXPThresholds`）上查找玩家当前等级。

### 16.5 等级进度

```text
currentLevelStartXP = GetTotalXPForLevel(currentLevel)
xpNeeded = GetXPRequiredForLevel(currentLevel)
xpInLevel = totalXP - currentLevelStartXP
progress = Clamp01(xpInLevel / xpNeeded)
```

### 16.6 升级效果

- 在玩家头部位置生成粒子效果（5 秒后销毁）。
- 通过专用音频源播放升级音效。
- 广播网络事件，使附近玩家（`levelUpParticleRange = 20` 范围内）也能看到粒子效果。
- 根据新等级更新新手提示。
- 脏标记保存系统与延迟刷新机制。

---

## 17. 每日奖励

**来源：** `DailyRewardDatabase` (9bf5dd51636a7244b8c3be9daf1c0db1)

### 17.1 每日奖励（第 1–6 天，每周循环）

| 天数 | 类型         | 奖励        | 数量 / 金额      |
| ---- | ------------ | ----------- | ---------------- |
| 1    | Currency (0) | 250 金币    | 250              |
| 2    | Item (1)     | 2× 幸运药水 | qty 2, itemId=16 |
| 3    | Currency (0) | 500 金币    | 500              |
| 4    | Item (1)     | 2× 遗物     | qty 2, itemId=3  |
| 5    | Currency (0) | 5,000 金币  | 5,000            |
| 6    | Item (1)     | 2× 速度药水 | qty 2, itemId=15 |

### 17.2 第 7 天（每周奖励）

每周轮换的独特奖励：

| 周次 | 奖励名称           | 类型          |
| ---- | ------------------ | ------------- |
| 1    | Bucket Capybara    | Pet (type=7)  |
| 2    | Crusader Speedboat | Boat (type=6) |
| 3    | New Skin           | Skin (type=6) |
| 4    | New Skin           | Skin (type=7) |
| 5    | New Skin           | Skin (type=6) |
| 6    | New Skin           | Skin (type=7) |

### 17.3 后备奖励（所有独特第 7 天奖励领取完毕后）

| 参数                     | 值                |
| ------------------------ | ----------------- |
| `fallbackRewardName`     | "15 Bonus Scrap!" |
| `fallbackRewardType`     | 1 (Item)          |
| `fallbackItemId`         | 13                |
| `fallbackQuantity`       | 15                |
| `fallbackCurrencyAmount` | 750               |

---

## 18. 经济与鱼类估价

**来源：** 鱼类条目 `CalculateFishValue` 函数

### 18.1 鱼类价格公式

```text
weightT = InverseLerp(weight, maxWeight, minWeight)   // 0 为最小值，1 为最大值
basePrice = Lerp(weightT, maxPrice, minPrice)          // 在价格范围内插值
finalValue = basePrice × sizeMultiplier × shaderMultiplier
```

### 18.2 价值倍率叠加

1. **基础价格**：根据重量在 [minPrice, maxPrice] 范围内插值
2. **× 尺寸修饰器**（Huge = 1.5×, None = 1.0×）
3. **× 着色器修饰器**（范围：1.1× 至 5.0×）
4. **× 时间/天气偏好**（若鱼的偏好时间/天气匹配则 2×）
5. **Pocket Change 附魔**：出售时增加额外百分比
6. **Double Up 附魔**：有概率使价值翻倍

### 18.3 理论最大价值倍率

- Holographic 或 Static 着色器：5.0×
- Huge 尺寸：1.5×
- 时间/天气偏好：2.0×
- 合计：在附魔加成之前，基础价格最高可达 **15×**

---

## 附录 A：系统架构概览

```text
FishDatabase ──► SelectRarityTier() ──► SelectFish() ──► FishEntry
     │                    ▲                                  │
     │               luck multiplier                    CalculateFishValue()
     │                    │                                  │
EquipmentStatsManager ◄── BuffManager               FishModifierManager
     │                                                       │
     ├── Rod + Line + Bobber                     RollBothModifiers()
     ├── EnchantmentManager                              │
     └── AchievementManager                    Size × Shader multiplier
                                                         │
DayNightCycle ──► time of day               SeaEventSpawner
BiomeWeatherManager ──► weather                  │
     │                                    boost modifier chance
     └── moonrain (15% per night)         + rare fish chance

PlayerStatsManager                   AFKPet
     │                                  │
     ├── XP + Level (binary search)     ├── PetStats (upgradeable)
     ├── Money                          └── auto-catch from FishDatabase
     └── Fish tracking
```

## 附录 B：关键常量汇总

| 系统            | 常量                     | 值        | 用途               |
| --------------- | ------------------------ | --------- | ------------------ |
| FishDatabase    | zoneSpecificChance       | 80        | 区域鱼优先概率 %   |
| FishingMinigame | gravity                  | 1.25      | 进度条物理         |
| FishingMinigame | playerSpeed              | 3.75      | 玩家进度条移动速度 |
| DayNightCycle   | cycleDuration            | 1200 s    | 完整昼夜周期       |
| Weather         | weatherChangeInterval    | 120 s     | 天气判定频率       |
| Weather         | moonrainChance           | 0.15      | 夜间月雨概率       |
| SeaEvent        | maxActiveEvents          | 2         | 同时存在的事件数   |
| SeaEvent        | eventLifetime            | 600 s     | 事件持续时间       |
| BuffManager     | luckPotionMultiplier     | 2.0×      | 个人幸运药水       |
| BuffManager     | attractionBuffMultiplier | 2.0×      | 吸引力增益         |
| BuffManager     | weatherLuckMultiplier    | 2.0×      | 天气幸运           |
| BuffManager     | worldLuckTier3Multiplier | 8.0×      | 最大共享幸运       |
| Modifiers       | sizeModifierChance       | 10%       | 每次捕获的概率     |
| Modifiers       | shaderModifierChance     | 7.5%      | 每次捕获的概率     |
| Modifiers       | doubleModifierChance     | 5%        | 同时获得双修饰器   |
| Pet             | baseCatchInterval        | 600 s     | 基础 AFK 捕获时间  |
| Pet             | maxCapacity              | 5（基础） | 基础鱼存储量       |
| PlayerStats     | maxLevel                 | 1000      | 等级上限           |
