// Settings modal management
const Settings = (() => {
    const modal = () => document.getElementById('settings-modal');

    function open() {
        modal().classList.remove('hidden');
        loadConfig();
    }

    function close() {
        modal().classList.add('hidden');
    }

    async function loadConfig() {
        const config = await API.getConfig();

        // API keys (show masked values as placeholders)
        const keys = config.api_keys || {};
        document.getElementById('key-claude').value = '';
        document.getElementById('key-claude').placeholder = keys.claude || 'sk-ant-...';
        document.getElementById('key-openai').value = '';
        document.getElementById('key-openai').placeholder = keys.openai || 'sk-...';
        document.getElementById('key-gemini').value = '';
        document.getElementById('key-gemini').placeholder = keys.gemini || 'AI...';

        // Preferences
        const prefs = config.preferences || {};
        document.getElementById('pref-mode').value = prefs.default_mode || 'single';
        document.getElementById('pref-provider').value = prefs.default_provider || 'ollama';
        document.getElementById('pref-system-prompt').value = prefs.system_prompt || '';
    }

    async function saveKeys() {
        const keys = {};
        const claude = document.getElementById('key-claude').value.trim();
        const openai = document.getElementById('key-openai').value.trim();
        const gemini = document.getElementById('key-gemini').value.trim();

        // Only send non-empty values (don't overwrite with empty)
        if (claude) keys.claude = claude;
        if (openai) keys.openai = openai;
        if (gemini) keys.gemini = gemini;

        if (Object.keys(keys).length === 0) {
            showToast('No keys to save');
            return;
        }

        await API.saveKeys(keys);
        showToast('API keys saved');
        App.refreshProviders();
        loadConfig();
    }

    async function savePreferences() {
        const prefs = {
            default_mode: document.getElementById('pref-mode').value,
            default_provider: document.getElementById('pref-provider').value,
            system_prompt: document.getElementById('pref-system-prompt').value.trim(),
        };
        await API.savePreferences(prefs);
        showToast('Preferences saved');

        // Update mode and provider selects to match
        document.getElementById('mode-select').value = prefs.default_mode;
        document.getElementById('provider-select').value = prefs.default_provider;
        App.onModeChange();
    }

    function init() {
        document.getElementById('btn-settings').addEventListener('click', open);
        document.getElementById('btn-close-settings').addEventListener('click', close);
        modal().querySelector('.modal-backdrop').addEventListener('click', close);
        document.getElementById('btn-save-keys').addEventListener('click', saveKeys);
        document.getElementById('btn-save-prefs').addEventListener('click', savePreferences);
    }

    return { init, open, close };
})();

function showToast(msg, duration = 2500) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}
