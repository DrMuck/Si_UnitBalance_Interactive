/**
 * Sidebar tree menu: categories, unit selection, search filter, modification badges.
 */
const Tree = (() => {
    let selectedUnit = null;
    let selectedIsGlobal = false;
    let onSelectCallback = null;
    let onGlobalCallback = null;

    // DOM references
    const categoryEls = [];  // { el, header, badge, units: [{el, name}] }

    function init() {
        const container = document.getElementById('unit-tree');
        container.innerHTML = '';

        for (const cat of Schema.CATEGORIES) {
            const catEl = document.createElement('div');
            catEl.className = 'tree-category';

            // Header
            const header = document.createElement('div');
            header.className = 'tree-category-header';
            const chevron = document.createElement('span');
            chevron.className = 'tree-chevron';
            chevron.textContent = '\u25BC';
            const label = document.createElement('span');
            label.textContent = cat.name;
            const badge = document.createElement('span');
            badge.className = 'tree-badge';

            header.appendChild(chevron);
            header.appendChild(label);
            header.appendChild(badge);
            catEl.appendChild(header);

            // Unit list
            const list = document.createElement('div');
            list.className = 'tree-unit-list';

            const unitEls = [];
            for (const unitName of cat.units) {
                const unitEl = document.createElement('div');
                unitEl.className = `tree-unit faction-${cat.faction}`;
                unitEl.dataset.unit = unitName;

                const nameSpan = document.createElement('span');
                nameSpan.textContent = unitName;
                const dot = document.createElement('span');
                dot.className = 'modified-dot';

                unitEl.appendChild(nameSpan);
                unitEl.appendChild(dot);
                list.appendChild(unitEl);

                unitEl.addEventListener('click', () => selectUnit(unitName));
                unitEls.push({ el: unitEl, name: unitName });
            }

            catEl.appendChild(list);
            container.appendChild(catEl);

            // Collapse toggle
            header.addEventListener('click', () => {
                catEl.classList.toggle('collapsed');
            });

            // Start collapsed except first category
            if (categoryEls.length > 0) {
                catEl.classList.add('collapsed');
            }

            categoryEls.push({ el: catEl, header, badge, units: unitEls, cat });
        }

        // Search filter
        document.getElementById('unit-search').addEventListener('input', (e) => {
            filterUnits(e.target.value);
        });
    }

    function selectUnit(unitName) {
        selectedUnit = unitName;
        selectedIsGlobal = false;

        // Update visual selection
        for (const catData of categoryEls) {
            for (const u of catData.units) {
                u.el.classList.toggle('selected', u.name === unitName);
            }
            // Auto-expand category containing selected unit
            if (catData.cat.units.includes(unitName)) {
                catData.el.classList.remove('collapsed');
            }
        }

        if (onSelectCallback) onSelectCallback(unitName);
    }

    function selectGlobal() {
        selectedUnit = null;
        selectedIsGlobal = true;

        // Deselect all units
        for (const catData of categoryEls) {
            for (const u of catData.units) {
                u.el.classList.remove('selected');
            }
        }

        if (onGlobalCallback) onGlobalCallback();
    }

    function filterUnits(query) {
        const q = query.toLowerCase().trim();

        for (const catData of categoryEls) {
            let visibleCount = 0;
            for (const u of catData.units) {
                const matches = !q || u.name.toLowerCase().includes(q);
                u.el.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            }
            // Hide category if no matching units
            catData.el.style.display = visibleCount > 0 ? '' : 'none';
            // Auto-expand when searching
            if (q && visibleCount > 0) {
                catData.el.classList.remove('collapsed');
            }
        }
    }

    function refreshBadges() {
        for (const catData of categoryEls) {
            let modCount = 0;
            for (const u of catData.units) {
                const isMod = State.isUnitModified(u.name);
                u.el.classList.toggle('modified', isMod);
                if (isMod) modCount++;
            }
            catData.badge.textContent = modCount + '/' + catData.units.length;
            catData.badge.classList.toggle('visible', modCount > 0);
        }
    }

    function onSelect(callback) {
        onSelectCallback = callback;
    }

    function onGlobal(callback) {
        onGlobalCallback = callback;
    }

    function setSelection(unitName) {
        selectUnit(unitName);
    }

    function getSelection() {
        return selectedUnit;
    }

    return {
        init,
        selectUnit,
        selectGlobal,
        setSelection,
        getSelection,
        refreshBadges,
        onSelect,
        onGlobal,
    };
})();
