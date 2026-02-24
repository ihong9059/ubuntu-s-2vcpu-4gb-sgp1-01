// App initialization and global state
const App = (() => {
    let currentConversationId = null;
    let providersStatus = {};

    function getCurrentConversationId() {
        return currentConversationId;
    }

    function setCurrentConversation(id) {
        currentConversationId = id;
    }

    async function refreshProviders() {
        try {
            providersStatus = await API.getProvidersStatus();
            updateProviderUI();
        } catch (e) {
            console.error('Failed to fetch providers:', e);
        }
    }

    function onModeChange() {
        const mode = document.getElementById('mode-select').value;
        const providerSelect = document.getElementById('provider-select');
        const modelSelect = document.getElementById('model-select');
        const onlineCount = document.getElementById('online-count');

        if (mode === 'single') {
            providerSelect.classList.remove('hidden');
            modelSelect.classList.remove('hidden');
            onlineCount.classList.add('hidden');
            updateProviderUI();
        } else {
            // Compare or Smart: hide provider/model selects, show online count
            providerSelect.classList.add('hidden');
            modelSelect.classList.add('hidden');

            const available = Object.entries(providersStatus)
                .filter(([name, s]) => s.available && name !== 'ollama')
                .length;
            const total = Object.entries(providersStatus)
                .filter(([name, s]) => s.available)
                .length;
            const count = available > 0 ? available : total;

            onlineCount.textContent = `${count} AI online`;
            onlineCount.classList.remove('hidden');

            const dot = document.getElementById('provider-status');
            if (count > 0) {
                dot.className = 'provider-dot online';
                dot.title = `${mode}: ${count} providers online`;
            } else {
                dot.className = 'provider-dot offline';
                dot.title = `${mode}: no providers online`;
            }
        }
    }

    function updateProviderUI() {
        const mode = document.getElementById('mode-select').value;
        if (mode !== 'single') {
            onModeChange();
            return;
        }

        const selected = document.getElementById('provider-select').value;
        const dot = document.getElementById('provider-status');
        const modelSelect = document.getElementById('model-select');

        modelSelect.classList.remove('hidden');
        const status = providersStatus[selected];
        if (status && status.available) {
            dot.className = 'provider-dot online';
            dot.title = selected + ': online';
        } else {
            dot.className = 'provider-dot offline';
            dot.title = selected + ': offline';
        }
        // Update model select
        updateModelSelect(selected);
    }

    function updateModelSelect(provider) {
        const modelSelect = document.getElementById('model-select');
        modelSelect.innerHTML = '<option value="">Default</option>';

        const status = providersStatus[provider];
        if (status && status.models) {
            for (const model of status.models) {
                const opt = document.createElement('option');
                opt.value = model;
                opt.textContent = model;
                modelSelect.appendChild(opt);
            }
        }
    }

    function onProviderChange() {
        updateProviderUI();
    }

    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const toggleBtn = document.getElementById('btn-sidebar-toggle');

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    async function init() {
        // Init modules
        initSidebar();
        Chat.initInput();
        Settings.init();

        // Event listeners
        document.getElementById('mode-select').addEventListener('change', onModeChange);
        document.getElementById('provider-select').addEventListener('change', onProviderChange);
        document.getElementById('btn-new-chat').addEventListener('click', () => Conversations.newConversation());

        // Force Smart mode on load (prevent mobile Chrome form auto-restore)
        document.getElementById('mode-select').value = 'smart';
        onModeChange();

        // Load data
        await refreshProviders();

        // Load preferences to set default mode and provider
        try {
            const config = await API.getConfig();
            const prefs = config.preferences || {};
            if (prefs.default_mode) {
                document.getElementById('mode-select').value = prefs.default_mode;
            }
            if (prefs.default_provider) {
                document.getElementById('provider-select').value = prefs.default_provider;
            }
        } catch (e) {
            // ignore
        }

        // Always update UI based on current mode (after preferences loaded)
        onModeChange();

        // Focus input
        document.getElementById('chat-input').focus();
    }

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        getCurrentConversationId,
        setCurrentConversation,
        refreshProviders,
        onProviderChange,
        onModeChange,
    };
})();
