/**
 * Schema definitions for Si_UnitBalance config editor.
 * Data-driven: param metadata + categories. The editor reads actual keys
 * from the default config to determine what controls to render per unit.
 */
const Schema = (() => {

    // ── Parameter metadata keyed by config key ──
    // Each entry: { label, group, type, tooltip, min?, max?, step? }
    // type: 'multiplier' | 'tier' | 'float'
    const PARAM_META = {
        // Base Stats
        health_mult:                { label: 'Health',            group: 'Base Stats',       type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales max health (server-only — client health bars and cheat mode show vanilla values)' },
        cost_mult:                  { label: 'Cost',              group: 'Base Stats',       type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales build/spawn cost' },
        build_time_mult:            { label: 'Build Time',        group: 'Base Stats',       type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales build/spawn time' },
        min_tier:                   { label: 'Min Tier',          group: 'Base Stats',       type: 'tier',       tooltip: 'Minimum tech tier required (-1 = default)' },

        // Placement
        build_radius:               { label: 'Build Radius',      group: 'Placement',        type: 'float', min: 50, max: 2000, step: 10, tooltip: 'Build radius in meters' },

        // Single weapon (turrets / alien defense)
        impact_damage_mult:         { label: 'Impact Damage',      group: 'Weapon',           type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales impact (direct hit) damage' },
        splash_damage_mult:         { label: 'Splash Damage',      group: 'Weapon',           type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales splash (AoE) damage' },
        splash_radius_max_mult:     { label: 'Splash Radius Max',  group: 'Weapon',           type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales maximum splash radius' },
        splash_radius_min_mult:     { label: 'Splash Radius Min',  group: 'Weapon',           type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales minimum splash radius' },
        splash_radius_pow_mult:     { label: 'Splash Radius Pow',  group: 'Weapon',           type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales splash damage falloff curve power' },
        proj_speed_mult:            { label: 'Proj Speed',         group: 'Weapon',           type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales projectile speed' },
        proj_lifetime_mult:         { label: 'Proj Lifetime',      group: 'Weapon',           type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales projectile lifetime (affects range)' },
        range_mult:                 { label: 'Range',              group: 'Weapon',           type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales weapon range + detection range' },
        accuracy_mult:              { label: 'Accuracy',           group: 'Weapon',           type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales projectile spread (lower = tighter)' },
        magazine_mult:              { label: 'Magazine',           group: 'Weapon',           type: 'multiplier', min: 0.1, max: 20.0, step: 0.01, tooltip: 'Scales magazine capacity' },
        fire_rate_mult:             { label: 'Fire Rate',          group: 'Weapon',           type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales fire rate (divides fire interval)' },
        reload_time_mult:           { label: 'Reload Time',        group: 'Weapon',           type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales reload time' },

        // Primary weapon
        pri_damage_mult:            { label: 'Damage',             group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales primary weapon damage (melee)' },
        pri_impact_damage_mult:     { label: 'Impact Damage',      group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales primary impact damage' },
        pri_splash_damage_mult:     { label: 'Splash Damage',      group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales primary splash damage' },
        pri_penetrating_damage_mult:{ label: 'Penetrating Damage', group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales primary armor-penetrating damage' },
        pri_ricochet_damage_mult:   { label: 'Ricochet Damage',    group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales primary ricochet damage' },
        pri_splash_radius_max_mult: { label: 'Splash Radius Max',  group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales primary max splash radius' },
        pri_splash_radius_min_mult: { label: 'Splash Radius Min',  group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales primary min splash radius' },
        pri_splash_radius_pow_mult: { label: 'Splash Radius Pow',  group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales primary splash falloff curve' },
        pri_proj_speed_mult:        { label: 'Proj Speed',         group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales primary projectile speed' },
        pri_proj_lifetime_mult:     { label: 'Proj Lifetime',      group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales primary projectile lifetime' },
        pri_accuracy_mult:          { label: 'Accuracy',           group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales primary weapon spread' },
        pri_magazine_mult:          { label: 'Magazine',           group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 20.0, step: 0.01, tooltip: 'Scales primary magazine capacity' },
        pri_fire_rate_mult:         { label: 'Fire Rate',          group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales primary fire rate' },
        pri_reload_time_mult:       { label: 'Reload Time',        group: 'Primary Weapon',   type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales primary reload time' },

        // Secondary weapon
        sec_damage_mult:            { label: 'Damage',             group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales secondary weapon damage (melee)' },
        sec_impact_damage_mult:     { label: 'Impact Damage',      group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales secondary impact damage' },
        sec_splash_damage_mult:     { label: 'Splash Damage',      group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales secondary splash damage' },
        sec_penetrating_damage_mult:{ label: 'Penetrating Damage', group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales secondary armor-penetrating damage' },
        sec_ricochet_damage_mult:   { label: 'Ricochet Damage',    group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales secondary ricochet damage' },
        sec_splash_radius_max_mult: { label: 'Splash Radius Max',  group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales secondary max splash radius' },
        sec_splash_radius_min_mult: { label: 'Splash Radius Min',  group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales secondary min splash radius' },
        sec_splash_radius_pow_mult: { label: 'Splash Radius Pow',  group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 10.0, step: 0.01, tooltip: 'Scales secondary splash falloff curve' },
        sec_proj_speed_mult:        { label: 'Proj Speed',         group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales secondary projectile speed' },
        sec_proj_lifetime_mult:     { label: 'Proj Lifetime',      group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales secondary projectile lifetime' },
        sec_accuracy_mult:          { label: 'Accuracy',           group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales secondary weapon spread' },
        sec_magazine_mult:          { label: 'Magazine',           group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 20.0, step: 0.01, tooltip: 'Scales secondary magazine capacity' },
        sec_fire_rate_mult:         { label: 'Fire Rate',          group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales secondary fire rate' },
        sec_reload_time_mult:       { label: 'Reload Time',        group: 'Secondary Weapon', type: 'multiplier', min: 0.1, max: 5.0,  step: 0.01, tooltip: 'Scales secondary reload time' },

        // Movement
        move_speed_mult:            { label: 'Move Speed',         group: 'Movement',         type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales movement speed' },
        walk_speed_mult:            { label: 'Walk Speed',         group: 'Movement',         type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales walk speed (infantry)' },
        run_speed_mult:             { label: 'Run Speed',          group: 'Movement',         type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales run speed (infantry)' },
        sprint_speed_mult:          { label: 'Sprint Speed',       group: 'Movement',         type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales sprint speed (infantry)' },
        jump_speed_mult:            { label: 'Jump Speed',         group: 'Movement',         type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales jump speed (infantry)' },
        turbo_speed_mult:           { label: 'Turbo Speed',        group: 'Movement',         type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales turbo/boost speed' },
        turn_radius_mult:           { label: 'Turn Radius',        group: 'Movement',         type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales turning circle (lower = tighter turns)' },
        strafe_speed_mult:          { label: 'Strafe Speed',       group: 'Movement',         type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales strafe/lateral movement speed' },
        fly_speed_mult:             { label: 'Fly Speed',          group: 'Movement',         type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales flying speed (creatures)' },

        // Detection
        target_distance:            { label: 'Target Range',       group: 'Detection',        type: 'float', min: -1, max: 3000, step: 10, tooltip: 'Targeting distance in meters (-1 = default)' },
        fow_distance:               { label: 'FOW Range',          group: 'Detection',        type: 'float', min: -1, max: 1000, step: 10, tooltip: 'Fog of war reveal distance in meters (-1 = default)' },
        visible_event_radius_mult:  { label: 'Vis Event Radius',   group: 'Detection',        type: 'multiplier', min: 0.1, max: 5.0, step: 0.01, tooltip: 'Scales visible event radius' },

        // Special
        dispense_timeout:           { label: 'Dispense Timeout',   group: 'Special',          type: 'float', min: -1, max: 600, step: 1, tooltip: 'Vehicle dispense timeout in seconds (-1 = default)' },
    };

    // ── Display order of parameter groups ──
    const GROUP_ORDER = [
        'Base Stats', 'Placement',
        'Primary Weapon', 'Secondary Weapon', 'Weapon',
        'Movement', 'Detection', 'Special'
    ];

    // ── Info keys: underscore-prefixed comment keys from the config ──
    // Maps to which group they belong to (displayed as info text header)
    const INFO_KEYS = {
        '_base':        'Base Stats',
        '_pri_weapon':  'Primary Weapon',
        '_sec_weapon':  'Secondary Weapon',
        '_weapon':      'Weapon',
        '_base_speed':  'Movement',
        '_base_sense':  'Detection',
    };

    // ── Projectile fields for per-projectile overrides ──
    const PROJECTILE_FIELDS = [
        { key: 'm_fImpactDamage',      label: 'Impact Damage',      tooltip: 'Direct hit damage',                                              min: 0, max: 200000, step: 10 },
        { key: 'm_fRicochetDamage',    label: 'Ricochet Damage',    tooltip: 'Bounce/ricochet damage',                                         min: 0, max: 50000,  step: 10 },
        { key: 'm_fSplashDamageMax',   label: 'Splash Damage',      tooltip: 'Maximum splash damage',                                          min: 0, max: 200000, step: 10 },
        { key: 'm_fPenetratingDamage', label: 'Penetrating Damage', tooltip: 'Armor-penetrating damage',                                       min: 0, max: 50000,  step: 10 },
        { key: 'm_fBaseSpeed',         label: 'Base Speed',         tooltip: 'Projectile speed (m/s) or raycast distance for instant-hit',      min: 0, max: 5000,   step: 10 },
        { key: 'm_fLifeTime',          label: 'Lifetime',           tooltip: 'Time before despawn (seconds); visual beam duration for instant-hit', min: 0, max: 30, step: 0.1 },
        { key: 'm_VisibleEventRadius', label: 'Visible Radius',     tooltip: 'Visual render distance for beam effects (meters)',                min: 0, max: 5000,   step: 10 },
        { key: 'm_fSplashRadius',      label: 'Splash Radius',      tooltip: 'Area-of-effect splash radius (meters)',                          min: 0, max: 100,    step: 0.5 },
    ];

    // ── Unit categories for tree menu ──
    const CATEGORIES = [
        {
            name: 'Structures (Shared)',
            faction: 'shared',
            units: [
                'Sol Headquarters', 'Cent Headquarters',
                'Refinery', 'Research Facility', 'Barracks', 'Light Factory',
                'Air Factory', 'Heavy Factory', 'Ultra Heavy Factory',
                'Silo', 'Radar Station',
                'Turret', 'Heavy Turret', 'Anti-Air Rocket Turret',
            ]
        },
        {
            name: 'Sol Units',
            faction: 'sol',
            units: [
                'Scout', 'Rifleman', 'Sniper', 'Heavy', 'Commando',
                'Light Quad', 'Platoon Hauler', 'Heavy Quad',
                'Light Striker', 'Heavy Striker', 'AA Truck',
                'Hover Tank', 'Barrage Truck', 'Railgun Tank', 'Pulse Truck',
                'Sol Harvester', 'Siege Tank',
                'Gunship', 'Dropship', 'Fighter', 'Bomber',
            ]
        },
        {
            name: 'Centauri Units',
            faction: 'centauri',
            units: [
                'Militia', 'Trooper', 'Marksman', 'Juggernaut', 'Templar',
                'Light Raider', 'Squad Transport', 'Heavy Raider',
                'Assault Car', 'Strike Tank', 'Flak Car',
                'Combat Tank', 'Rocket Tank', 'Heavy Tank', 'Pyro Tank',
                'Cent Harvester', 'Crimson Tank',
                'Shuttle', 'Dreadnought', 'Interceptor', 'Freighter',
            ]
        },
        {
            name: 'Shared Vehicles',
            faction: 'shared',
            units: ['Hover Bike']
        },
        {
            name: 'Alien Structures',
            faction: 'alien',
            units: [
                'Nest', 'Node', 'Bio Cache',
                'Lesser Spawning Cyst', 'Greater Spawning Cyst',
                'Grand Spawning Cyst', 'Colossal Spawning Cyst',
                'Quantum Cortex', 'Hive Spire', 'Thorn Spire',
            ]
        },
        {
            name: 'Alien Units',
            faction: 'alien',
            units: [
                'Crab', 'Shrimp', 'Shocker', 'Wasp', 'Dragonfly', 'Squid',
                'Horned Crab', 'Hunter', 'Behemoth', 'Scorpion', 'Firebug',
                'Goliath', 'Defiler', 'Colossus', 'Queen',
            ]
        }
    ];

    // Build unit -> faction lookup
    const UNIT_FACTION = {};
    for (const cat of CATEGORIES) {
        for (const unit of cat.units) {
            UNIT_FACTION[unit] = cat.faction;
        }
    }

    return {
        PARAM_META,
        GROUP_ORDER,
        INFO_KEYS,
        PROJECTILE_FIELDS,
        CATEGORIES,
        UNIT_FACTION,

        getFaction(unitName) {
            return UNIT_FACTION[unitName] || 'shared';
        },

        getParamMeta(key) {
            return PARAM_META[key] || null;
        },

        getProjectileField(key) {
            return PROJECTILE_FIELDS.find(f => f.key === key);
        },

        /**
         * Get all editable param keys for a unit (derived from default config).
         * Returns keys in the order they appear in the config.
         */
        getUnitParamKeys(defaultUnitData) {
            if (!defaultUnitData) return [];
            return Object.keys(defaultUnitData).filter(k => !k.startsWith('_') && k !== 'projectiles');
        },

        /**
         * Get info strings for a unit (underscore-prefixed keys).
         * Returns { group: infoString } map.
         */
        getUnitInfoStrings(defaultUnitData) {
            if (!defaultUnitData) return {};
            const result = {};
            for (const [key, value] of Object.entries(defaultUnitData)) {
                if (INFO_KEYS[key]) {
                    result[INFO_KEYS[key]] = String(value);
                }
            }
            return result;
        },

        /**
         * Group param keys by their PARAM_META group.
         * Returns { groupName: [key, key, ...] } in GROUP_ORDER.
         */
        groupParamKeys(keys) {
            const groups = {};
            for (const key of keys) {
                const meta = PARAM_META[key];
                const group = meta ? meta.group : 'Other';
                if (!groups[group]) groups[group] = [];
                groups[group].push(key);
            }
            return groups;
        },
    };
})();
