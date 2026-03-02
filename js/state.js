/**
 * Application state: current config, default config, change tracking, clean export.
 * Data-driven: uses actual config keys instead of predefined param lists.
 */
const State = (() => {
    let defaultConfig = null;
    let currentConfig = null;

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function loadDefault(json) {
        defaultConfig = deepClone(json);
        currentConfig = deepClone(json);
        if (!currentConfig.units) currentConfig.units = {};
        if (!defaultConfig.units) defaultConfig.units = {};
    }

    function importConfig(json) {
        currentConfig = deepClone(defaultConfig);
        if (!currentConfig.units) currentConfig.units = {};

        // Top-level
        if (json.enabled !== undefined) currentConfig.enabled = json.enabled;
        if (json.dump_fields !== undefined) currentConfig.dump_fields = json.dump_fields;
        if (json.shrimp_disable_aim !== undefined) currentConfig.shrimp_disable_aim = json.shrimp_disable_aim;
        if (json.description !== undefined) currentConfig.description = json.description;

        // Tech time
        if (json.tech_time) {
            if (!currentConfig.tech_time) currentConfig.tech_time = {};
            for (let i = 1; i <= 8; i++) {
                const key = 'tier_' + i;
                if (json.tech_time[key] !== undefined) {
                    currentConfig.tech_time[key] = json.tech_time[key];
                }
            }
        }

        // Units
        if (json.units) {
            for (const [name, data] of Object.entries(json.units)) {
                if (name.startsWith('_') && name !== '_teleport') continue;
                if (!currentConfig.units[name]) currentConfig.units[name] = {};
                for (const [k, v] of Object.entries(data)) {
                    if (k.startsWith('_')) continue;
                    if (k === 'projectiles') {
                        currentConfig.units[name].projectiles = deepClone(v);
                    } else {
                        currentConfig.units[name][k] = v;
                    }
                }
            }
            if (json.units._teleport) {
                currentConfig.units._teleport = deepClone(json.units._teleport);
            }
        }
    }

    // ── Default config access ──

    function getDefaultUnitData(unitName) {
        return defaultConfig.units[unitName] || null;
    }

    // ── Unit params ──

    function getUnitParam(unitName, paramKey) {
        const data = currentConfig.units[unitName];
        if (data && data[paramKey] !== undefined) return data[paramKey];
        // Fall back to default config value
        const defData = defaultConfig.units[unitName];
        if (defData && defData[paramKey] !== undefined) return defData[paramKey];
        // Fall back to PARAM_META defaults
        const meta = Schema.getParamMeta(paramKey);
        if (meta && meta.type === 'multiplier') return 1.0;
        if (meta && meta.type === 'tier') return -1;
        return undefined;
    }

    function setUnitParam(unitName, paramKey, value) {
        if (!currentConfig.units[unitName]) currentConfig.units[unitName] = {};
        currentConfig.units[unitName][paramKey] = value;
    }

    function resetUnitParam(unitName, paramKey) {
        if (!currentConfig.units[unitName]) return;
        const defData = defaultConfig.units[unitName];
        if (defData && defData[paramKey] !== undefined) {
            currentConfig.units[unitName][paramKey] = deepClone(defData[paramKey]);
        } else {
            delete currentConfig.units[unitName][paramKey];
        }
    }

    function resetUnit(unitName) {
        const defData = defaultConfig.units[unitName];
        currentConfig.units[unitName] = defData ? deepClone(defData) : {};
    }

    function resetAll() {
        currentConfig = deepClone(defaultConfig);
    }

    function isModified(unitName, paramKey) {
        const cur = getUnitParam(unitName, paramKey);
        const defData = defaultConfig.units[unitName];
        const def = (defData && defData[paramKey] !== undefined) ? defData[paramKey] : undefined;
        if (def === undefined) return false;
        if (typeof cur === 'number' && typeof def === 'number') {
            return Math.abs(cur - def) > 0.0001;
        }
        return cur !== def;
    }

    function isUnitModified(unitName) {
        const defData = defaultConfig.units[unitName];
        if (!defData) return false;
        // Check all non-underscore keys in the default data
        for (const key of Object.keys(defData)) {
            if (key.startsWith('_')) continue;
            if (key === 'projectiles') continue;
            if (isModified(unitName, key)) return true;
        }
        // Check projectiles
        const data = currentConfig.units[unitName];
        const curProj = data && data.projectiles;
        const defProj = defData.projectiles;
        if (JSON.stringify(curProj || {}) !== JSON.stringify(defProj || {})) return true;
        return false;
    }

    function getModifiedCount(unitNames) {
        let count = 0;
        for (const name of unitNames) {
            if (isUnitModified(name)) count++;
        }
        return count;
    }

    // ── Tech time ──

    function getTechTime(tier) {
        const key = 'tier_' + tier;
        if (currentConfig.tech_time && currentConfig.tech_time[key] !== undefined) {
            return currentConfig.tech_time[key];
        }
        return 30;
    }

    function setTechTime(tier, value) {
        if (!currentConfig.tech_time) currentConfig.tech_time = {};
        currentConfig.tech_time['tier_' + tier] = value;
    }

    function isTechTimeModified(tier) {
        const cur = getTechTime(tier);
        const key = 'tier_' + tier;
        const def = (defaultConfig.tech_time && defaultConfig.tech_time[key] !== undefined)
            ? defaultConfig.tech_time[key] : 30;
        return Math.abs(cur - def) > 0.01;
    }

    // ── Teleport ──

    function getTeleport() {
        return currentConfig.units && currentConfig.units._teleport
            ? deepClone(currentConfig.units._teleport)
            : {};
    }

    function setTeleportParam(key, value) {
        if (!currentConfig.units._teleport) currentConfig.units._teleport = {};
        if (value === '' || value === undefined) {
            delete currentConfig.units._teleport[key];
        } else {
            currentConfig.units._teleport[key] = value;
        }
    }

    function isTeleportModified() {
        const cur = currentConfig.units && currentConfig.units._teleport;
        const def = defaultConfig.units && defaultConfig.units._teleport;
        return JSON.stringify(cur || {}) !== JSON.stringify(def || {});
    }

    // ── Top-level ──

    function getDescription() {
        return currentConfig.description || '';
    }

    function setDescription(text) {
        currentConfig.description = text;
    }

    function getEnabled() {
        return currentConfig.enabled !== false;
    }

    function setEnabled(val) {
        currentConfig.enabled = !!val;
    }

    function getShrimpDisableAim() {
        return !!currentConfig.shrimp_disable_aim;
    }

    function setShrimpDisableAim(val) {
        currentConfig.shrimp_disable_aim = !!val;
    }

    // ── Projectile overrides ──

    function getProjectiles(unitName) {
        const data = currentConfig.units[unitName];
        return (data && data.projectiles) ? deepClone(data.projectiles) : {};
    }

    function setProjectileField(unitName, projName, field, value) {
        if (!currentConfig.units[unitName]) currentConfig.units[unitName] = {};
        if (!currentConfig.units[unitName].projectiles) currentConfig.units[unitName].projectiles = {};
        if (!currentConfig.units[unitName].projectiles[projName]) currentConfig.units[unitName].projectiles[projName] = {};
        currentConfig.units[unitName].projectiles[projName][field] = value;
    }

    function removeProjectileField(unitName, projName, field) {
        const proj = currentConfig.units[unitName]?.projectiles?.[projName];
        if (!proj) return;
        delete proj[field];
        if (Object.keys(proj).length === 0) {
            delete currentConfig.units[unitName].projectiles[projName];
        }
        if (currentConfig.units[unitName].projectiles &&
            Object.keys(currentConfig.units[unitName].projectiles).length === 0) {
            delete currentConfig.units[unitName].projectiles;
        }
    }

    function removeProjectile(unitName, projName) {
        const projs = currentConfig.units[unitName]?.projectiles;
        if (!projs) return;
        delete projs[projName];
        if (Object.keys(projs).length === 0) {
            delete currentConfig.units[unitName].projectiles;
        }
    }

    function addProjectile(unitName, projName) {
        if (!currentConfig.units[unitName]) currentConfig.units[unitName] = {};
        if (!currentConfig.units[unitName].projectiles) currentConfig.units[unitName].projectiles = {};
        if (!currentConfig.units[unitName].projectiles[projName]) {
            currentConfig.units[unitName].projectiles[projName] = {};
        }
    }

    // ── Export ──

    function isGlobalModified() {
        if (currentConfig.enabled !== defaultConfig.enabled) return true;
        if (currentConfig.shrimp_disable_aim !== defaultConfig.shrimp_disable_aim) return true;
        if ((currentConfig.description || '') !== (defaultConfig.description || '')) return true;
        for (let i = 1; i <= 8; i++) {
            if (isTechTimeModified(i)) return true;
        }
        if (isTeleportModified()) return true;
        return false;
    }

    function exportConfig() {
        const out = {};

        // Top-level
        out.enabled = currentConfig.enabled !== false;
        if (currentConfig.dump_fields) out.dump_fields = true;
        if (currentConfig.shrimp_disable_aim) out.shrimp_disable_aim = true;
        if (currentConfig.description) out.description = currentConfig.description;

        // Tech time
        out.tech_time = {};
        for (let i = 1; i <= 8; i++) {
            out.tech_time['tier_' + i] = getTechTime(i);
        }

        // Units — only include entries with non-default values
        out.units = {};

        for (const cat of Schema.CATEGORIES) {
            for (const unitName of cat.units) {
                const defData = defaultConfig.units[unitName];
                if (!defData) continue;
                const entry = {};
                let hasValues = false;

                // Check all non-underscore params
                for (const key of Object.keys(defData)) {
                    if (key.startsWith('_')) continue;
                    if (key === 'projectiles') continue;

                    const cur = getUnitParam(unitName, key);
                    const def = defData[key];
                    const isDiff = typeof cur === 'number' && typeof def === 'number'
                        ? Math.abs(cur - def) > 0.0001
                        : cur !== def;
                    if (isDiff) {
                        entry[key] = cur;
                        hasValues = true;
                    }
                }

                // Projectiles
                const projs = getProjectiles(unitName);
                if (Object.keys(projs).length > 0) {
                    entry.projectiles = projs;
                    hasValues = true;
                }

                if (hasValues) {
                    out.units[unitName] = entry;
                }
            }
        }

        // Teleport
        const tp = getTeleport();
        if (Object.keys(tp).length > 0) {
            out.units._teleport = tp;
        }

        return out;
    }

    return {
        loadDefault,
        importConfig,
        getDefaultUnitData,
        getUnitParam,
        setUnitParam,
        resetUnitParam,
        resetUnit,
        resetAll,
        isModified,
        isUnitModified,
        getModifiedCount,
        getTechTime,
        setTechTime,
        isTechTimeModified,
        getTeleport,
        setTeleportParam,
        isTeleportModified,
        getDescription,
        setDescription,
        getEnabled,
        setEnabled,
        getShrimpDisableAim,
        setShrimpDisableAim,
        getProjectiles,
        setProjectileField,
        removeProjectileField,
        removeProjectile,
        addProjectile,
        isGlobalModified,
        exportConfig,
    };
})();
