// SKZ AI - Conversation management
const Conversations = (() => {
    let conversations = [];
    let currentId = null;

    async function init() {
        await refresh();
    }

    async function refresh() {
        try {
            conversations = await API.listConversations();
            renderList();
        } catch (e) {
            console.error('Failed to load conversations:', e);
        }
    }

    function renderList() {
        const list = document.getElementById('conversation-list');
        if (!list) return;
        list.innerHTML = '';

        if (conversations.length === 0) {
            list.innerHTML = '<div class="conv-empty">대화가 없습니다</div>';
            return;
        }

        conversations.forEach(c => {
            const item = document.createElement('div');
            item.className = 'conv-item' + (c.id === currentId ? ' active' : '');
            item.dataset.convId = c.id;

            const member = Members.getMember(c.member_id);
            const emoji = member ? member.emoji : '💬';

            item.innerHTML = `
                <span class="conv-emoji">${emoji}</span>
                <span class="conv-title">${escapeHTML(c.title)}</span>
                <button class="conv-delete" title="삭제" onclick="event.stopPropagation(); Conversations.deleteConv('${c.id}')">✕</button>`;
            item.onclick = () => loadConversation(c.id);
            list.appendChild(item);
        });
    }

    async function createNew() {
        const memberId = Members.getCurrentMemberId();
        try {
            const conv = await API.createConversation(memberId);
            currentId = conv.id;
            await refresh();
            Chat.showWelcome(memberId);
            return conv;
        } catch (e) {
            console.error('Failed to create conversation:', e);
        }
    }

    async function loadConversation(convId) {
        try {
            const conv = await API.getConversation(convId);
            currentId = conv.id;

            // Update member selection
            if (conv.member_id) {
                Members.setCurrentMemberId(conv.member_id);
                Members.selectMember(conv.member_id);
            }

            // Load messages
            Chat.loadMessages(conv.messages, conv.member_id);
            renderList();

            // Close sidebar on mobile
            closeSidebarOnMobile();
        } catch (e) {
            console.error('Failed to load conversation:', e);
        }
    }

    async function deleteConv(convId) {
        try {
            await API.deleteConversation(convId);
            if (currentId === convId) {
                currentId = null;
                Chat.clearChat();
                Chat.showWelcome();
            }
            await refresh();
        } catch (e) {
            console.error('Failed to delete conversation:', e);
        }
    }

    function getCurrentId() {
        return currentId;
    }

    function closeSidebarOnMobile() {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar')?.classList.remove('open');
        }
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init, refresh, createNew, loadConversation, deleteConv, getCurrentId };
})();
