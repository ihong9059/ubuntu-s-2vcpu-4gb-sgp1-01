// SKZ AI - Backend API communication
const API = (() => {
    const BASE = '';

    async function fetchJSON(url, options = {}) {
        const resp = await fetch(BASE + url, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
        return data;
    }

    // ── Members ──
    function getMembers() {
        return fetchJSON('/api/members');
    }

    // ── Chat (SSE via XHR - iPad Safari compatible) ──
    function chatStream({ conversationId, message, memberId, onToken, onDone, onError }) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', BASE + '/api/chat');
        xhr.setRequestHeader('Content-Type', 'application/json');

        let lastIndex = 0;
        let partialLine = '';
        let doneFired = false;

        function processLines(text) {
            const combined = partialLine + text;
            const lines = combined.split('\n');
            partialLine = lines.pop() || '';

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const jsonStr = line.substring(6).trim();
                if (!jsonStr) continue;
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.token) {
                        onToken(data.token);
                    } else if (data.done) {
                        doneFired = true;
                        onDone(data);
                    } else if (data.error) {
                        doneFired = true;
                        onError(data.error);
                    }
                } catch (e) { /* ignore */ }
            }
        }

        xhr.onprogress = () => {
            const text = xhr.responseText.substring(lastIndex);
            lastIndex = xhr.responseText.length;
            processLines(text);
        };
        xhr.onerror = () => { doneFired = true; onError('Network error'); };
        xhr.onloadend = () => {
            if (partialLine) processLines('\n');
            if (!doneFired) onDone({});
        };

        xhr.send(JSON.stringify({
            conversation_id: conversationId,
            message,
            member_id: memberId,
        }));

        return xhr;
    }

    function stopChat(conversationId) {
        return fetchJSON('/api/chat/stop', {
            method: 'POST',
            body: JSON.stringify({ conversation_id: conversationId }),
        });
    }

    // ── TTS ──
    function getTTS(text, voice, memberId) {
        return fetchJSON('/api/tts', {
            method: 'POST',
            body: JSON.stringify({ text, voice, member_id: memberId }),
        });
    }

    // ── News ──
    function getNews() {
        return fetchJSON('/api/news');
    }

    // ── Conversations ──
    function listConversations() {
        return fetchJSON('/api/conversations');
    }

    function createConversation(memberId) {
        return fetchJSON('/api/conversations', {
            method: 'POST',
            body: JSON.stringify({ member_id: memberId }),
        });
    }

    function getConversation(id) {
        return fetchJSON('/api/conversations/' + id);
    }

    function updateConversation(id, data) {
        return fetchJSON('/api/conversations/' + id, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    function deleteConversation(id) {
        return fetchJSON('/api/conversations/' + id, { method: 'DELETE' });
    }

    // ── Config ──
    function getConfig() {
        return fetchJSON('/api/config');
    }

    function saveKeys(keys) {
        return fetchJSON('/api/config/keys', {
            method: 'POST',
            body: JSON.stringify(keys),
        });
    }

    function savePreferences(prefs) {
        return fetchJSON('/api/config/preferences', {
            method: 'POST',
            body: JSON.stringify(prefs),
        });
    }

    return {
        getMembers,
        chatStream, stopChat,
        getTTS,
        getNews,
        listConversations, createConversation, getConversation,
        updateConversation, deleteConversation,
        getConfig, saveKeys, savePreferences,
    };
})();
