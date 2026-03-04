# Fish World Udon IL Code

> VRChat "Fish World" — Decompiled Udon IL Bytecode & Reverse Engineering Analysis
>
> 🐟 Complete decompiled IL bytecode from VRChat's multiplayer fishing simulation world "Fish World"

English | [简体中文](README.md)

---

## About

This repository contains the **decompiled IL bytecode of all 172 Udon programs** extracted from the VRChat world **Fish World** — a large-scale multiplayer fishing simulation game built with Udon/UdonSharp.

### Key Features Identified

| Category            | Features                                                                                |
| ------------------- | --------------------------------------------------------------------------------------- |
| **Fishing**         | Rod physics, casting, bite detection, timing minigame, fish spawner with ecology system |
| **RPG Progression** | Levels, XP, currency, achievements, titles, daily login rewards                         |
| **Equipment**       | Rods, lines, bobbers with stat multipliers + enchantment system                         |
| **Boats**           | Physics-based driving, drifting, boost, skins, network sync                             |
| **Pets**            | AFK auto-fishing pets with upgradeable stats                                            |
| **World**           | Dynamic weather, day/night cycle, zone-based music, sea events                          |
| **Economy**         | Fish shop, equipment shop, buff shop, bounties, redeem codes                            |
| **Social**          | NPC dialogue with branching, leaderboard, fish codex, tutorial                          |
| **Security**        | AES-256-CBC GPU-accelerated encryption for Discord role verification                    |

---

## Documentation

| Document                                             | Description                                           |
| ---------------------------------------------------- | ----------------------------------------------------- |
| [Analysis](docs/analysis-en.md)                      | Full analysis of all 172 scripts, module architecture |
| [AES-256 IL Analysis](docs/aes256-il-analysis-en.md) | AES-256 encryption IL-level trace                     |
| [Game Data](docs/gamedata-en.md)                     | Equipment, enchantment, fish, boat data handbook      |
| [Changelog](docs/changelog-en.md)                    | IL code change history                                |

---

## Tools

| Script       | Purpose                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `decrypt.js` | AES-256-CBC decryption — decrypts encrypted role data using IL-extracted KDF                    |
| `extract.js` | Game data extraction — extracts 17 data types (397 entries) from variablesjs files              |
| `index.html` | Web-based AES-256-CBC encrypt/decrypt tool [↗ Online](https://fish-udon-raw-ilcode.vercel.app/) |

### Quick Start

```bash
# Decrypt encrypted role data → decrypted/
node decrypt.js

# Extract all game data → extracted/
node extract.js
```

### Extracted Data Summary

| Data Type             |   Count | Source Hash |
| --------------------- | ------: | ----------- |
| Fish Species          |     134 | `e5ac9...`  |
| Enchantments          |      42 | `2d630...`  |
| Titles / Achievements |      34 | `882c4...`  |
| Boat Skins            |      33 | `e7ac2...`  |
| Music Tracks          |      24 | `5738a...`  |
| Shop Items            |      23 | `32f0b...`  |
| Inventory Items       |      19 | `4496e...`  |
| Rods                  |      17 | `0a7fe...`  |
| Bobbers               |      14 | `64ca1...`  |
| Weather States        |      13 | `23d38...`  |
| Fishing Zones         |      11 | `59971...`  |
| Sea Events            |      10 | `25348...`  |
| Lines                 |       9 | `78d79...`  |
| Boats                 |       7 | `5e300...`  |
| Pet Companions        |       6 | `e9bbc...`  |
| Pet Stats             |       1 | `0dbc5...`  |
| **Total**             | **397** |             |

---

## Encrypted Data Sources

| File                  | Source URL                                                | IL Variable Name       |
| --------------------- | --------------------------------------------------------- | ---------------------- |
| `encrypted/roles.txt` | `https://gamerexde.github.io/trickforge-public/roles.txt` | `trustedroleDataUrl`   |
| `encrypted/all.txt`   | `https://api.trickforgestudios.com/api/v1/roles/vrc/all`  | `untrustedroleDataUrl` |

Both contain AES-256-CBC encrypted player role data. The game preferentially uses the trusted URL, falling back to the API endpoint. Decrypted output: `decrypted/roles.json` (4,711 players), `decrypted/all.json` (4,714 players).

---

## Repository Structure

```text
Fish-Udon-Raw-Ilcode/
├── README.md / README.en.md     # Bilingual README
├── decrypt.js                   # AES-256-CBC decryption script
├── extract.js                   # Game data extraction script
├── index.html                   # Web encrypt/decrypt tool
├── encrypted/                   # Encrypted source data
│   ├── all.txt                  #   ← API endpoint data
│   └── roles.txt                #   ← GitHub Pages data
├── decrypted/                   # Decrypted JSON output
│   ├── all.json                 #   4,714 players
│   └── roles.json               #   4,711 players
├── extracted/                   # Extracted game data (17 types)
│   ├── fish.json                #   134 species
│   ├── rods.json                #   17 rods
│   ├── enchantments.json        #   42 enchantments
│   └── ...                      #   + 14 more data files
├── docs/                        # Analysis documents (EN/中文)
└── 03-04/                       # Mar 4 decompilation snapshot
    └── autogenerated/           #   172 decompiled programs
```
