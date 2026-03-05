# IL代码-文档逐行对应索引（03-04 全量）

> 覆盖口径：172 程序目录、9405 文件、3,566,251 行。

## 1. 逐行解释规则

1. `variablesjs_*` 行 → `docs/gamedata-zh.md` 对应业务章节的数据表。
2. `opcode/altopcode/exactexec` 行 → 流程/公式/算法章节。
3. `program64/variables64_*` 行 → 二进制与序列化层说明（§15.2）。
4. `$id/$type/$rlength/$rcontent` 行 → UdonVariableTable 语法层说明（附录B）。

## 2. 类名索引（真实类名 → 程序哈希）

| 真实类名 (\_\_refl\_typename) | 程序哈希前缀 | 总行数 | 对应文档章节 |
|---|---|---:|---|
| EquipmentStatsManager | `1fbef` | 68,781 | §4 装备系统 / §3 钓鱼机制 |
| RodEntry | `0a7fe` | 8,142 | §4.2 鱼竿（17条variablesjs） |
| LineEntry | `78d79` | 9,463 | §4.3 鱼线（9条variablesjs） |
| BobberEntry | `64ca1` | 6,992 | §4.4 浮标（14条variablesjs） |
| EnchantmentEntry | `2d630` | 18,575 | §5 附魔系统（42条variablesjs） |
| FishEntry | `e5ac9` | 88,746 | §2 鱼类系统（134条variablesjs） |
| FishModifierManager | `281c3` | 11,787 | §2.4 鱼类变异修饰器 |
| RodController | `6b9c3` | 113,541 | §3 钓鱼机制 / §3.1 咬钩 / §3.8 鱼竿参数 |
| FishingMinigameScript | `2af15` | 49,743 | §3.3 小游戏难度插值 |
| FishCatchDisplay | `2b1a3` | 34,269 | §3 钓鱼机制（UI层） |
| HookCollision | `76d3a` | 23,267 | §3 钓鱼机制（鱼钩物理碰撞） |
| FishSpawner | `71185` | 70,228 | §2.1-2.2 稀有度选择 / 区域生成 |
| FishPool | `f9650` | 459 | §2 鱼类系统（对象池） |
| BoatController | `292a2` | 101,409 | §8 船只系统 |
| BoatEntry | `5e300` | 14,232 | §8.1 船只数据（7条variablesjs） |
| BoatSkinEntry | `e7ac2` | 7,765 | §8.3 船只皮肤（33条variablesjs） |
| BoatSkinShopUI | `c7d41` | 41,303 | §8.3 船只皮肤（商店UI） |
| BuffManager | `fbccb` | 24,921 | §6 增益系统 |
| SeaEventSpawner | `25348` | 21,450 | §7 海域事件（10条variablesjs） |
| BiomeWeatherManager | `ab452` | 62,693 | §1.2 天气与生态区 |
| WeatherEntry | `23d38` | 15,550 | §1.2 天气数据（13条variablesjs） |
| ZoneEntry | `59971` | 6,923 | §1.3 钓鱼区域（11条variablesjs） |
| DayNightCycle | (内嵌) | — | §1.1 昼夜循环 |
| AFKPetStats | `0dbc5` | 10,380 | §9.2-9.3 宠物升级系统 |
| AFKPet | `6753c` | 56,333 | §9.4 AFK宠物行为 |
| PetEntry | `e9bbc` | 1,862 | §9.1 宠物列表（6条variablesjs） |
| AFKPetUIManager | `35818` | 33,932 | §9 宠物系统（UI层） |
| PlayerStats | `2baf2` | 34,555 | §10 玩家成长系统 |
| AchievementManager | `e8b34` | 51,129 | §10.5 称号与成就 |
| AchievementEntry | `882c4` | 7,649 | §10.5 成就数据（34条variablesjs） |
| TitleSystem | `e82fe` | 22,722 | §10.5 称号系统 |
| PlayerTitleDisplayManager | `942de` | 36,931 | §10.5 称号显示（VR追踪） |
| LevelLeaderboard | `9234a` | 20,314 | §15.3 排行榜系统 |
| XPPopupManager | `12920` | 27,026 | §10 经验获取（UI弹窗） |
| ShopManager | `762cb` | 79,649 | §11 经济系统（售鱼队列） |
| VladShopUI | `75426` | 44,518 | §13.5 Vlad 流浪商人（商店UI） |
| StoreListingManager | `baa0d` | 2,552 | §11 经济系统（商店列表） |
| StoreEntry | `32f0b` | 41,202 | §11 商店商品（23条variablesjs） |
| BountyManager | `60b1a` | 22,714 | §11.5 悬赏任务系统 |
| DailyRewardDatabase | `9bf5d` | 9,371 | §11.4 每日奖励 |
| InventoryManager | `73895` | 81,508 | §12 物品系统（鱼类库存管理） |
| QuestInventoryManager | `71369` | 37,522 | §12.1 任务物品栏 |
| QuestItemEntry | `4496e` | 8,169 | §12.1 物品数据（19条variablesjs） |
| PlayerInventoryData | `04a6d` | 67,580 | §15.2 数据持久化 |
| PlayerGlobalData | `d1b37` | 4,012 | §15.2 全局玩家数据 |
| FishIndexManager | `aa447` | 73,253 | §2 鱼类图鉴系统 |
| DialogueManager | `37490` | 51,902 | §13 NPC对话系统 |
| DialogueEventController | `5ec35` | 61,725 | §13.2 NPC任务链（17条variablesjs） |
| RedeemCodeManager | `13af6` | 19,132 | §12.2 兑换码系统 |
| RedeemCodeDatabase | `7b692` | 11,886 | §12.2 兑换码数据库 |
| DiscordRewardGranter | `f6f51` | 14,406 | §15.4 Discord角色权限 |
| CryptoAES256GPU | `c012e` | 59,373 | §15.4 AES-256加密（GPU Shader解密） |
| DynamicMusicSystem | `a2784` | 62,074 | §14 动态音乐系统 |
| MusicTrackEntry | `5738a` | 15,799 | §14 音乐曲目（24条variablesjs） |
| AmbientAudioManager | `566f3` | 21,855 | §14 环境音频管理 |
| RodCustomizationManager | `a3c85` | 45,789 | §4 装备系统（装备自定义UI） |
| EnchantmentAltarUI | `9fba0` | 39,216 | §5 附魔系统（祭坛UI） |
| HomePointManager | `d3634` | 5,864 | §13.8 旅馆与出生点系统 |
| GenericObjectInstance | `02cca` | 231,117 | 通用对象实例（3198个variablesjs） |
| ShrineOfTheAncients | `73c85` | 7,962 | §13.4 古代神殿（三色宝石合成） |
| SpookySighting | `44fa2` | 5,806 | §13.6 幽灵目击系统 |
| Vlad | `f48b1` | 4,828 | §13.5 Vlad 流浪商人 |
| KillZone | `77800` | 10,104 | §13.4 即死区域（KillZone + Shrine Kill Zone） |
| HealthSystem | `16d22` | 8,714 | §13.7 HP 生命系统 |
| ScrapSlotMachineManager | `a68c9` | 22,504 | §11.6 废铁老虎机 |
| TipDatabase | `34fcb` | 2,180 | §13.11 NPC 提示数据库（35条提示） |
| HearthStone | `17d35` | 5,274 | §13.9 回城石（传送至出生点） |
| RetroactiveQuestChecker | `b27ff` | 1,482 | §13.12 追溯任务检查器 |
| HomePointManager | `d3634` | 5,864 | §13.8 旅馆与出生点系统 |
| SupporterTrailManager | `ca1f9` | 21,310 | §15.5 Supporter 粒子拖尾系统 |
| UdonProductRewardManager | `6069f` | 8,780 | §15.6 VRC Economy 商品奖励系统 |
| MapUI | `d6b32` | 17,813 | §12.4 地图导航系统（7条variablesjs） |
| SpecialWaterZone | `444b2` | 3,184 | §12.5 特殊水域（5条variablesjs） |
| GroundItem | `31273` | 36,715 | §12.3 地面遗物拾取点（8条variablesjs） |
| SpecialEquipmentReward | `1eaf2` | 2,515 | §13.10 特殊装备获取（3条variablesjs） |
| ShopDistribution | `efdec` | 3,830 | §11.8 商店分布（7条variablesjs） |
| EnchantmentDatabase | `5cb0b` | 15,647 | §5.1 附魔稀有度权重（42种附魔+遗物概率表） |
| ScrapMetalManager | `d01ec` | 15,406 | §11.6 废铁生成系统（46个生成点） |
| AnnouncementManager | `94b69` | 8,788 | §13.19 全服公告系统 |
| DailyRewardManager | `c9882` | 22,913 | §11.4 每日奖励管理器 |
| SwimZone | `72e01` | 22,105 | §13.13 游泳与体力系统 |
| DayNightCycle | `2aa0a` | 17,328 | §1.1 昼夜循环 |
| TutorialTips | `bb589` | 19,758 | §13.17 教程提示系统 |
| RodTeleportSystem | `8fac6` | 31,392 | §13.18 钓竿召唤/传送系统 |
| DialogueData | `faedc` | 62,744 | §13.15 NPC对话数据（93个实例） |
| NPCController | `7c242` | 65,034 | §13.14 NPC控制器（43个实例） |
| NPCEntity | `d4f55` | 93,730 | §13.16 NPC实体网络同步（42个实例） |
| BoatShopUIScript | `b556f` | 83,479 | §8.4 船只商店系统（4个实例） |
| ItemForSaleShopUiManager | `888b3` | 19,751 | §11.8 商品商店UI管理 |
| VersionChecker | `8bdb0` | 11,443 | §15.8 版本检查系统（v1.0.4） |
| SimpleBoatSyncManager | `1e9b1` | 14,437 | §8.5 船只网络同步（40人/5Hz） |
| TutorialRoom | `f624d` | 22,924 | §13.17 教程房间（5步骤引导） |
| WristHUD | `c6402` | 19,022 | §15.7 VR手腕HUD |
| PetScriptsPlacer | `89e20` | 17,846 | §9.5 宠物放置系统 |
| BoatPlacerSpawnAnywhere | `0d4fe` | 25,392 | §8.6 船只随处放置 |
| RodDatabase | `1bc13` | 16,290 | §4.2 鱼竿数据库（17条entries） |
| LineDatabase | `7835f` | 14,640 | §4.3 鱼线数据库（9条entries） |
| BobberDatabase | `39150` | 14,646 | §4.4 浮标数据库（14条entries） |
| PetDatabase | `cf611` | 15,317 | §9.1 宠物数据库（5条entries） |
| BoatDatabase | `e99d5` | 26,888 | §8.1 船只数据库（7条entries） |
| BoatSkinDatabase | `d4640` | 24,969 | §8.3 船只皮肤数据库（33条entries） |
| AchievementDatabase | `5ba4f` | 8,690 | §10.5 成就数据库（34条entries） |
| QuestItemDatabase | `373fa` | 7,142 | §12.1 任务物品数据库 |
| DiscordRoleManager | `eebb6` | 21,196 | §15.4 Discord角色管理器（GPU解密） |
| SeaEventSpawner(b9860) | `b9860` | 17,986 | §7 海域事件生成器（备用哈希） |
| SeaEventPool | `ba888` | 6,432 | §7 海域事件对象池（10种事件） |
| EnchantmentAnimationController | `7cc31` | 16,118 | §5 附魔动画控制器 |
| InventorySlot | `6aab5` | 8,752 | §12 物品系统/库存槽位（45个实例） |
| SyncZone | `d95a3` | 7,518 | §15.10 室内音频区域（8个实例） |
| AudioSettingsManager | `d2ecf` | 10,833 | §15.9 音频设置管理 |
| PhoneUIManager | `21d8c` | 1,712 | §15.7 手机/桌面HUD替代 |
| SpawnRoomManager | `14c0b` | 2,802 | §15.11 出生房间管理 |
| FishPool | `f9650` | 459 | §2 鱼类对象池（123个VRCObjectPool） |
| ScrapMetalPickup | `18152` | 15,265 | §11.6 废铁拾取实例（46个） |
| DoorTeleporter | `4e92d` | 14,447 | §13.8 旅馆/门传送器（12个实例） |
| FishingZones | `7e3b8` | 11,859 | §1.2 钓鱼区域管理（5个区域） |

## 3. 全目录映射表

| 程序哈希 | 前缀 | 文件数 | 总行数 | 文件类型计数 | 对应章节 |
|---|---|---:|---:|---|---|
| `01e18edc0b44b9c4c96630f93cea8edd` | `01e18` | 6 | 3,184 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `02cca07f5dc77954d821580013d73c0d` | `02cca` | 6400 | 231,117 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:3198, variablesjs_*:3198 | 通用对象实例/GenericObjectInstance（鱼、物品、遗物等3198个实例） |
| `04a6d8d34626bbc458ed51a11aab29bd` | `04a6d` | 6 | 67,580 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 数据持久化/库存存档 |
| `06657749e5afb8447a7105e8051016cb` | `06657` | 18 | 8,765 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:7, variablesjs_*:7 | 附录A/通用IL结构与对象实例层 |
| `07f517c50e2e1224085f85ee498400e5` | `07f51` | 6 | 5,062 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `0a16b429f07dac74f99dee454d67f76b` | `0a16b` | 14 | 3,202 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:5, variablesjs_*:5 | 附录A/通用IL结构与对象实例层 |
| `0a6178b2fcfbfe44c98e185edb6a6d88` | `0a617` | 18 | 1,622 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:7, variablesjs_*:7 | 附录A/通用IL结构与对象实例层 |
| `0a7fe06dcadd5694087b8c7d5bdbf8fd` | `0a7fe` | 38 | 8,142 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:17, variablesjs_*:17 | 2.装备系统/鱼竿 |
| `0d4feed0e7802bf4e8ecb0bae25bd1a1` | `0d4fe` | 6 | 25,392 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §8.6 船只随处放置/BoatPlacerSpawnAnywhere |
| `0d9a00f4563e0b143a2de389ec95ad2d` | `0d9a0` | 6 | 6,927 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `0dbc564466389c046bb966d32a787fa0` | `0dbc5` | 6 | 10,380 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 5.成长系统/宠物成长 |
| `0fb67b0ea909a7f4d99a4b506419073f` | `0fb67` | 6 | 4,579 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `12920d16eb8c98c4d94c687d142fd81d` | `12920` | 6 | 27,026 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §10 玩家成长/XPPopupManager（经验弹窗UI） |
| `13af618deedb95a4da0e0ef8a63084c2` | `13af6` | 6 | 19,132 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 6.经济任务/兑换码管理 |
| `14c0bcfdb74df9341806f7f0689341c8` | `14c0b` | 6 | 2,802 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §15.11 出生房间管理/SpawnRoomManager |
| `16d22c28b2167ba4686a2e6e8ce6a027` | `16d22` | 6 | 8,714 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §13.7 HP 生命系统/HealthSystem |
| `17d359903b1595444b6052b7ceba45f2` | `17d35` | 6 | 5,274 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §13.9 回城石/HearthStone |
| `181524b42cfc0184fa47a09ecaefd6d4` | `18152` | 96 | 15,265 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:46, variablesjs_*:46 | §11.6 废铁拾取实例/ScrapMetalPickup（46个生成点） |
| `1bc13e1037b81454dabdb951df3b73bc` | `1bc13` | 6 | 16,290 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §4.2 鱼竿数据库/RodDatabase（17条entries） |
| `1e9b1d95d66238f47b4428228841a5d4` | `1e9b1` | 6 | 14,437 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §8.5 船只网络同步/SimpleBoatSyncManager（40人/5Hz） |
| `1eaf2ee06d77dc24683dfa8f761d32ec` | `1eaf2` | 10 | 2,515 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:3, variablesjs_*:3 | §13.10 特殊装备获取/SpecialEquipmentReward（3条variablesjs） |
| `1fbef1203df5cba45bfbe981cd9ec5c8` | `1fbef` | 6 | 68,781 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 1.钓鱼核心/装备统计汇总 |
| `2075c6e6bdb11364a8e07ff81042ae36` | `2075c` | 6 | 4,678 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `21d8c67b8a5681e40a671e506012ce3e` | `21d8c` | 6 | 1,712 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `23d38b53ae9ef6748b433c7129a11942` | `23d38` | 30 | 15,550 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:13, variablesjs_*:13 | 4.世界系统/天气 |
| `24c35ec278d292a499f552ce40734bcf` | `24c35` | 6 | 5,995 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `25348dbaa17d1894f978aed49d59e50a` | `25348` | 24 | 21,450 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:10, variablesjs_*:10 | 4.世界系统/海域事件 |
| `2769be55dd631414699396ea9b0be84d` | `2769b` | 6 | 7,993 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `281c3f3520b06e64686282e5951ab067` | `281c3` | 6 | 11,787 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 1.钓鱼核心/鱼类修饰器 |
| `2827c957a7c458e4a939f9ce9eb9dac9` | `2827c` | 6 | 13,027 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `292a201d1694e6a42a7e9079da128725` | `292a2` | 6 | 101,409 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §8 船只系统/BoatController（船只移动、加速、搁浅检测） |
| `2aa0a7746b48abe47bdbb4aef4d69c71` | `2aa0a` | 6 | 17,328 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `2af157c6afd4f2e479afe773efb9f6ea` | `2af15` | 6 | 49,743 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §3 钓鱼机制/FishingMinigameScript（钓鱼小游戏） |
| `2b1a3d15d0a65a841a8563e3eb1de439` | `2b1a3` | 6 | 34,269 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §3 钓鱼机制/FishCatchDisplay（捕获UI） |
| `2ba5828be93bd8c4287029002e6f3a4a` | `2ba58` | 6 | 2,299 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `2baf2f5f5621a8b408595ec5dd222068` | `2baf2` | 6 | 34,555 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 5.成长系统/玩家等级经验 |
| `2d630e67ab832f64fb2d882bd46fb7ed` | `2d630` | 88 | 18,575 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:42, variablesjs_*:42 | 2.装备系统/附魔 |
| `3127336264172c744a7c918b738820d0` | `31273` | 20 | 36,715 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:8, variablesjs_*:8 | §12.3 地面遗物拾取点/GroundItem（8条variablesjs） |
| `324706932a8965e44b4dce80c3bf5701` | `32470` | 6 | 12,258 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `32f0bd90c3148784cbe1853ab34bc4ca` | `32f0b` | 50 | 41,202 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:23, variablesjs_*:23 | 6.经济任务/商店 |
| `34adcac9b3282a64a8198df0239a046e` | `34adc` | 6 | 4,294 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `34fcb25cef72ad04eadec79eff3c19b4` | `34fcb` | 6 | 2,180 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §13.11 NPC提示数据库/TipDatabase（35条提示） |
| `35818374b929a53439921ef9bd8cf995` | `35818` | 6 | 33,932 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §9 宠物系统/AFKPetUIManager（UI层） |
| `373fab2b733a19f4b8f1f3b3733c2469` | `373fa` | 6 | 7,142 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `37490f628a981d949a24dbf650350d7a` | `37490` | 6 | 51,902 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §13.3 对话系统/DialogueManager |
| `38f973ceaa665874d961931bae65a45b` | `38f97` | 52 | 7,842 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:24, variablesjs_*:24 | 附录A/通用IL结构与对象实例层 |
| `39150ce9971a4694c90645d427fd0f95` | `39150` | 6 | 14,646 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `444b280bce484ba4a97e15eb81cd0d72` | `444b2` | 14 | 3,184 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:5, variablesjs_*:5 | §12.5 特殊水域/SpecialWaterZone（5条variablesjs） |
| `4496e61374e595c4d95e6b867ffc6e73` | `4496e` | 42 | 8,169 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:19, variablesjs_*:19 | 6.经济任务/任务物品 |
| `44fa2e126d8c08442900b847971ed811` | `44fa2` | 6 | 5,806 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `4715e20276be3b141a6a216230cab4e9` | `4715e` | 62 | 1,243 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:29, variablesjs_*:29 | 附录A/通用IL结构与对象实例层 |
| `4c81f262162a6644abe7e7c21d5bc63e` | `4c81f` | 6 | 1,561 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `4e92de85f647c32469df29130673d3b2` | `4e92d` | 28 | 14,447 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:12, variablesjs_*:12 | 附录A/通用IL结构与对象实例层 |
| `55b380cd07abb4847ab4b51f5077b535` | `55b38` | 12 | 7,603 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:4, variablesjs_*:4 | 附录A/通用IL结构与对象实例层 |
| `566cc00e27d5822449529a3785eae366` | `566cc` | 6 | 2,129 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `566f3d96871d74a4a84c7d7e56768940` | `566f3` | 6 | 21,855 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §14 环境音频/AmbientAudioManager |
| `5738a7400c4372c49b7cfbd34117fc3a` | `5738a` | 52 | 15,799 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:24, variablesjs_*:24 | 4.世界系统/音乐 |
| `573f41f388b79f84cafe787c8c6b6124` | `573f4` | 6 | 11,236 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `599716a952d78b14da20da6cbf849085` | `59971` | 26 | 6,923 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:11, variablesjs_*:11 | 4.世界系统/区域 |
| `5ba4fad232f1b92489dfc53584e934b0` | `5ba4f` | 6 | 8,690 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `5cb0b2eac08c7414a8d97e7c6228ce28` | `5cb0b` | 6 | 15,647 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §5.1 附魔数据库/EnchantmentDatabase（42种附魔+遗物概率表） |
| `5e300410777b5d445aaaf83b9351c85b` | `5e300` | 18 | 14,232 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:7, variablesjs_*:7 | 4.世界系统/船只 |
| `5ec35a52a1bfc9d48b0b281b6cbf0834` | `5ec35` | 38 | 61,725 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:17, variablesjs_*:17 | 6.经济任务/对话任务事件 |
| `6069f297810cb5a45b7c6f2978209f8e` | `6069f` | 6 | 8,780 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `60b1af22c15bc7c4fa7fe377bb9efc37` | `60b1a` | 6 | 22,714 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 6.经济任务/悬赏系统 |
| `64ca1d317b8842b4aa7f64c0f8ef509a` | `64ca1` | 32 | 6,992 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:14, variablesjs_*:14 | 2.装备系统/浮漂 |
| `6753cb5c6a8a6564389806b17fb20644` | `6753c` | 6 | 56,333 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §9.4 AFK宠物行为/AFKPet |
| `6aab50e4bf916ae42aae0beea3d3d886` | `6aab5` | 94 | 8,752 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:45, variablesjs_*:45 | 附录A/通用IL结构与对象实例层 |
| `6b9c3a0e90161e1479672dfae1e5776b` | `6b9c3` | 6 | 113,541 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 1.钓鱼核心/鱼竿交互与咬钩 |
| `6c29b2cb9c8526d49834175b144a8a68` | `6c29b` | 168 | 9,386 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:82, variablesjs_*:82 | 附录A/通用IL结构与对象实例层 |
| `6e7c8b97afd92fb4680d0195f5d5c896` | `6e7c8` | 6 | 1,136 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `711854d789cde03439ab365052973864` | `71185` | 6 | 70,228 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 1.钓鱼核心/鱼类生成 |
| `71369b35ceffd794a8b4ab90b39a505f` | `71369` | 6 | 37,522 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §12.1 任务物品栏/QuestInventoryManager |
| `7206822777b829446bd8e8ea72d4ad04` | `72068` | 6 | 10,173 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `721d69cc562dd9d4fa31aadc77a61e96` | `721d6` | 46 | 12,501 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:21, variablesjs_*:21 | 附录A/通用IL结构与对象实例层 |
| `72e01b0b5a6680a4f8aa88f1d3530de0` | `72e01` | 6 | 22,105 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `733a8aee489750843828d4f3b56adda0` | `733a8` | 6 | 7,653 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `738950df3bae5cc4680b9dab9754f51c` | `73895` | 6 | 81,508 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §12 物品系统/InventoryManager（鱼类库存管理） |
| `73c855c78ec46e34fa4070f9d24a060e` | `73c85` | 6 | 7,962 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `74206fd6d1eab674eb256295635a9398` | `74206` | 6 | 1,241 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `748cb831ed300d9458b6632435117e90` | `748cb` | 8 | 804 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:2, variablesjs_*:2 | 附录A/通用IL结构与对象实例层 |
| `754068384b0815040a62b4b4a9e16fab` | `75406` | 6 | 2,268 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `75426f4f625da204d9babed7426a52bc` | `75426` | 6 | 44,518 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §11 经济系统/VladShopUI（Vlad商店UI） |
| `760e9d7b6cc8a6343bcb9c72960b7569` | `760e9` | 6 | 7,849 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `762cb8a22c5ef7845b07855df737990d` | `762cb` | 6 | 79,649 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §11 经济系统/ShopManager（售鱼队列） |
| `76d3abb31e39f4c498468e8032753396` | `76d3a` | 6 | 23,267 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §3 钓鱼机制/HookCollision（鱼钩物理碰撞） |
| `778003349bca69546a54fd325001b0ae` | `77800` | 8 | 10,104 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:2, variablesjs_*:2 | 附录A/通用IL结构与对象实例层 |
| `7835f8cda385fae4f96ddf307ced735f` | `7835f` | 6 | 14,640 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §4.3 鱼线数据库/LineDatabase（9条entries） |
| `78d79eb2888f3a2409296f3b255eff15` | `78d79` | 22 | 9,463 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:9, variablesjs_*:9 | 2.装备系统/鱼线 |
| `7b69275e127dd6b41b9cf958c193aafa` | `7b692` | 6 | 11,886 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 6.经济任务/兑换码数据库 |
| `7c242dbbd8e68c046a512e7bf469e0ed` | `7c242` | 90 | 65,034 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:43, variablesjs_*:43 | 附录A/通用IL结构与对象实例层 |
| `7cc314c72bce17541983d2cde0da2bd2` | `7cc31` | 6 | 16,118 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `7e3b842db9f26424b9a919d1f3296c1b` | `7e3b8` | 6 | 11,859 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `882c4fa96b981e045bb088b77cd2feeb` | `882c4` | 72 | 7,649 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:34, variablesjs_*:34 | 5.成长系统/成就称号 |
| `888b3596f58c488458a009bf6618047d` | `888b3` | 6 | 19,751 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `89e20c55daa2e3042ab00e35245eee33` | `89e20` | 6 | 17,846 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `8bdb06c057724c94cb1be349e8e542d7` | `8bdb0` | 6 | 11,443 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `8ebaca6fdc63b86439ac3f0e7a614810` | `8ebac` | 6 | 8,208 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `8fac6f6b7de290a4b8d7f779d7dac68b` | `8fac6` | 6 | 31,392 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `9234a9296fd82124eabd48ae2d93013a` | `9234a` | 6 | 20,314 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `92af0a4d5382a9d4890086a15ef5ca9b` | `92af0` | 78 | 2,225 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:37, variablesjs_*:37 | 附录A/通用IL结构与对象实例层 |
| `942de4b7b0f80c64a98809018076b13d` | `942de` | 6 | 36,931 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §10.5 称号显示/PlayerTitleDisplayManager（VR追踪） |
| `94b693118d772454286eee6f38dff383` | `94b69` | 6 | 8,788 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `962286006a8a8ca44b78083e9cb22547` | `96228` | 10 | 6,950 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:3, variablesjs_*:3 | 附录A/通用IL结构与对象实例层 |
| `98ae45b172755e64aa3109f69ce0fd68` | `98ae4` | 20 | 1,665 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:8, variablesjs_*:8 | 附录A/通用IL结构与对象实例层 |
| `990da59c959b83844a91f80fc3d3d40a` | `990da` | 6 | 6,022 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `99f32ab042bd6ea41909a981a83f24d8` | `99f32` | 24 | 4,975 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:10, variablesjs_*:10 | 附录A/通用IL结构与对象实例层 |
| `9a712c7427ac33746b67ffd132f4b948` | `9a712` | 6 | 2,989 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `9bf5dd51636a7244b8c3be9daf1c0db1` | `9bf5d` | 6 | 9,371 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §11.4 每日奖励/DailyRewardDatabase |
| `9fba0437f27baac43a8095684403eb8c` | `9fba0` | 6 | 39,216 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §5.5 附魔祭坛/EnchantmentAltarUI |
| `9fdb6845485710e4bb08232e37046ea9` | `9fdb6` | 6 | 22,936 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §5 附魔系统/EnchantmentManager（附魔应用/条件判定） |
| `a081dea205277ce4cbcb32ad20b94168` | `a081d` | 84 | 5,561 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:40, variablesjs_*:40 | 附录A/通用IL结构与对象实例层 |
| `a27842af391723f4daef7b628b9d0641` | `a2784` | 6 | 62,074 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §14 动态音乐系统/DynamicMusicSystem |
| `a3c8504990e71eb4094661a576ca864b` | `a3c85` | 6 | 45,789 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §4 装备自定义/RodCustomizationManager |
| `a68c99fc1e47b954e8553ceaf6a85f1f` | `a68c9` | 5 | 22,504 | exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `aa4475830f5fe0b4888217296f80b5c2` | `aa447` | 6 | 73,253 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §2 鱼类图鉴系统/FishIndexManager |
| `ab4526b1e2c72f04482e668077491462` | `ab452` | 6 | 62,693 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §1.2 天气与生态区/BiomeWeatherManager |
| `ac199d57cd2c75544b3e67369a8b02fd` | `ac199` | 6 | 2,215 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `afa11044678a5d34b9b4c7244e8720b8` | `afa11` | 6 | 5,199 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `b0f8d1b6c96aedb439cd3e1092ac9af3` | `b0f8d` | 6 | 5,019 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `b27ff89866748c642b7a6bfbff1aadbd` | `b27ff` | 6 | 1,482 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `b34f66521e63ebc47aca45e283bff264` | `b34f6` | 6 | 13,383 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `b549b15eee26f134cb95257aa2b90870` | `b549b` | 6 | 2,879 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `b556f4a490ea8844aa4526f55a0e476d` | `b556f` | 12 | 83,479 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:4, variablesjs_*:4 | 附录A/通用IL结构与对象实例层 |
| `b8b2de40bb299de4ebe137e1e01c629c` | `b8b2d` | 8 | 680 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:2, variablesjs_*:2 | 附录A/通用IL结构与对象实例层 |
| `b98606ba772ff3e41a8bd95942bd100c` | `b9860` | 6 | 17,986 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `ba888424039c7ab46b7cc17881cb52c6` | `ba888` | 6 | 6,432 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `baa0d5279d685b2469548d87386f0e05` | `baa0d` | 6 | 2,552 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §11 经济系统/StoreListingManager（商店列表） |
| `bb589c54f176b0846910ce21ee20dd20` | `bb589` | 6 | 19,758 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `c012e9a27db8fea4dbc6cbbe374240c3` | `c012e` | 6 | 59,373 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §15.4 AES-256加密/CryptoAES256GPU（GPU Shader解密） |
| `c3520f365d74d3a4297f4404e9b245cb` | `c3520` | 6 | 8,471 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `c6402705877513441ac2b53c5bcf6464` | `c6402` | 6 | 19,022 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `c680b802912b0554d899b131dd2adde9` | `c680b` | 8 | 1,070 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:2, variablesjs_*:2 | 附录A/通用IL结构与对象实例层 |
| `c7d4163fa25b9864fa4b69312dc95717` | `c7d41` | 6 | 41,303 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §8.3 船只皮肤/BoatSkinShopUI |
| `c8df303ceb45ae84f85a11591f741734` | `c8df3` | 6 | 907 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `c98825ebab16e924b8a4d0aa87306e92` | `c9882` | 6 | 22,913 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `c9f808385b1aa004ea4e9986f03caea1` | `c9f80` | 8 | 1,197 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:2, variablesjs_*:2 | 附录A/通用IL结构与对象实例层 |
| `ca1f9d4d6d800544498faa00d17500a1` | `ca1f9` | 6 | 21,310 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `ca44fa6598f4ca64f8d51860710c816f` | `ca44f` | 6 | 5,607 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `ca739a227fafb3c4294f538b94ffc3ac` | `ca739` | 12 | 3,249 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:4, variablesjs_*:4 | 附录A/通用IL结构与对象实例层 |
| `cf61144a0e6d9be4eb617c71429e9368` | `cf611` | 6 | 15,317 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `d01ecb85ea561674e8118455afdf47ac` | `d01ec` | 6 | 15,406 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `d07d5f81788ca0446b7165bbeab62fd3` | `d07d5` | 8 | 737 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:2, variablesjs_*:2 | 附录A/通用IL结构与对象实例层 |
| `d0903edc6b327584fbe16123cdefaa89` | `d0903` | 6 | 1,530 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `d1b3751adf4cdd24f96c5b51f27d4310` | `d1b37` | 6 | 4,012 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §15.2 数据持久化/PlayerGlobalData |
| `d2ecf3fce3fd4894d97209f33a4a05e3` | `d2ecf` | 6 | 10,833 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `d36340b803375f4468cc737e6fef1ca3` | `d3634` | 6 | 5,864 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `d45fdf88c0eb79e40a8a4d7d54062641` | `d45fd` | 12 | 14,689 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:4, variablesjs_*:4 | 附录A/通用IL结构与对象实例层 |
| `d4640e61fbfb38e45965a2a47df46ce1` | `d4640` | 6 | 24,969 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `d4f550b6f99b7e44ca0b0a50b80ec27b` | `d4f55` | 88 | 93,730 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:42, variablesjs_*:42 | 附录A/通用IL结构与对象实例层 |
| `d54b5f3c5359aa3498e1088cb8b87ad7` | `d54b5` | 6 | 10,113 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `d6b327d131409de439a68579af48fa99` | `d6b32` | 18 | 17,813 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:7, variablesjs_*:7 | 附录A/通用IL结构与对象实例层 |
| `d95a3c550dc2d674ea733ee1dfa8152f` | `d95a3` | 20 | 7,518 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:8, variablesjs_*:8 | 附录A/通用IL结构与对象实例层 |
| `d9f46fa8ede02a745a2db691d0866d66` | `d9f46` | 6 | 241 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `dfed165c0ef1de749a9331c584643738` | `dfed1` | 6 | 9,771 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `e5ac982ae96f853408a0a3ab03154882` | `e5ac9` | 272 | 88,746 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:134, variablesjs_*:134 | 3.鱼类系统 |
| `e7ac21947a545c14fb38c53ccfc8551d` | `e7ac2` | 70 | 7,765 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:33, variablesjs_*:33 | 4.世界系统/船皮 |
| `e82fe34c8eff7fe48940b9e030c50db3` | `e82fe` | 6 | 22,722 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §10.5 称号系统/TitleSystem |
| `e8b34fab747e8e041bee3589ce53957e` | `e8b34` | 6 | 51,129 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §10.5 成就系统/AchievementManager |
| `e99d5d1f07dda5b4eb16401090152de7` | `e99d5` | 6 | 26,888 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `e9bbce773b006704d8b25a8bfefb61ff` | `e9bbc` | 16 | 1,862 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:6, variablesjs_*:6 | 5.成长系统/宠物 |
| `eb51daa240e28894fba7fbcf0e62e3e6` | `eb51d` | 6 | 5,476 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `eebb6f6c069f44a4399c68eb47834581` | `eebb6` | 6 | 21,196 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `efdecd6f4ae1186469c1324f00e3b492` | `efdec` | 18 | 3,830 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:7, variablesjs_*:7 | §11.7 商店分布/ShopDistribution（7条variablesjs） |
| `f08287592bd5b9348b76e9de7535ea4c` | `f0828` | 8 | 3,301 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:2, variablesjs_*:2 | 附录A/通用IL结构与对象实例层 |
| `f48b110d04f4c78479f128df8808b98d` | `f48b1` | 6 | 4,828 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §13.5 Vlad流浪商人（teleportInterval=900s, 8个传送点） |
| `f624d4fb546debb4eb2808f522b62af6` | `f624d` | 6 | 22,924 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `f6f51db8fccf79a418308b5875b1976f` | `f6f51` | 6 | 14,406 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `f965026cf5d48d14f8bd98cd0722cbb3` | `f9650` | 6 | 459 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | 附录A/通用IL结构与对象实例层 |
| `faedc7d501f8dd343a17130760605116` | `faedc` | 190 | 62,744 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:93, variablesjs_*:93 | 附录A/通用IL结构与对象实例层 |
| `fbccbc1d3dacb6044b4523ef1a879e36` | `fbccb` | 6 | 24,921 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:1, variablesjs_*:1 | §6 增益系统/BuffManager |
| `feab404524b44c041a222accfaaeadb8` | `feab4` | 18 | 9,574 | altopcode:1, exactexec:1, opcode:1, program64:1, variables64_*:7, variablesjs_*:7 | 附录A/通用IL结构与对象实例层 |

## 3. 关键回溯证据

- `rodId=14` 冲突：`variablesjs_3883` 与 `variablesjs_4047`。
- 55/55/15000：`0a7fe.../variablesjs_4047` 与 `32f0b.../variablesjs_3931`。
- 任务奖励链：`5ec35.../variablesjs_3514/3906/4301/3890/4196`。
