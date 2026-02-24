// Sidebar conversation list management
const Conversations = (() => {
    const listEl = () => document.getElementById('conversation-list');

    async function refresh() {
        const convs = await API.listConversations();
        render(convs);
    }

    function render(convs) {
        const el = listEl();
        el.innerHTML = '';
        const currentId = App.getCurrentConversationId();

        for (const conv of convs) {
            const item = document.createElement('div');
            item.className = 'conv-item' + (conv.id === currentId ? ' active' : '');
            item.dataset.id = conv.id;

            item.innerHTML = `
                <span class="conv-item-title">${escapeHtml(conv.title)}</span>
                <div class="conv-item-actions">
                    <button class="btn-rename" title="Rename">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-delete" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            `;

            // Click to load conversation
            item.addEventListener('click', (e) => {
                if (e.target.closest('.conv-item-actions')) return;
                loadConversation(conv.id);
            });

            // Rename
            item.querySelector('.btn-rename').addEventListener('click', (e) => {
                e.stopPropagation();
                renameConversation(conv.id, conv.title);
            });

            // Delete
            item.querySelector('.btn-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteConversation(conv.id);
            });

            el.appendChild(item);
        }
    }

    async function loadConversation(id) {
        App.setCurrentConversation(id);
        const conv = await API.getConversation(id);
        Chat.renderConversation(conv);
        refresh();
        closeSidebar();
    }

    async function newConversation() {
        const conv = await API.createConversation();
        App.setCurrentConversation(conv.id);
        Chat.clear();
        refresh();
        closeSidebar();
    }

    async function renameConversation(id, currentTitle) {
        const newTitle = prompt('Rename conversation:', currentTitle);
        if (newTitle && newTitle.trim()) {
            await API.updateConversation(id, { title: newTitle.trim() });
            refresh();
        }
    }

    async function deleteConversation(id) {
        if (!confirm('Delete this conversation?')) return;
        await API.deleteConversation(id);
        if (App.getCurrentConversationId() === id) {
            App.setCurrentConversation(null);
            Chat.clear();
        }
        refresh();
    }

    function closeSidebar() {
        // On mobile, close sidebar after selecting
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('sidebar-overlay').classList.remove('active');
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { refresh, loadConversation, newConversation };
})();
