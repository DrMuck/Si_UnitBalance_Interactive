# Si_UnitBalance Interactive - Changelog

## 2026-03-04 - Bomber/Freighter Pri/Sec Weapon Swap

- **Fixed**: Bomber pri=Shell_StealthBomber (cannon), sec=Bomb_DropBomb (bombs) — cannon is now primary
- **Fixed**: Freighter pri=Shell_Dreadnought (cannon), sec=Bomb_ContainerBomb (bomb) — cannon is now primary
- Matches `_vtPriIndex` fix in mother project

## 2026-03-04 - Independent Sol/Cent Headquarters

- **Split**: "Headquarters" into "Sol Headquarters" and "Cent Headquarters" for independent balancing
- Same pattern as Sol/Cent Harvester split

## 2026-03-04 - m_bPenetrating Fix & Multi-Turret Corrections

- **Fixed**: Removed penetrating damage params from 20 projectiles where `m_bPenetrating = False`
  - Only 7 projectiles actually have penetrating enabled (Shell_HoverTank, Shell_HeavyArmoredCar, etc.)
- **Fixed**: Multi-turret aircraft corrections from new dump data:
  - Bomber: pri=Shell_StealthBomber (cannon), was missing weapon data
  - Freighter: pri=Shell_Dreadnought (cannon), was missing weapon data
  - Gunship/Shuttle/Platoon Hauler: correct turret slot assignments via `turret_stats_prefix`
  - Fighter: pri=HMG_StealthFighter (gun), sec=Bomb_DiveBomb (bomb)
  - Interceptor: pri=Shell_Interceptor (gun), sec=Bomb_DropTank (bomb)
- Config: 1242 to 1280 params (penetrating removed, but new aircraft weapon keys added)

## 2026-03-04 - Vehicle Projectile Audit & Fake Secondary Removal

- **Fixed**: Corrected all 31 vehicle_projectiles mappings to match actual dump data (`vt_proj`/`vt2_proj` fields)
- **Removed**: 13 fake secondary weapons from units with no `vt2_proj` in dump:
  AA Truck, Bomber, Crimson Tank, Dropship, Fighter, Flak Car, Freighter, Interceptor, Light Striker, Platoon Hauler, Siege Tank, Squad Transport, Strike Tank
- **Fixed**: Wrong projectile assignments for Assault Car, Light/Heavy Quad, Light/Heavy Raider, Dreadnought, Gunship, Fighter, Freighter, Shuttle, Interceptor
- Config reduced from 1378 to 1242 params (136 removed)

## 2026-03-04 - m_bSplash Boolean Fix & Default Config Download

- **Fixed**: Removed splash damage/radius params from 12 projectiles where `m_bSplash = False` (splash disabled in game engine)
  - Affected units: Squad Transport, Light Quad, Heavy Quad, and others (60 params removed)
- **Added**: "Download Default Config" button to export full default config JSON
- **Synced**: Server config now has Sol Harvester / Cent Harvester split natively (78 units total)

## 2026-03-03 - Projectile Damage Sub-Categories & Splash Params

- **Added**: Per-unit projectile damage sub-category multipliers:
  - `pri_impact_damage_mult`, `pri_splash_damage_mult`, `pri_penetrating_damage_mult`, `pri_ricochet_damage_mult`
  - `sec_impact_damage_mult`, `sec_splash_damage_mult`, `sec_penetrating_damage_mult`, `sec_ricochet_damage_mult`
  - Unprefixed variants for turrets: `impact_damage_mult`, `splash_damage_mult`
- **Added**: Splash radius multipliers per weapon:
  - `pri_splash_radius_max_mult`, `pri_splash_radius_min_mult`, `pri_splash_radius_pow_mult`
  - `sec_splash_radius_max_mult`, `sec_splash_radius_min_mult`, `sec_splash_radius_pow_mult`
  - Unprefixed variants for turrets: `splash_radius_max_mult`, `splash_radius_min_mult`, `splash_radius_pow_mult`
- **Removed**: Old generic `damage_mult` replaced by specific damage type multipliers
- **Fixed**: Harvester split into Sol Harvester / Cent Harvester (was accidentally reverted)
- **Kept**: Infantry separate `walk_speed_mult`, `run_speed_mult`, `sprint_speed_mult` (server uses combined `move_speed_mult`, Interactive keeps detailed version)

## 2026-03-03 - HQ Split (Sol / Centauri)

- **Changed**: "Headquarters" split into "Sol Headquarters" and "Cent Headquarters" for independent config
- **Note**: Reverted back to single "Headquarters" after server config update consolidated them again

## 2026-03-02 - Initial Release

- **Created**: Data-driven web tool for Si_UnitBalance config editing
- **Architecture**: Reads actual keys from default config JSON; no hardcoded profiles
- **Features**: Tree menu with categories, per-unit parameter editors, import/export JSON, search, modification badges
- **Styling**: Dark theme with faction color coding (Sol blue, Centauri red, Alien green)
- **Deployed**: GitHub Pages at https://drmuck.github.io/Si_UnitBalance_Interactive/

### Unit Data Corrections (2026-03-02)
- Infantry: Replaced single `move_speed_mult` with `walk_speed_mult`, `run_speed_mult`, `sprint_speed_mult`
- Removed secondary weapon from: Strike Tank, Flak Car, Crimson Tank, Squad Transport, Platoon Hauler, Siege Tank, Dropship
- Split Harvester into Sol Harvester (Sol Units) and Cent Harvester (Centauri Units)
