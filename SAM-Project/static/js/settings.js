// SKZ AI - Settings
const Settings = (() => {
    function init() {
        // Load current config
        loadConfig();
    }

    async function loadConfig() {
        try {
            const config = await API.getConfig();
            const keyInput = document.getElementById('setting-gemini-key');
            if (keyInput) keyInput.value = config.api_keys?.gemini || '';
        } catch (e) {
            console.error('Failed to load config:', e);
        }
    }

    async function saveApiKey() {
        const keyInput = document.getElementById('setting-gemini-key');
        if (!keyInput) return;
        const key = keyInput.value.trim();
        try {
            await API.saveKeys({ gemini: key });
            showToast('API 키가 저장되었습니다!');
        } catch (e) {
            showToast('저장 실패: ' + e.message, true);
        }
    }

    function toggleModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.toggle('open');
            if (modal.classList.contains('open')) {
                loadConfig();
            }
        }
    }

    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = 'toast' + (isError ? ' toast-error' : '');
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    return { init, saveApiKey, toggleModal, showToast };
})();
