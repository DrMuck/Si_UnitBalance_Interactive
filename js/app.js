/**
 * Application bootstrap and coordination.
 */
const App = (() => {
    async function init() {
        // Load default config
        try {
            const resp = await fetch('data/Si_UnitBalance_Config_Default.json');
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const defaultConfig = await resp.json();
            State.loadDefault(defaultConfig);
        } catch (err) {
            document.getElementById('editor-panel').innerHTML =
                '<div class="welcome"><h3>Error loading config</h3><p>' + err.message + '</p></div>';
            return;
        }

        // Init modules
        Tree.init();
        IO.init();

        // Wire up tree selection
        Tree.onSelect((unitName) => Editor.render(unitName));
        Tree.onGlobal(() => Editor.renderGlobal());

        // Global settings button
        document.getElementById('btn-global').addEventListener('click', () => {
            Tree.selectGlobal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                IO.exportDownload();
            }
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                document.getElementById('file-import').click();
            }
        });

        // Show welcome screen
        Editor.render(null);

        // Refresh badges (all should be clean on start)
        Tree.refreshBadges();
    }

    document.addEventListener('DOMContentLoaded', init);

    return {};
})();
