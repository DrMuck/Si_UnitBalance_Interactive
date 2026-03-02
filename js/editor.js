/**
 * Editor panel: renders controls for selected unit or global settings.
 * Data-driven: reads actual keys from the default config to determine what to render.
 */
const Editor = (() => {
    let currentUnit = null;

    function render(unitName) {
        currentUnit = unitName;
        const header = document.getElementById('editor-header');
        const panel = document.getElementById('editor-panel');

        header.innerHTML = '';
        panel.innerHTML = '';

        if (!unitName) {
            panel.innerHTML = '<div class="welcome"><h3>Select a unit from the sidebar</h3><p>Or click "Global Settings" to edit tech times, teleport, and general options.</p></div>';
            return;
        }

        const defData = State.getDefaultUnitData(unitName);
        if (!defData) {
            panel.innerHTML = '<div class="welcome"><h3>Unknown unit</h3><p>' + unitName + ' not found in default config.</p></div>';
            return;
        }

        // ── Header ──
        const h2 = document.createElement('h2');
        h2.textContent = unitName;
        header.appendChild(h2);

        // Faction badge
        const faction = Schema.getFaction(unitName);
        const badge = document.createElement('span');
        badge.className = 'faction-badge ' + faction;
        const factionLabels = { sol: 'Sol', centauri: 'Centauri', alien: 'Alien', shared: 'Sol / Centauri' };
        badge.textContent = factionLabels[faction] || faction;
        header.appendChild(badge);

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-danger btn-small';
        resetBtn.textContent = 'Reset Unit';
        resetBtn.style.marginLeft = 'auto';
        resetBtn.addEventListener('click', () => {
            State.resetUnit(unitName);
            render(unitName);
            Tree.refreshBadges();
        });
        header.appendChild(resetBtn);

        // ── Gather param keys and info strings ──
        const paramKeys = Schema.getUnitParamKeys(defData);
        const infoStrings = Schema.getUnitInfoStrings(defData);
        const grouped = Schema.groupParamKeys(paramKeys);

        // ── Render groups in order ──
        for (const groupName of Schema.GROUP_ORDER) {
            const keys = grouped[groupName];
            const infoText = infoStrings[groupName];
            if (!keys && !infoText) continue;

            const groupDiv = document.createElement('div');
            groupDiv.className = 'param-group';

            const groupHeader = document.createElement('div');
            groupHeader.className = 'param-group-header';
            groupHeader.textContent = groupName;
            groupDiv.appendChild(groupHeader);

            // Info text (e.g. "_base": "HP:100 Cost:30 Build:10.0s T0")
            if (infoText) {
                const infoEl = document.createElement('div');
                infoEl.className = 'param-info-text';
                infoEl.textContent = infoText;
                groupDiv.appendChild(infoEl);
            }

            // Param controls
            if (keys) {
                for (const key of keys) {
                    groupDiv.appendChild(createParamRow(unitName, key));
                }
            }

            panel.appendChild(groupDiv);
        }

        // ── Projectile overrides ──
        renderProjectileSection(panel, unitName, defData);
    }

    function createParamRow(unitName, paramKey) {
        const meta = Schema.getParamMeta(paramKey);
        const row = document.createElement('div');
        row.className = 'param-row';

        const label = document.createElement('span');
        label.className = 'param-label';
        label.textContent = meta ? meta.label : paramKey;
        label.title = meta ? meta.tooltip : paramKey;
        row.appendChild(label);

        const value = State.getUnitParam(unitName, paramKey);

        if (meta && meta.type === 'multiplier') {
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'param-slider';
            slider.min = meta.min;
            slider.max = meta.max;
            slider.step = meta.step;
            slider.value = value;

            const display = document.createElement('span');
            display.className = 'param-value';
            display.textContent = formatMult(value);

            const numInput = document.createElement('input');
            numInput.type = 'number';
            numInput.className = 'param-input';
            numInput.min = 0.01;
            numInput.max = 99;
            numInput.step = meta.step;
            numInput.value = value;

            slider.addEventListener('input', () => {
                const v = parseFloat(slider.value);
                numInput.value = v;
                display.textContent = formatMult(v);
                State.setUnitParam(unitName, paramKey, v);
                updateRowModified(row, unitName, paramKey);
                Tree.refreshBadges();
            });

            numInput.addEventListener('input', () => {
                let v = parseFloat(numInput.value);
                if (isNaN(v) || v < 0.01) return;
                slider.value = Math.min(Math.max(v, meta.min), meta.max);
                display.textContent = formatMult(v);
                State.setUnitParam(unitName, paramKey, v);
                updateRowModified(row, unitName, paramKey);
                Tree.refreshBadges();
            });

            row.appendChild(slider);
            row.appendChild(display);
            row.appendChild(numInput);
        } else if (meta && meta.type === 'tier') {
            const select = document.createElement('select');
            select.className = 'param-select';
            const optDef = document.createElement('option');
            optDef.value = '-1';
            optDef.textContent = 'Default';
            select.appendChild(optDef);
            for (let t = 0; t <= 8; t++) {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = 'Tier ' + t;
                select.appendChild(opt);
            }
            select.value = value;

            select.addEventListener('change', () => {
                State.setUnitParam(unitName, paramKey, parseInt(select.value));
                updateRowModified(row, unitName, paramKey);
                Tree.refreshBadges();
            });

            row.appendChild(select);
        } else if (meta && meta.type === 'float') {
            const numInput = document.createElement('input');
            numInput.type = 'number';
            numInput.className = 'param-input';
            numInput.min = meta.min;
            numInput.max = meta.max;
            numInput.step = meta.step;
            numInput.value = value;
            numInput.style.width = '100px';

            const hint = document.createElement('span');
            hint.className = 'param-hint';
            hint.textContent = value === -1 ? '(default)' : '';

            numInput.addEventListener('input', () => {
                let v = parseFloat(numInput.value);
                if (isNaN(v)) return;
                State.setUnitParam(unitName, paramKey, v);
                hint.textContent = v === -1 ? '(default)' : '';
                updateRowModified(row, unitName, paramKey);
                Tree.refreshBadges();
            });

            row.appendChild(numInput);
            row.appendChild(hint);
        } else {
            // Unknown type — render as number input
            const numInput = document.createElement('input');
            numInput.type = 'number';
            numInput.className = 'param-input';
            numInput.value = value !== undefined ? value : '';
            numInput.style.width = '100px';

            numInput.addEventListener('input', () => {
                let v = parseFloat(numInput.value);
                if (isNaN(v)) return;
                State.setUnitParam(unitName, paramKey, v);
                updateRowModified(row, unitName, paramKey);
                Tree.refreshBadges();
            });

            row.appendChild(numInput);
        }

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'param-reset';
        resetBtn.textContent = '\u21BA';
        resetBtn.title = 'Reset to default';
        resetBtn.addEventListener('click', () => {
            State.resetUnitParam(unitName, paramKey);
            render(unitName);
            Tree.refreshBadges();
        });
        row.appendChild(resetBtn);

        updateRowModified(row, unitName, paramKey);
        return row;
    }

    function updateRowModified(row, unitName, paramKey) {
        row.classList.toggle('modified', State.isModified(unitName, paramKey));
    }

    function formatMult(v) {
        return v.toFixed(2) + 'x';
    }

    // ── Projectile overrides ──

    function renderProjectileSection(panel, unitName, defData) {
        // Determine known projectile names from weapon info keys
        const knownProjs = [];
        for (const [key, val] of Object.entries(defData)) {
            if (key === '_pri_weapon' || key === '_sec_weapon' || key === '_weapon') {
                // Extract projectile name from format "ProjectileName | dmg:..."
                const parts = String(val).split('|');
                if (parts.length > 0) {
                    const projName = parts[0].trim();
                    if (projName && projName !== 'Melee') {
                        knownProjs.push('ProjectileData_' + projName);
                    }
                }
            }
        }

        // Only show projectile section if unit has any projectile-based weapons
        if (knownProjs.length === 0) return;

        const section = document.createElement('div');
        section.className = 'projectile-section';

        const header = document.createElement('div');
        header.className = 'param-group-header';
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.justifyContent = 'space-between';

        const headerLabel = document.createElement('span');
        headerLabel.textContent = 'Projectile Overrides';
        header.appendChild(headerLabel);

        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-accent btn-small';
        addBtn.textContent = '+ Add';
        addBtn.style.textTransform = 'none';
        addBtn.style.letterSpacing = '0';
        addBtn.addEventListener('click', () => showAddProjectileUI(section, unitName, knownProjs));
        header.appendChild(addBtn);

        section.appendChild(header);

        // Render existing projectiles
        const projs = State.getProjectiles(unitName);
        for (const [projName, fields] of Object.entries(projs)) {
            section.appendChild(createProjectileCard(unitName, projName, fields));
        }

        panel.appendChild(section);
    }

    function createProjectileCard(unitName, projName, fields) {
        const card = document.createElement('div');
        card.className = 'projectile-card';

        const header = document.createElement('div');
        header.className = 'projectile-card-header';
        const chevron = document.createElement('span');
        chevron.className = 'tree-chevron';
        chevron.textContent = '\u25BC';

        const nameSpan = document.createElement('span');
        nameSpan.style.flex = '1';
        nameSpan.textContent = projName;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger btn-small';
        removeBtn.textContent = 'Remove';
        removeBtn.style.fontSize = '10px';
        removeBtn.style.padding = '2px 8px';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            State.removeProjectile(unitName, projName);
            card.remove();
            Tree.refreshBadges();
        });

        header.appendChild(chevron);
        header.appendChild(nameSpan);
        header.appendChild(removeBtn);

        header.addEventListener('click', (e) => {
            if (e.target === removeBtn) return;
            card.classList.toggle('collapsed');
        });

        card.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.className = 'projectile-card-body';

        for (const [fieldKey, fieldVal] of Object.entries(fields)) {
            body.appendChild(createProjectileFieldRow(unitName, projName, fieldKey, fieldVal, body));
        }

        // Add field dropdown
        const actionsRow = document.createElement('div');
        actionsRow.className = 'projectile-actions';

        const fieldSelect = document.createElement('select');
        fieldSelect.className = 'projectile-add-field';
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = '+ Add field...';
        fieldSelect.appendChild(emptyOpt);

        for (const f of Schema.PROJECTILE_FIELDS) {
            if (fields[f.key] !== undefined) continue;
            const opt = document.createElement('option');
            opt.value = f.key;
            opt.textContent = f.label;
            fieldSelect.appendChild(opt);
        }

        fieldSelect.addEventListener('change', () => {
            const key = fieldSelect.value;
            if (!key) return;
            State.setProjectileField(unitName, projName, key, 0);
            body.insertBefore(
                createProjectileFieldRow(unitName, projName, key, 0, body),
                actionsRow
            );
            fieldSelect.querySelector(`option[value="${key}"]`).remove();
            fieldSelect.value = '';
            Tree.refreshBadges();
        });

        actionsRow.appendChild(fieldSelect);
        body.appendChild(actionsRow);

        card.appendChild(body);
        return card;
    }

    function createProjectileFieldRow(unitName, projName, fieldKey, fieldVal, body) {
        const schema = Schema.getProjectileField(fieldKey);
        const row = document.createElement('div');
        row.className = 'projectile-field-row';

        const label = document.createElement('span');
        label.className = 'projectile-field-label';
        label.textContent = schema ? schema.label : fieldKey;
        label.title = schema ? schema.tooltip : '';

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'projectile-field-input';
        input.value = fieldVal;
        input.step = schema ? schema.step : 1;
        input.min = schema ? schema.min : 0;

        input.addEventListener('input', () => {
            const v = parseFloat(input.value);
            if (isNaN(v)) return;
            State.setProjectileField(unitName, projName, fieldKey, v);
            Tree.refreshBadges();
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'projectile-remove-field';
        removeBtn.textContent = '\u2715';
        removeBtn.title = 'Remove field';
        removeBtn.addEventListener('click', () => {
            State.removeProjectileField(unitName, projName, fieldKey);
            row.remove();
            Tree.refreshBadges();
        });

        row.appendChild(label);
        row.appendChild(input);
        row.appendChild(removeBtn);
        return row;
    }

    function showAddProjectileUI(section, unitName, knownProjs) {
        if (section.querySelector('.add-proj-ui')) return;

        const ui = document.createElement('div');
        ui.className = 'add-proj-ui';
        ui.style.padding = '8px';
        ui.style.background = 'rgba(255,255,255,0.03)';
        ui.style.borderRadius = '4px';
        ui.style.marginBottom = '8px';
        ui.style.display = 'flex';
        ui.style.gap = '6px';
        ui.style.alignItems = 'center';
        ui.style.flexWrap = 'wrap';

        const existingProjs = Object.keys(State.getProjectiles(unitName));

        if (knownProjs.length > 0) {
            const select = document.createElement('select');
            select.className = 'param-select';
            select.style.flex = '1';
            select.style.minWidth = '200px';
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = 'Select weapon projectile...';
            select.appendChild(emptyOpt);

            for (const pn of knownProjs) {
                if (existingProjs.includes(pn)) continue;
                const opt = document.createElement('option');
                opt.value = pn;
                opt.textContent = pn;
                select.appendChild(opt);
            }

            const customOpt = document.createElement('option');
            customOpt.value = '__custom__';
            customOpt.textContent = 'Custom name...';
            select.appendChild(customOpt);
            ui.appendChild(select);

            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'param-input';
            textInput.style.width = '250px';
            textInput.style.display = 'none';
            textInput.placeholder = 'ProjectileData_...';
            ui.appendChild(textInput);

            select.addEventListener('change', () => {
                textInput.style.display = select.value === '__custom__' ? '' : 'none';
            });

            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn-accent btn-small';
            addBtn.textContent = 'Add';
            addBtn.addEventListener('click', () => {
                let name = select.value === '__custom__' ? textInput.value.trim() : select.value;
                if (!name || name === '__custom__') return;
                State.addProjectile(unitName, name);
                ui.remove();
                render(unitName);
                Tree.refreshBadges();
            });
            ui.appendChild(addBtn);
        } else {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'param-input';
            textInput.style.width = '280px';
            textInput.placeholder = 'ProjectileData_...';
            ui.appendChild(textInput);

            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn-accent btn-small';
            addBtn.textContent = 'Add';
            addBtn.addEventListener('click', () => {
                const name = textInput.value.trim();
                if (!name) return;
                State.addProjectile(unitName, name);
                ui.remove();
                render(unitName);
                Tree.refreshBadges();
            });
            ui.appendChild(addBtn);
        }

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-clear btn-small';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => ui.remove());
        ui.appendChild(cancelBtn);

        const firstCard = section.querySelector('.projectile-card');
        if (firstCard) {
            section.insertBefore(ui, firstCard);
        } else {
            section.appendChild(ui);
        }
    }

    // ── Global Settings ──

    function renderGlobal() {
        currentUnit = null;
        const header = document.getElementById('editor-header');
        const panel = document.getElementById('editor-panel');

        header.innerHTML = '';
        panel.innerHTML = '';

        const h2 = document.createElement('h2');
        h2.textContent = 'Global Settings';
        header.appendChild(h2);

        // ── General ──
        const descGroup = document.createElement('div');
        descGroup.className = 'param-group';
        const descHeader = document.createElement('div');
        descHeader.className = 'param-group-header';
        descHeader.textContent = 'General';
        descGroup.appendChild(descHeader);

        const descRow = document.createElement('div');
        descRow.style.padding = '4px 8px';
        const descLabel = document.createElement('div');
        descLabel.style.fontSize = '13px';
        descLabel.style.color = '#ccd';
        descLabel.style.marginBottom = '4px';
        descLabel.textContent = 'Description / Notes';
        const descArea = document.createElement('textarea');
        descArea.className = 'config-textarea';
        descArea.value = State.getDescription();
        descArea.placeholder = 'Add a description for this config...';
        descArea.addEventListener('input', () => State.setDescription(descArea.value));
        descRow.appendChild(descLabel);
        descRow.appendChild(descArea);
        descGroup.appendChild(descRow);

        descGroup.appendChild(createToggleRow('Enabled', State.getEnabled(), (v) => State.setEnabled(v),
            'Master switch: enable or disable the entire balance mod'));

        descGroup.appendChild(createToggleRow('Shrimp Disable Aim', State.getShrimpDisableAim(), (v) => State.setShrimpDisableAim(v),
            'Disable AI aim tracking for Shrimp units'));

        panel.appendChild(descGroup);

        // ── Tech Time ──
        const techGroup = document.createElement('div');
        techGroup.className = 'param-group';
        const techHeader = document.createElement('div');
        techHeader.className = 'param-group-header';
        techHeader.textContent = 'Tech Research Time';
        techGroup.appendChild(techHeader);

        const totalEl = document.createElement('div');
        totalEl.className = 'tech-total';

        function updateTotal() {
            let total = 0;
            for (let i = 1; i <= 8; i++) total += State.getTechTime(i);
            const mins = (total / 60).toFixed(1);
            totalEl.innerHTML = `Total: <span>${total}s</span> = <span>${mins} min</span> to max tech`;
        }

        for (let tier = 1; tier <= 8; tier++) {
            techGroup.appendChild(createTechRow(tier, updateTotal));
        }

        techGroup.appendChild(totalEl);
        updateTotal();
        panel.appendChild(techGroup);

        // ── Teleport ──
        const tpGroup = document.createElement('div');
        tpGroup.className = 'param-group';
        const tpHeader = document.createElement('div');
        tpHeader.className = 'param-group-header';
        tpHeader.textContent = 'Teleport (Centauri)';
        tpGroup.appendChild(tpHeader);

        const tp = State.getTeleport();

        tpGroup.appendChild(createTeleportRow('Cooldown', 'cooldown', tp.cooldown,
            'Cooldown between teleports (seconds, leave empty = default)'));
        tpGroup.appendChild(createTeleportRow('Duration', 'duration', tp.duration,
            'Teleport animation duration (seconds, leave empty = default)'));

        panel.appendChild(tpGroup);
    }

    function createToggleRow(labelText, value, onChange, tooltip) {
        const row = document.createElement('div');
        row.className = 'param-row';

        const label = document.createElement('span');
        label.className = 'param-label';
        label.textContent = labelText;
        if (tooltip) label.title = tooltip;

        const toggle = document.createElement('label');
        toggle.className = 'toggle-switch';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = value;
        const slider = document.createElement('span');
        slider.className = 'toggle-slider';
        toggle.appendChild(input);
        toggle.appendChild(slider);

        input.addEventListener('change', () => onChange(input.checked));

        row.appendChild(label);
        row.appendChild(toggle);
        return row;
    }

    function createTechRow(tier, onUpdate) {
        const row = document.createElement('div');
        row.className = 'tech-row';

        const label = document.createElement('span');
        label.className = 'tech-label';
        label.textContent = 'Tier ' + tier;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'tech-slider';
        slider.min = 5;
        slider.max = 600;
        slider.step = 5;
        slider.value = State.getTechTime(tier);

        const valDisplay = document.createElement('span');
        valDisplay.className = 'tech-value';
        valDisplay.textContent = State.getTechTime(tier) + 's';

        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.className = 'param-input';
        numInput.style.width = '70px';
        numInput.min = 1;
        numInput.max = 9999;
        numInput.step = 5;
        numInput.value = State.getTechTime(tier);

        slider.addEventListener('input', () => {
            const v = parseInt(slider.value);
            numInput.value = v;
            valDisplay.textContent = v + 's';
            State.setTechTime(tier, v);
            onUpdate();
            updateTechRowStyle(row, tier);
        });

        numInput.addEventListener('input', () => {
            let v = parseInt(numInput.value);
            if (isNaN(v) || v < 1) return;
            slider.value = Math.min(Math.max(v, 5), 600);
            valDisplay.textContent = v + 's';
            State.setTechTime(tier, v);
            onUpdate();
            updateTechRowStyle(row, tier);
        });

        row.appendChild(label);
        row.appendChild(slider);
        row.appendChild(valDisplay);
        row.appendChild(numInput);

        updateTechRowStyle(row, tier);
        return row;
    }

    function updateTechRowStyle(row, tier) {
        if (State.isTechTimeModified(tier)) {
            row.style.borderLeft = '3px solid #4fc3f7';
            row.style.background = 'rgba(79, 195, 247, 0.04)';
        } else {
            row.style.borderLeft = '3px solid transparent';
            row.style.background = '';
        }
    }

    function createTeleportRow(labelText, key, value, tooltip) {
        const row = document.createElement('div');
        row.className = 'param-row';

        const label = document.createElement('span');
        label.className = 'param-label';
        label.textContent = labelText;
        label.title = tooltip || '';

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'param-input';
        input.style.width = '100px';
        input.min = 0;
        input.step = 0.5;
        input.value = value !== undefined ? value : '';
        input.placeholder = 'default';

        const hint = document.createElement('span');
        hint.className = 'param-hint';
        hint.textContent = 'seconds';

        input.addEventListener('input', () => {
            const v = input.value.trim();
            if (v === '') {
                State.setTeleportParam(key, undefined);
            } else {
                const num = parseFloat(v);
                if (!isNaN(num)) State.setTeleportParam(key, num);
            }
        });

        row.appendChild(label);
        row.appendChild(input);
        row.appendChild(hint);
        return row;
    }

    function getCurrent() {
        return currentUnit;
    }

    return {
        render,
        renderGlobal,
        getCurrent,
    };
})();
