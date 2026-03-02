# Fish World VRChat — Complete Game Data Analysis

English | [简体中文](complete-game-data-analysis-zh.md)

> Extracted from decompiled Udon IL bytecode (174 programs). All numerical values are verbatim from the source.

---

## Table of Contents

1. [Fish Spawning & Rarity System](#1-fish-spawning--rarity-system)
2. [Fishing Minigame Mechanics](#2-fishing-minigame-mechanics)
3. [Fish Modifiers (Shaders & Size)](#3-fish-modifiers-shaders--size)
4. [Weather & Biome System](#4-weather--biome-system)
5. [Day/Night Cycle](#5-daynight-cycle)
6. [Equipment — Rods](#6-equipment--rods)
7. [Equipment — Lines](#7-equipment--lines)
8. [Equipment — Bobbers](#8-equipment--bobbers)
9. [Equipment — Enchantments](#9-equipment--enchantments)
10. [Enchantment Loot Tables (Relic → Enchantment)](#10-enchantment-loot-tables-relic--enchantment)
11. [Equipment Stats Aggregation & Formulas](#11-equipment-stats-aggregation--formulas)
12. [Buff System](#12-buff-system)
13. [Sea Events](#13-sea-events)
14. [Boats](#14-boats)
15. [Pet / AFK Pet System](#15-pet--afk-pet-system)
16. [XP, Leveling & Player Stats](#16-xp-leveling--player-stats)
17. [Daily Rewards](#17-daily-rewards)
18. [Economy & Fish Valuation](#18-economy--fish-valuation)

---

## 1. Fish Spawning & Rarity System

**Source:** `FishDatabase` (711854d789cde03439ab365052973864)

### 1.1 Rarity Tier Base Chances

| Rarity          | Base Chance  | Luck Power |
| --------------- | ------------ | ---------- |
| Trash           | 0.09 (9%)    | −1.0       |
| Abundant        | 0.27 (27%)   | −0.8       |
| Common          | 0.25 (25%)   | −0.1       |
| Curious         | 0.18 (18%)   | +0.35      |
| Elusive         | 0.11 (11%)   | +0.6       |
| Fabled          | 0.044 (4.4%) | +0.7       |
| Mythic          | 0.025 (2.5%) | +0.6       |
| Exotic          | 0.01 (1%)    | +0.6       |
| Relic           | 0.03 (3%)    | +0.1       |
| Secret          | 0.01 (1%)    | +2.0       |
| Ultimate Secret | 0.004 (0.4%) | +1.9       |

- **Rarity enum values (internal):** Trash=0, Abundant=1, Common=7, Curious=8, Elusive=9, Fabled=10, Mythic=11, Exotic=4, Relic=3, Secret=12, UltimateSecret=(inferred 13+)

### 1.2 Rarity Selection Algorithm (`SelectRarityTier`)

1. Build a 10-element `modifiedChances[]` array from base chances.
2. Apply **sigmoid-like luck smoothing**: each rarity's chance is adjusted by `luckPower[i] * luckMultiplier`, using a sigmoid curve to prevent extreme outliers.
3. Normalize all chances so they sum to 1.0.
4. Roll a random float [0, 1) and walk the cumulative distribution to select a tier.

### 1.3 Zone Priority System

- **`zoneSpecificChance` = 80** → 80% of the time, the system tries to select a zone-specific fish first.
- Selection order: **zone-specific fish → universal fish → open-sea fish** (fallback pools).
- Each fish has `allowedZoneIDs[]` and `forbiddenZoneIDs[]` to control spawning.

### 1.4 Fish Spawn Conditions (per fish entry)

Every fish species defines:

| Property               | Type  | Description                           |
| ---------------------- | ----- | ------------------------------------- |
| `canSpawnInFreshwater` | bool  | Can spawn in freshwater zones         |
| `canSpawnInSaltwater`  | bool  | Can spawn in saltwater zones          |
| `canSpawnInSwampwater` | bool  | Can spawn in swamp zones              |
| `canSpawnInLava`       | bool  | Can spawn in lava zones               |
| `canSpawnInDay`        | bool  | Allowed during daytime                |
| `canSpawnInNight`      | bool  | Allowed during nighttime              |
| `spawnInAnySaltwater`  | bool  | Any saltwater zone, ignoring zone IDs |
| `allowedZoneIDs[]`     | int[] | Whitelist of zone IDs                 |
| `forbiddenZoneIDs[]`   | int[] | Blacklist of zone IDs                 |

### 1.5 Time & Weather Preferences (Value Multiplier)

Each fish can prefer specific times/weather. When matched, the fish receives a **×2 value multiplier** (`const_SystemSingle_2`):

- **Time:** `prefersMorning`, `prefersDay`, `prefersEvening`, `prefersNight`
- **Weather:** `prefersClear`, `prefersRainy`, `prefersStormy`, `prefersFoggy`, `prefersMoonrain`, `prefersStarfog`, `prefersSkybloom`

### 1.6 Fish Data Schema (per species)

| Field              | Type   | Example (Crab of Duality) |
| ------------------ | ------ | ------------------------- |
| `fishId`           | int    | 134                       |
| `fishName`         | string | "Crab of Duality"         |
| `enabled`          | bool   | true                      |
| `rarity`           | int    | 10 (Fabled)               |
| `difficulty`       | int    | 5                         |
| `baseValue`        | int    | 10                        |
| `minPrice`         | int    | 35,000                    |
| `maxPrice`         | int    | 45,000                    |
| `minWeight`        | float  | 150 kg                    |
| `maxWeight`        | float  | 350 kg                    |
| `relicDropWeight`  | int    | 10                        |
| `catchOnce`        | bool   | false                     |
| `rewardsQuestItem` | bool   | false                     |

---

## 2. Fishing Minigame Mechanics

**Source:** `FishingMinigameScript` (2af157c6afd4f2e479afe773efb9f6ea)

### 2.1 Difficulty-Interpolated Parameters

All values interpolate between **easy** (difficulty=0) and **hard** (difficulty=1) using the fish's normalized difficulty:

| Parameter                 | Easy  | Hard   |
| ------------------------- | ----- | ------ |
| Target size               | 1.2   | 0.7    |
| Direction change time     | 0.5 s | 0.4 s  |
| Fish smooth time          | 1.0 s | 0.19 s |
| Catch speed (fill rate)   | 0.2/s | 0.06/s |
| Lose speed (drain rate)   | 0.1/s | 0.15/s |
| Max lose speed multiplier | 1×    | 3×     |

- **`loseSpeedEscalationRate`** = 0.1 (lose speed increases over time)

### 2.2 Physics & Controls

| Parameter               | Value |
| ----------------------- | ----- |
| Gravity                 | 1.25  |
| Player speed            | 3.75  |
| Fish target hitbox size | 0.1   |
| Bar height              | 2.8   |
| Preparation time        | 1.0 s |

### 2.3 Shake Effect

| Parameter                   | Value |
| --------------------------- | ----- |
| `difficultyShakeMultiplier` | 0.2   |
| `shakeSpeed`                | 50    |
| `maxShakeRotation`          | 0.8   |
| `shakeIntensity`            | 0.01  |

### 2.4 VR Adjustments

| Parameter               | Value |
| ----------------------- | ----- |
| `vrLoseSpeedMultiplier` | 1.0   |
| `vrTargetSizeBonus`     | 0.04  |
| `vrTriggerThreshold`    | 0.15  |

### 2.5 FPS Assist

| Parameter                        | Value |
| -------------------------------- | ----- |
| `fpsAssistCutoffFPS`             | 30    |
| `fpsAssistMaxBenefitFPS`         | 15    |
| `fpsAssistMaxBonus`              | 0.05  |
| `fpsFishSpeedMinMultiplier`      | 0.95  |
| `fpsFishVRSlowdownMultiplier`    | 0.95  |
| `fpsFishSlowdownStartDifficulty` | 6     |

### 2.6 Equipment Effects on Minigame

- **Strength** → reduces fish decay / lose speed. Formula: `Clamp(value, 0.25, 1.0)` — strength effectively halves to quarters the lose rate.
- **Expertise** → increases target hitbox size. Minimum multiplier = 0.5×.
- **Tutorial catch threshold** = 20 (tutorial mode until 20 catches).

### 2.7 UI Animation

| Parameter                | Value  |
| ------------------------ | ------ |
| `panelPopOvershoot`      | 1.1    |
| `panelPopDuration`       | 0.25 s |
| `scaleOvershoot`         | 1.15   |
| `scaleAnimationDuration` | 0.5 s  |
| `buttonAnimationSpeed`   | 0.8    |
| `tooltipVisibleDuration` | 8.0 s  |

---

## 3. Fish Modifiers (Shaders & Size)

**Source:** `FishModifierManager` (281c3f3520b06e64686282e5951ab067)

### 3.1 Base Modifier Chances

| Parameter                     | Value                        |
| ----------------------------- | ---------------------------- |
| `sizeModifierChancePercent`   | 10%                          |
| `shaderModifierChancePercent` | 7.5%                         |
| `doubleModifierChancePercent` | 5%                           |
| `hugeVsTinyRatio`             | 50 (50% chance huge vs tiny) |

### 3.2 Modifier Roll Process

1. Roll `doubleModifierChancePercent` (5%) — if success, roll BOTH size + shader.
2. Otherwise, roll `sizeModifierChancePercent` (10%) for size only.
3. Otherwise, roll `shaderModifierChancePercent` (7.5%) for shader only.
4. Sea event boosted type can override the roll result.
5. **Final value = sizeMultiplier × shaderMultiplier** (multiplicative).

### 3.3 Shader Modifier Value Multipliers

| ID  | Shader Name   | Value Multiplier |
| --- | ------------- | ---------------- |
| 0   | None          | 1.0×             |
| 1   | _(unnamed)_   | —                |
| 2   | Albino        | 1.5×             |
| 3   | Shiny         | 2.0×             |
| 4   | Golden        | 3.0×             |
| 5   | Ghastly       | 1.5×             |
| 6   | Blessed       | 3.0×             |
| 7   | Cursed        | 1.1×             |
| 8   | Radioactive   | 3.0×             |
| 9   | MissingShader | 1.5×             |
| 10  | Sandy         | 1.2×             |
| 11  | Holographic   | 5.0×             |
| 12  | Burning       | 4.0×             |
| 13  | Rainbow       | 3.0×             |
| 14  | Stone         | 1.3×             |
| 15  | Zebra         | 1.3×             |
| 16  | Tiger         | 1.6×             |
| 17  | Camo          | 1.8×             |
| 18  | Electric      | 4.0×             |
| 19  | Static        | 5.0×             |
| 20  | Void          | 2.0×             |
| 21  | Frozen        | 2.0×             |
| 22  | Shadow        | 2.0×             |
| 23  | Negative      | 1.5×             |
| 24  | Galaxy        | 3.0×             |

### 3.4 Size Modifier Value Multiplier

| Size Type | Multiplier |
| --------- | ---------- |
| None      | 1.0×       |
| Huge      | 1.5×       |

---

## 4. Weather & Biome System

**Source:** `BiomeWeatherManager` (ab4526b1e2c72f04482e668077491462)

### 4.1 Global Weather Parameters

| Parameter                       | Value                |
| ------------------------------- | -------------------- |
| `weatherChangeInterval`         | 120 s (2 min)        |
| `moonrainChance`                | 0.15 (15% per night) |
| `atmosphericTransitionDuration` | 10 s                 |
| `audioTransitionDuration`       | 5 s                  |
| `indoorHeightThreshold`         | −100                 |
| `belowThresholdWeather`         | 0 (Clear)            |
| `useHeightFiltering`            | true                 |

### 4.2 Weather Types (inferred IDs)

| ID  | Weather |
| --- | ------- |
| 0   | Clear   |
| 1   | Rainy   |
| 3   | Stormy  |
| 4   | Foggy   |

### 4.3 Default Weather (outside biomes)

| Weather    | Weight |
| ---------- | ------ |
| Stormy (3) | 25     |
| Clear (0)  | 50     |
| Rainy (1)  | 25     |

### 4.4 Biome Definitions

| Biome | Name     | Radius | Priority |
| ----- | -------- | ------ | -------- |
| 0     | DESERT   | 426.5  | 50       |
| 1     | TROPICAL | 1296.0 | 0        |
| 2     | SWAMP    | 309.92 | 50       |

### 4.5 Per-Biome Weather Weights

**Desert biome:**

| Weather    | Weight |
| ---------- | ------ |
| Clear (0)  | 65     |
| Stormy (3) | 30     |
| Rainy (1)  | 5      |

**Tropical biome:**

| Weather    | Weight |
| ---------- | ------ |
| Clear (0)  | 60     |
| Rainy (1)  | 25     |
| Stormy (3) | 15     |

**Swamp biome:**

| Weather    | Weight |
| ---------- | ------ |
| Rainy (1)  | 40     |
| Clear (0)  | 20     |
| Stormy (3) | 40     |
| Foggy (4)  | 5      |

---

## 5. Day/Night Cycle

**Source:** `DayNightCycle` (2aa0a7746b48abe47bdbb4aef4d69c71)

| Parameter              | Value                    |
| ---------------------- | ------------------------ |
| `cycleDurationSeconds` | 1200 s (20 min total)    |
| `startTimeNormalized`  | 0.25 (begins at morning) |
| `midnightAngle`        | 90°                      |

### Time Period Durations

| Period  | Fraction | Duration      |
| ------- | -------- | ------------- |
| Morning | 0.20     | 240 s (4 min) |
| Day     | 0.30     | 360 s (6 min) |
| Evening | 0.20     | 240 s (4 min) |
| Night   | 0.30     | 360 s (6 min) |

- **Daytime** = Morning + Day = 10 min (50%)
- **Nighttime** = Evening + Night = 10 min (50%)

---

## 6. Equipment — Rods

**Source:** Rod entries (0a7fe06dcadd5694087b8c7d5bdbf8fd), 17 instances

| ID  | Name               | Luck | Str | Exp | Attract | BigCatch | MaxWeight (kg) | Notes                        |
| --- | ------------------ | ---- | --- | --- | ------- | -------- | -------------- | ---------------------------- |
| 0   | Stick and String   | −50  | 0   | 0   | 0       | −100     | 5              | Starter, unlocked by default |
| 1   | Sturdy Wooden Rod  | 15   | 0   | 5   | 20      | 0        | 30             |                              |
| 2   | Telescopic Rod     | 10   | 15  | 15  | 10      | 5        | 2,005          |                              |
| 3   | Darkwood Rod       | 30   | 10  | 10  | 30      | 5        | 1,800          |                              |
| 4   | Runesteel Rod      | 90   | 25  | 20  | 30      | 40       | 100,000        | Best overall                 |
| 5   | DEBUG ROD          | 0    | 0   | 0   | 0       | 0        | 1              | Debug only                   |
| 6   | Sunleaf Rod        | 10   | 5   | 10  | 20      | 15       | 250            |                              |
| 7   | Speedy Rod         | 20   | 5   | 15  | 65      | 0        | 1,500          | Highest attraction           |
| 8   | Fortunate Rod      | 100  | 10  | 5   | 10      | 77       | 1,500          | Best luck (mid-tier)         |
| 9   | Toy Rod            | 0    | 0   | 0   | 0       | 0        | 15             | Novelty                      |
| 10  | Alien Rod          | 50   | 10  | 5   | 40      | 30       | 32,000         |                              |
| 11  | Rod of Perpetuity  | 150  | 30  | 30  | 50      | 10       | 500,000        | Unlock at level 500          |
| 12  | Rod of the Pharaoh | 200  | 20  | 40  | −10     | 30       | 100,000        | Unlock at level 500          |
| 13  | Slim Rod           | 20   | 10  | 10  | 25      | 20       | 500            |                              |
| 14a | Polished Wood Rod  | 40   | 10  | 10  | 10      | 45       | 500            |                              |
| 14b | Metallic Rod       | 0    | 55  | 55  | 10      | 10       | 1,000          | Duplicate ID=14              |
| 15  | Rustfang Rod       | 70   | 20  | 20  | 25      | 35       | 35,000         |                              |

**Stat multiplier formula:** `result = (statValue / 100) + 1.0` (e.g., Luck 100 → 2.0× multiplier)

---

## 7. Equipment — Lines

**Source:** Line entries (78d79eb2888f3a2409296f3b255eff15), 9 instances

| ID  | Name               | Luck | Str | Exp | Attract | BigCatch | Glow |
| --- | ------------------ | ---- | --- | --- | ------- | -------- | ---- |
| 0   | Basic Line         | 0    | 0   | 0   | 0       | 0        | 0    |
| 1   | Carbon Line        | 0    | 7   | 7   | 0       | 0        | 0    |
| 2   | Hair of a Fell God | 0    | 50  | 50  | 50      | 0        | 10   |
| 3   | Lucky Line         | 30   | 0   | 0   | 0       | 0        | 0    |
| 4   | Aquamarine Line    | 0    | 0   | 0   | 5       | 0        | 0    |
| 5   | Fur of Cerberus    | 25   | −5  | −15 | 20      | 10       | 10   |
| 6   | Heavy Duty Line    | 0    | 10  | 10  | 0       | 10       | 0    |
| 7   | Diamond Line       | 25   | 15  | 15  | 10      | 0        | 1    |
| 8   | Flavored Line      | 0    | 0   | 0   | 0       | 30       | 0    |

---

## 8. Equipment — Bobbers

**Source:** Bobber entries (64ca1d317b8842b4aa7f64c0f8ef509a), 14 instances

| ID  | Name                 | Luck | Str | Exp | Attract | BigCatch |
| --- | -------------------- | ---- | --- | --- | ------- | -------- |
| 0   | Basic Bobber         | 0    | 0   | 0   | 0       | 0        |
| 1   | Blue Bobber          | 5    | 0   | 0   | 0       | 0        |
| 2   | Feline Bobber        | 5    | 0   | 0   | 0       | 10       |
| 3   | Lucky Bobber         | 40   | 0   | 0   | 0       | 0        |
| 4   | Dud Bobber           | 5    | 0   | 5   | 0       | 0        |
| 5   | Paulie's Bobber      | 0    | 0   | 5   | 5       | 0        |
| 6   | Default Cube Bobber  | 0    | 5   | 0   | 0       | 0        |
| 7   | DEBUG BOBBER         | 0    | 50  | 50  | 50      | 50       |
| 8   | Boba Burger          | 0    | 5   | 0   | 0       | 0        |
| 9   | Burger Bobber        | 0    | 5   | 0   | 0       | 0        |
| 10  | Cassette Bobber      | 0    | 5   | 0   | 0       | 0        |
| 11  | Floppy Disk Bobber   | 0    | 5   | 0   | 0       | 0        |
| 12  | Ornamental Bobber    | 10   | 5   | 0   | 10      | 0        |
| 13  | Rainbow Slime Bobber | 30   | 10  | 0   | 10      | 10       |

---

## 9. Equipment — Enchantments

**Source:** Enchantment entries (2d630e67ab832f64fb2d882bd46fb7ed), 42 instances  
All enchantments are `equipmentType=0` (rod enchantments).

### 9.1 Rarity Distribution

| Rarity    | ID  | Count |
| --------- | --- | ----- |
| Common    | 0   | ~12   |
| Uncommon  | 1   | ~10   |
| Rare      | 2   | ~8    |
| Epic      | 3   | ~7    |
| Legendary | 4   | ~5    |

### 9.2 Notable Enchantments

| ID  | Name                     | Rarity    | L   | S   | E   | A   | BC  | MW        | Special               |
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

L=Luck, S=Strength, E=Expertise, A=AttractionRate, BC=BigCatchRate, MW=MaxWeightBonus, SE=Special Effect

### 9.3 Special Effect Types

| Type | Name                                  | Description                                            |
| ---- | ------------------------------------- | ------------------------------------------------------ |
| 1    | Double Up                             | Chance to double the catch (value = chance %)          |
| 2    | Mutator / Unstable                    | Boosts mutation (modifier) chance (value = multiplier) |
| 3    | Dimensional Line                      | Zoneless cast chance                                   |
| 4    | Pocket Watcher / Money Maker          | Bonus money % on sell                                  |
| 5    | Enlightened / Student / Curious       | XP bonus %                                             |
| 6    | Night Stalker / Night Watcher         | Night-specific bonus                                   |
| 7    | DayWalker / Son of Kriptan            | Day-specific bonus                                     |
| 8    | Fog Dweller                           | Fog weather bonus                                      |
| 9    | Rain Lover                            | Rain weather bonus                                     |
| 10   | Speed Demon / Demon Hunter            | Speed/attraction bonus                                 |
| 11   | Shiny Hunter                          | Increased shiny modifier chance                        |
| 14   | Patient / AllRounder / God's Own Luck | Passive luck bonus                                     |

---

## 10. Enchantment Loot Tables (Relic → Enchantment)

**Source:** `EnchantmentDatabase` (5cb0b2eac08c7414a8d97e7c6228ce28)

### 10.1 Relic Quality → Enchantment Rarity Weights

| Relic Quality   | Common | Uncommon | Rare | Epic | Legendary |
| --------------- | ------ | -------- | ---- | ---- | --------- |
| Common Relic    | 75.0   | 18.0     | 5.0  | 1.5  | 0.1       |
| Rare Relic      | 20.0   | 50.6     | 20.0 | 5.0  | 0.7       |
| Epic Relic      | 1.5    | 14.2     | 39.8 | 7.1  | 1.4       |
| Legendary Relic | 5.0    | 15.0     | 30.0 | 35.0 | 5.0       |

### 10.2 Visual Rarity Weights (for display/sorting)

| Rarity    | Weight |
| --------- | ------ |
| Common    | 100.0  |
| Uncommon  | 87.1   |
| Rare      | 62.0   |
| Epic      | 34.6   |
| Legendary | 11.2   |

### 10.3 Probabilities (normalized from weights)

**From a Common Relic:**

- Common: 75.3%, Uncommon: 18.1%, Rare: 5.0%, Epic: 1.5%, **Legendary: 0.1%**

**From a Legendary Relic:**

- Common: 5.6%, Uncommon: 16.7%, Rare: 33.3%, Epic: 38.9%, **Legendary: 5.6%**

---

## 11. Equipment Stats Aggregation & Formulas

**Source:** `EquipmentStatsManager` (1fbef1203df5cba45bfbe981cd9ec5c8)

### 11.1 Formula Overview

Total raw stat = `rodStat + lineStat + bobberStat + enchantmentBonus + achievementBonus`

### 11.2 Stat Multiplier Formulas

| Stat                | Formula                                            | Notes                                      |
| ------------------- | -------------------------------------------------- | ------------------------------------------ |
| **Luck**            | `max(1.0, (rawLuck / 100) + 1.0) × buffMultiplier` | If base luck is negative, returns 1.0      |
| **Strength**        | `(rawStrength / 100) + 1.0`                        | Percentage-based                           |
| **Expertise**       | `(rawExpertise / 100) + 1.0`                       | Percentage-based                           |
| **Big Catch Rate**  | `(rawBCR / 100) + 1.0`                             | Percentage-based                           |
| **Attraction Rate** | `min(rawAttraction, 100)`                          | Capped at 100; buff divides cooldown by 2× |
| **Max Weight**      | `rodMaxWeight + enchantmentMaxWeightBonus`         | Additive kg                                |

### 11.3 Constants Used

| Constant               | Value | Used For                            |
| ---------------------- | ----- | ----------------------------------- |
| `const_SystemSingle_0` | 50    | —                                   |
| `const_SystemSingle_1` | 1.0   | Base multiplier added to stat       |
| `const_SystemSingle_2` | 100   | Stat division / attraction rate cap |
| `const_SystemSingle_3` | 2.0   | Attraction buff divisor             |
| `const_SystemSingle_4` | 0.0   | Default/zero return                 |

### 11.4 Enchantment Special Effect Queries

The EquipmentStatsManager exposes these enchantment-derived values:

- **`GetDoubleHookChance()`** — from enchant SE type 1 (e.g., Double Up!! = 25%)
- **`GetMutationBoostMultiplier()`** — from SE type 2 (e.g., Mutator = 2×)
- **`GetZonelessCastChance()`** — from SE type 3 (Dimensional Line)
- **`GetPocketChangePercent()`** — from SE type 4 (Money Maker = 20%)
- **`GetEnlightenedBonusPercent()`** — from SE type 5 (XP bonus enchants)
- **`GetDemonHunterChance()`** — from SE type 10
- **`GetShinyHunterChance()`** — from SE type 11 (Shiny Hunter = 20%)

---

## 12. Buff System

**Source:** `BuffManager` (fbccbc1d3dacb6044b4523ef1a879e36)

### 12.1 Buff Types & Values

| Buff                       | Multiplier              | Duration               | Stacking                   |
| -------------------------- | ----------------------- | ---------------------- | -------------------------- |
| **Luck Potion** (personal) | 2.0×                    | Additive timer         | Duration stacks            |
| **Attraction Buff**        | 2.0× (divides cooldown) | Additive timer         | Duration stacks            |
| **Weather Luck**           | 2.0×                    | Permanent while active | Set by BiomeWeatherManager |

### 12.2 World Luck Buff (shared, purchasable)

| Tier   | Duration         | Luck Multiplier | Product             |
| ------ | ---------------- | --------------- | ------------------- |
| Tier 1 | 1,800 s (30 min) | 2.0×            | VRC Economy product |
| Tier 2 | 2,700 s (45 min) | 4.0×            | VRC Economy product |
| Tier 3 | 5,400 s (90 min) | 8.0×            | VRC Economy product |

- Tier upgrade adds remaining time with a **50% penalty** on elapsed time.
- World luck buff uses server time synchronization (`GetServerTimeInSeconds`).
- Buff state is network-synced and announced to all players.

### 12.3 Combined Luck Buff Formula (`GetLuckBuffMultiplier`)

```text
combined = 0
if luckPotionActive:    combined += 2.0  (luckPotionMultiplier)
if worldLuckBuffActive: combined += GetWorldLuckMultiplierForTier(tier)  [2/4/8]
if weatherLuckActive:   combined += 2.0  (weatherLuckMultiplier)
return max(combined, 1.0)
```

Maximum theoretical luck buff: **2 + 8 + 2 = 12×** (all three active with Tier 3 world buff).

---

## 13. Sea Events

**Source:** `SeaEventSpawner` (b98606ba772ff3e41a8bd95942bd100c) + Sea Event entries (25348dbaa17d1894f978aed49d59e50a)

### 13.1 Spawner Parameters

| Parameter             | Value          |
| --------------------- | -------------- |
| `maxActiveEvents`     | 2              |
| `eventLifetime`       | 600 s (10 min) |
| `spawnRadiusPerPoint` | 136.24         |
| `waterSurfaceHeight`  | 12.015         |
| `spawnPoints`         | 6 locations    |

### 13.2 All Sea Events (10 types)

All events have `eventRadius = 15`.

| #   | Spawn Weight   | Luck Mult | Rare Fish % | Shader Types     | Modifier Chance Mult | Specific Modifier % |
| --- | -------------- | --------- | ----------- | ---------------- | -------------------- | ------------------- |
| 1   | 100 (common)   | 1.0       | 0           | 7                | 2×                   | 85%                 |
| 2   | 100            | 1.5       | 0           | 21               | 2×                   | 85%                 |
| 3   | 100            | 1.0       | 0           | 14, 15           | 2×                   | 85%                 |
| 4   | 100            | 1.0       | 0           | 2                | 2×                   | 85%                 |
| 5   | 100            | 1.0       | 0           | 9                | 2×                   | 85%                 |
| 6   | 100            | 1.0       | 0           | 0                | 2×                   | 85%                 |
| 7   | 1 (rare)       | —         | 0.05        | 23               | —                    | —                   |
| 8   | 1 (rare)       | —         | 0.5         | 6                | —                    | —                   |
| 9   | 1 (rare)       | —         | 0.8         | 3                | —                    | —                   |
| 10  | 1 (ultra-rare) | 2.0       | 0.8         | 1 (boosted size) | 1.5×                 | —                   |

**Common events** boost a specific shader modifier (Cursed, Frozen, Stone/Zebra, Albino, MissingShader, None) with 2× modifier chance and 85% chance of the specific shader.

**Rare events** have very high rare fish spawn chances (5%–80%) and unique themed shaders.

---

## 14. Boats

**Source:** Boat entries (5e300410777b5d445aaaf83b9351c85b), 7 instances + BoatController (292a201d1694e6a42a7e9079da128725)

### 14.1 Boat Stats

| ID  | Name             | Price     | Class | Speed | Accel | Turn | Boost | Boost Mult | Boost CD | Scale |
| --- | ---------------- | --------- | ----- | ----- | ----- | ---- | ----- | ---------- | -------- | ----- |
| 0   | Surf Board       | 800       | 0     | 5     | 2     | 70   | No    | —          | —        | 0.5   |
| 1   | RowBoat          | 3,000     | 1     | 5     | 2     | 50   | No    | —          | —        | 0.15  |
| 2   | Dingy            | 30,000    | 2     | 10    | 4     | 65   | No    | —          | —        | 0.1   |
| 3   | Luxury Speedboat | 1,000,000 | 4     | 25    | 5     | 65   | Yes   | 2.0×       | 8 s      | 0.5   |
| 4   | Lil Yacht        | 200,000   | 3     | 20    | 3     | 55   | Yes   | 1.2×       | —        | 0.4   |
| 5   | Enthusiast Boat  | 15,000    | 2     | 8     | 3     | 80   | No    | —          | —        | 0.1   |
| 6   | Canoe            | 2,000     | 1     | 5     | 2     | 50   | No    | —          | —        | 0.15  |

### 14.2 Boat Physics (BoatController)

| Parameter           | Value     |
| ------------------- | --------- |
| `waterYLevel`       | 11.9      |
| `bobbingAmount`     | 0.06      |
| `bobbingSpeed`      | 1.0       |
| `maxClimbableSlope` | 30°       |
| `boatBottomOffset`  | 0.25–0.34 |

---

## 15. Pet / AFK Pet System

**Source:** `PetStats` (0dbc564466389c046bb966d32a787fa0), `AFKPet` (6753cb5c6a8a6564389806b17fb20644), `PetDatabase` (cf61144a0e6d9be4eb617c71429e9368)

### 15.1 Base Pet Stats

| Parameter                  | Value          |
| -------------------------- | -------------- |
| `baseLuck`                 | 0              |
| `baseCatchIntervalSeconds` | 600 s (10 min) |
| `maxCapacity`              | 5 fish         |
| `maxWeightKg`              | 10 kg          |
| `canCatchModifiedFish`     | false          |

### 15.2 Upgrade System

| Upgrade     | Max Level | Bonus per Level | Max Bonus                   |
| ----------- | --------- | --------------- | --------------------------- |
| Capacity    | 14        | +5 fish/level   | 70 → total 75 fish          |
| Luck        | 150       | +1 luck/level   | +150 luck                   |
| Catch Speed | 20        | −20 s/level     | −400 s → min 200 s interval |
| Max Weight  | 15        | ×2 weight/level | ×30 → 300 kg total          |

### 15.3 AFK Pet Behavior

| Parameter                   | Value |
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

### 15.4 AFK Pet Animations

| Animation | Duration | Scale Peak | Bounce Height | Squash/Stretch |
| --------- | -------- | ---------- | ------------- | -------------- |
| Catch     | 1.0 s    | 1.25×      | 0.25          | 0.25           |
| Collect   | 0.6 s    | 1.6×       | 0.15          | 0.2            |
| Idle      | —        | —          | —             | 0.05           |

### 15.5 Popup Display

| Parameter               | Value |
| ----------------------- | ----- |
| `popupScaleInDuration`  | 0.4 s |
| `popupDisplayDuration`  | 4.0 s |
| `popupScaleOutDuration` | 0.3 s |
| `popupFloatDistance`    | 0.5   |

---

## 16. XP, Leveling & Player Stats

**Source:** `PlayerStatsManager` (2baf2f5f5621a8b408595ec5dd222068)

### 16.1 General Parameters

| Parameter               | Value                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| Max level               | 1000                                                                     |
| XP threshold array size | 1001 elements                                                            |
| `levelUpParticleRange`  | 20 (units)                                                               |
| `xpBarAnimationSpeed`   | 0.2                                                                      |
| Save interval           | 3,600 s (1 hour, via delayed event at `const_SystemSingle_1 = 1s` flush) |

### 16.2 Tracked Stats (all network-synced)

- `level` — current level
- `xp` — cumulative XP
- `money` — current currency
- `fishCaught` — total fish caught
- `rareFishCaught` — rare+ fish caught
- `fishSold` — total fish sold
- `tutorialsCompleted` — boolean flag
- `timePlayed` — seconds played (integer)
- `bountiesCompleted` — bounties done

### 16.3 XP Per Level System (`GetXPRequiredForLevel`)

The XP system uses a **lookup table** (`xpRequiredForLevel[]` with 1001 entries). The primary path is `xpRequiredForLevel[level]`.

Fallback constants for edge-case levels:

| Constant               | Value | Context              |
| ---------------------- | ----- | -------------------- |
| `const_SystemInt32_7`  | 4,000 | High-level fallback  |
| `const_SystemInt32_9`  | 2,000 | Mid-range fallback   |
| `const_SystemInt32_5`  | 1,000 | Lower-level fallback |
| `const_SystemInt32_11` | 650   | Default fallback     |

### 16.4 Level Calculation

`CalculateLevelFromXP` uses **binary search** on the cumulative XP thresholds array (`cumulativeXPThresholds`) to find the player's level from total XP.

### 16.5 Level Progress

```text
currentLevelStartXP = GetTotalXPForLevel(currentLevel)
xpNeeded = GetXPRequiredForLevel(currentLevel)
xpInLevel = totalXP - currentLevelStartXP
progress = Clamp01(xpInLevel / xpNeeded)
```

### 16.6 Level-Up Effects

- Particle effect spawned at player head position (destroyed after 5 s).
- Level-up sound played via dedicated audio source.
- Network event broadcast so nearby players (within `levelUpParticleRange = 20`) also see particles.
- Tutorial tips updated with new level.
- Dirty-flag save system with delayed flush.

---

## 17. Daily Rewards

**Source:** `DailyRewardDatabase` (9bf5dd51636a7244b8c3be9daf1c0db1)

### 17.1 Daily Rewards (Days 1–6, repeating weekly)

| Day | Type         | Reward           | Quantity / Amount |
| --- | ------------ | ---------------- | ----------------- |
| 1   | Currency (0) | 250 coins        | 250               |
| 2   | Item (1)     | 2× Luck Potions  | qty 2, itemId=16  |
| 3   | Currency (0) | 500 coins        | 500               |
| 4   | Item (1)     | 2× Relics        | qty 2, itemId=3   |
| 5   | Currency (0) | 5,000 coins      | 5,000             |
| 6   | Item (1)     | 2× Speed Potions | qty 2, itemId=15  |

### 17.2 Day 7 (Weekly Bonus) Rewards

Rotating weekly unique rewards:

| Week | Reward Name        | Type          |
| ---- | ------------------ | ------------- |
| 1    | Bucket Capybara    | Pet (type=7)  |
| 2    | Crusader Speedboat | Boat (type=6) |
| 3    | New Skin           | Skin (type=6) |
| 4    | New Skin           | Skin (type=7) |
| 5    | New Skin           | Skin (type=6) |
| 6    | New Skin           | Skin (type=7) |

### 17.3 Fallback (after all unique Day 7 rewards)

| Parameter                | Value             |
| ------------------------ | ----------------- |
| `fallbackRewardName`     | "15 Bonus Scrap!" |
| `fallbackRewardType`     | 1 (Item)          |
| `fallbackItemId`         | 13                |
| `fallbackQuantity`       | 15                |
| `fallbackCurrencyAmount` | 750               |

---

## 18. Economy & Fish Valuation

**Source:** Fish entry `CalculateFishValue` function

### 18.1 Fish Price Formula

```text
weightT = InverseLerp(weight, maxWeight, minWeight)   // 0 at min, 1 at max
basePrice = Lerp(weightT, maxPrice, minPrice)          // interpolate price range
finalValue = basePrice × sizeMultiplier × shaderMultiplier
```

### 18.2 Value Multiplier Stacking

1. **Base price** from weight interpolation within [minPrice, maxPrice]
2. **× Size modifier** (Huge = 1.5×, None = 1.0×)
3. **× Shader modifier** (varies: 1.1× to 5.0×)
4. **× Time/weather preference** (2× if fish's preferred time/weather matches)
5. **Pocket Change enchantment** adds bonus % on sell
6. **Double Up enchantment** gives chance to double the value

### 18.3 Theoretical Maximum Value Multipliers

- Holographic or Static shader: 5.0×
- Huge size: 1.5×
- Time/weather preference: 2.0×
- Combined: up to **15×** base price before enchantment bonuses

---

## Appendix A: System Architecture Overview

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

## Appendix B: Key Constants Summary

| System          | Constant                 | Value    | Used For                   |
| --------------- | ------------------------ | -------- | -------------------------- |
| FishDatabase    | zoneSpecificChance       | 80       | Zone fish priority %       |
| FishingMinigame | gravity                  | 1.25     | Bar physics                |
| FishingMinigame | playerSpeed              | 3.75     | Player bar movement        |
| DayNightCycle   | cycleDuration            | 1200 s   | Full day cycle             |
| Weather         | weatherChangeInterval    | 120 s    | Weather roll frequency     |
| Weather         | moonrainChance           | 0.15     | Night moonrain probability |
| SeaEvent        | maxActiveEvents          | 2        | Concurrent events          |
| SeaEvent        | eventLifetime            | 600 s    | Event duration             |
| BuffManager     | luckPotionMultiplier     | 2.0×     | Personal luck potion       |
| BuffManager     | attractionBuffMultiplier | 2.0×     | Attraction buff            |
| BuffManager     | weatherLuckMultiplier    | 2.0×     | Weather luck               |
| BuffManager     | worldLuckTier3Multiplier | 8.0×     | Max shared luck            |
| Modifiers       | sizeModifierChance       | 10%      | Chance per catch           |
| Modifiers       | shaderModifierChance     | 7.5%     | Chance per catch           |
| Modifiers       | doubleModifierChance     | 5%       | Both mods at once          |
| Pet             | baseCatchInterval        | 600 s    | Base AFK catch time        |
| Pet             | maxCapacity              | 5 (base) | Base fish storage          |
| PlayerStats     | maxLevel                 | 1000     | Level cap                  |
