// SKZ AI - Chat UI
const Chat = (() => {
    let currentXhr = null;
    let isStreaming = false;

    function appendMessage(role, content, memberId) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `message message-${role}`;

        if (role === 'user') {
            msgDiv.innerHTML = `
                <div class="message-avatar user-avatar">👤</div>
                <div class="message-content">
                    <div class="message-bubble user-bubble">${escapeHTML(content)}</div>
                </div>`;
        } else {
            const member = Members.getMember(memberId || Members.getCurrentMemberId());
            const emoji = member ? member.emoji : '🤖';
            const name = member ? member.name : 'AI';
            msgDiv.innerHTML = `
                <div class="message-avatar assistant-avatar">${emoji}</div>
                <div class="message-content">
                    <div class="message-name">${name}</div>
                    <div class="message-bubble assistant-bubble">
                        <div class="message-text">${Markdown.render(content)}</div>
                        <div class="message-actions">
                            <button class="btn-icon btn-tts" title="음성으로 듣기" onclick="Voice.speak(this)">🔊</button>
                            <button class="btn-icon btn-copy" title="복사" onclick="Chat.copyMessage(this)">📋</button>
                        </div>
                    </div>
                </div>`;
        }

        container.appendChild(msgDiv);
        scrollToBottom();
        return msgDiv;
    }

    function appendStreamingMessage(memberId) {
        const container = document.getElementById('chat-messages');
        if (!container) return null;

        const member = Members.getMember(memberId || Members.getCurrentMemberId());
        const emoji = member ? member.emoji : '🤖';
        const name = member ? member.name : 'AI';

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message message-assistant streaming';
        msgDiv.innerHTML = `
            <div class="message-avatar assistant-avatar">${emoji}</div>
            <div class="message-content">
                <div class="message-name">${name}</div>
                <div class="message-bubble assistant-bubble">
                    <div class="message-text"><span class="typing-cursor">▊</span></div>
                    <div class="message-actions" style="display:none">
                        <button class="btn-icon btn-tts" title="음성으로 듣기" onclick="Voice.speak(this)">🔊</button>
                        <button class="btn-icon btn-copy" title="복사" onclick="Chat.copyMessage(this)">📋</button>
                    </div>
                </div>
            </div>`;
        container.appendChild(msgDiv);
        scrollToBottom();
        return msgDiv;
    }

    function updateStreamingMessage(msgDiv, fullText) {
        if (!msgDiv) return;
        const textEl = msgDiv.querySelector('.message-text');
        if (textEl) {
            textEl.innerHTML = Markdown.render(fullText) + '<span class="typing-cursor">▊</span>';
        }
        scrollToBottom();
    }

    function finalizeStreamingMessage(msgDiv, fullText) {
        if (!msgDiv) return;
        msgDiv.classList.remove('streaming');
        const textEl = msgDiv.querySelector('.message-text');
        if (textEl) {
            textEl.innerHTML = Markdown.render(fullText);
            // Highlight code blocks
            textEl.querySelectorAll('pre code').forEach(block => {
                if (typeof hljs !== 'undefined') hljs.highlightElement(block);
            });
        }
        const actions = msgDiv.querySelector('.message-actions');
        if (actions) actions.style.display = '';
    }

    async function sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message || isStreaming) return;

        const convId = Conversations.getCurrentId();
        if (!convId) {
            // Create new conversation first
            await Conversations.createNew();
        }

        const memberId = Members.getCurrentMemberId();
        input.value = '';
        autoResizeInput();

        // Show user message
        appendMessage('user', message);

        // Show streaming placeholder
        const streamDiv = appendStreamingMessage(memberId);
        let fullText = '';

        isStreaming = true;
        updateSendButton();

        currentXhr = API.chatStream({
            conversationId: Conversations.getCurrentId(),
            message,
            memberId,
            onToken(token) {
                fullText += token;
                updateStreamingMessage(streamDiv, fullText);
            },
            onDone() {
                finalizeStreamingMessage(streamDiv, fullText);
                isStreaming = false;
                currentXhr = null;
                updateSendButton();
                // Refresh conversation list for auto-title
                Conversations.refresh();
                // Auto TTS: 응답 완료 후 자동 음성 재생
                autoSpeak(streamDiv);
            },
            onError(err) {
                fullText += `\n\n[Error: ${err}]`;
                finalizeStreamingMessage(streamDiv, fullText);
                isStreaming = false;
                currentXhr = null;
                updateSendButton();
            }
        });
    }

    function stopGeneration() {
        const convId = Conversations.getCurrentId();
        if (convId) API.stopChat(convId);
        if (currentXhr) {
            currentXhr.abort();
            currentXhr = null;
        }
        isStreaming = false;
        updateSendButton();
    }

    function updateSendButton() {
        const btn = document.getElementById('btn-send');
        if (!btn) return;
        if (isStreaming) {
            btn.innerHTML = '⏹';
            btn.title = '생성 중지';
            btn.onclick = stopGeneration;
        } else {
            btn.innerHTML = '➤';
            btn.title = '전송';
            btn.onclick = sendMessage;
        }
    }

    function loadMessages(messages, memberId) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        container.innerHTML = '';
        if (!messages || messages.length === 0) {
            showWelcome(memberId);
            return;
        }
        messages.forEach(m => {
            appendMessage(m.role, m.content, m.member_id || memberId);
        });
    }

    function showWelcome(memberId) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        const member = Members.getMember(memberId || Members.getCurrentMemberId());
        if (!member) return;
        container.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-emoji">${member.emoji}</div>
                <h2>${member.name}와 대화하기</h2>
                <p>${member.position}</p>
                <p class="welcome-hint">아래에 메시지를 입력하여 대화를 시작하세요!</p>
            </div>`;
    }

    function clearChat() {
        const container = document.getElementById('chat-messages');
        if (container) container.innerHTML = '';
    }

    function scrollToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) {
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
        }
    }

    function copyMessage(btn) {
        const bubble = btn.closest('.message-bubble');
        const textEl = bubble.querySelector('.message-text');
        if (textEl) {
            navigator.clipboard.writeText(textEl.innerText).then(() => {
                btn.textContent = '✅';
                setTimeout(() => { btn.textContent = '📋'; }, 1500);
            });
        }
    }

    function autoResizeInput() {
        const input = document.getElementById('chat-input');
        if (!input) return;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 150) + 'px';
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    async function autoSpeak(msgDiv) {
        try {
            const config = await API.getConfig();
            if (!config.preferences?.tts_enabled) return;
        } catch (e) { return; }
        if (!msgDiv) return;
        const ttsBtn = msgDiv.querySelector('.btn-tts');
        if (ttsBtn) Voice.speak(ttsBtn);
    }

    function getIsStreaming() {
        return isStreaming;
    }

    return {
        sendMessage, stopGeneration, loadMessages, showWelcome,
        clearChat, appendMessage, copyMessage, autoResizeInput,
        getIsStreaming,
    };
})();
