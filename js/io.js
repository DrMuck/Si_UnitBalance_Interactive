/**
 * Import/export/reset handlers.
 */
const IO = (() => {
    function init() {
        document.getElementById('btn-export').addEventListener('click', exportDownload);
        document.getElementById('btn-clipboard').addEventListener('click', exportClipboard);
        document.getElementById('btn-import').addEventListener('click', () => {
            document.getElementById('file-import').click();
        });
        document.getElementById('file-import').addEventListener('change', importFile);
        document.getElementById('btn-reset-all').addEventListener('click', resetAll);
    }

    function exportDownload() {
        const json = State.exportConfig();
        const text = JSON.stringify(json, null, 4);
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Si_UnitBalance_Config.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Config downloaded');
    }

    function exportClipboard() {
        const json = State.exportConfig();
        const text = JSON.stringify(json, null, 4);
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard');
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('Copied to clipboard');
        });
    }

    function importFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target.result);
                if (!json.units && !json.tech_time) {
                    showToast('Invalid config: missing "units" or "tech_time"');
                    return;
                }
                State.importConfig(json);
                Tree.refreshBadges();
                // Re-render current view
                const current = Tree.getSelection();
                if (current) {
                    Editor.render(current);
                } else {
                    Editor.renderGlobal();
                }
                showToast('Config loaded: ' + file.name);
            } catch (err) {
                showToast('Error parsing JSON: ' + err.message);
            }
        };
        reader.readAsText(file);
        // Reset so same file can be re-imported
        e.target.value = '';
    }

    function resetAll() {
        if (!confirm('Reset all values to defaults? This cannot be undone.')) return;
        State.resetAll();
        Tree.refreshBadges();
        const current = Tree.getSelection();
        if (current) {
            Editor.render(current);
        } else {
            Editor.renderGlobal();
        }
        showToast('All values reset to defaults');
    }

    let toastTimer = null;
    function showToast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('visible'), 2500);
    }

    return {
        init,
        exportDownload,
        showToast,
    };
})();
