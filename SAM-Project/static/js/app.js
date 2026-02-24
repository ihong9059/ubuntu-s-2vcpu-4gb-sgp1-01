// SKZ AI - App initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize modules
    Voice.init();

    await Members.init((memberId) => {
        // When member changes, show welcome for new member
        const convId = Conversations.getCurrentId();
        if (!convId) {
            Chat.showWelcome(memberId);
        }
    });

    await Conversations.init();
    Settings.init();
    News.init();

    // Show welcome screen
    Chat.showWelcome();

    // ── Event listeners ──

    // Send button
    document.getElementById('btn-send')?.addEventListener('click', () => {
        if (Chat.getIsStreaming()) {
            Chat.stopGeneration();
        } else {
            Chat.sendMessage();
        }
    });

    // Enter to send (Shift+Enter for newline)
    document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            Chat.sendMessage();
        }
    });

    // Auto-resize textarea
    document.getElementById('chat-input')?.addEventListener('input', Chat.autoResizeInput);

    // New conversation button
    document.getElementById('btn-new-conv')?.addEventListener('click', async () => {
        await Conversations.createNew();
        Chat.showWelcome(Members.getCurrentMemberId());
    });

    // Mic button
    document.getElementById('btn-mic')?.addEventListener('click', Voice.toggleListening);

    // Settings button
    document.getElementById('btn-settings')?.addEventListener('click', Settings.toggleModal);

    // Settings save
    document.getElementById('btn-save-key')?.addEventListener('click', Settings.saveApiKey);

    // Settings close
    document.getElementById('btn-close-settings')?.addEventListener('click', Settings.toggleModal);

    // Sidebar toggle (mobile)
    document.getElementById('btn-sidebar-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('open');
    });

    // News panel toggle (mobile)
    document.getElementById('btn-news-toggle')?.addEventListener('click', News.togglePanel);

    // Close settings on backdrop click
    document.getElementById('settings-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') Settings.toggleModal();
    });
});
