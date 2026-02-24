// Backend API communication
const API = (() => {
    const BASE = '';

    async function fetchJSON(url, options = {}) {
        const resp = await fetch(BASE + url, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        const data = await resp.json();
        if (!resp.ok) {
            throw new Error(data.error || `HTTP ${resp.status}`);
        }
        return data;
    }

    // ── Providers ──

    function getProvidersStatus() {
        return fetchJSON('/api/providers/status');
    }

    // ── File Upload ──

    async function uploadFiles(conversationId, files) {
        const formData = new FormData();
        formData.append('conversation_id', conversationId);
        for (const file of files) {
            formData.append('files', file);
        }
        const resp = await fetch(BASE + '/api/upload', {
            method: 'POST',
            body: formData,
        });
        const data = await resp.json();
        if (!resp.ok) {
            throw new Error(data.error || `HTTP ${resp.status}`);
        }
        return data;
    }

    // ── Chat (SSE via XHR) ──

    function chatStream({ conversationId, message, provider, model, attachments, onToken, onDone, onError }) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', BASE + '/api/chat');
        xhr.setRequestHeader('Content-Type', 'application/json');

        let lastIndex = 0;
        let partialLine = '';
        let doneFired = false;

        function processLines(text) {
            const combined = partialLine + text;
            const lines = combined.split('\n');
            // Last element may be incomplete — save for next chunk
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
                } catch (e) {
                    // ignore parse errors
                }
            }
        }

        xhr.onprogress = () => {
            const text = xhr.responseText.substring(lastIndex);
            lastIndex = xhr.responseText.length;
            processLines(text);
        };

        xhr.onerror = () => { doneFired = true; onError('Network error'); };
        xhr.onloadend = () => {
            // Process any remaining partial line
            if (partialLine) {
                processLines('\n');
            }
            // Ensure onDone fires even if we missed it in parsing
            if (!doneFired) {
                onDone({ provider, model });
            }
        };

        xhr.send(JSON.stringify({
            conversation_id: conversationId,
            message,
            provider,
            model: model || undefined,
            attachments: attachments || undefined,
        }));

        return xhr; // Return so we can abort
    }

    function chatMultiStream({ conversationId, message, attachments, onProvidersInfo, onToken, onProviderDone, onAllDone, onError }) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', BASE + '/api/chat/multi');
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
                    if (data.providers_info) {
                        onProvidersInfo(data.providers_info);
                    } else if (data.token && data.provider) {
                        onToken(data.provider, data.token);
                    } else if (data.provider_done && data.provider) {
                        onProviderDone(data.provider);
                    } else if (data.all_done) {
                        doneFired = true;
                        onAllDone(data);
                    } else if (data.error && data.provider) {
                        onToken(data.provider, `\n\n[Error: ${data.error}]`);
                    }
                } catch (e) {
                    // ignore parse errors
                }
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
            if (!doneFired) onAllDone({});
        };

        xhr.send(JSON.stringify({
            conversation_id: conversationId,
            message,
            attachments: attachments || undefined,
        }));

        return xhr;
    }

    function chatSmartStream({ conversationId, message, attachments, onGathering, onGatherToken, onGatherDone, onSynthesizing, onSynthToken, onComplete, onError }) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', BASE + '/api/chat/smart');
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
                    if (data.phase === 'gathering') {
                        if (data.providers_info) {
                            onGathering(data.providers_info);
                        } else if (data.token && data.provider) {
                            onGatherToken(data.provider, data.token);
                        } else if (data.provider_done && data.provider) {
                            onGatherDone(data.provider);
                        } else if (data.error && data.provider) {
                            onGatherToken(data.provider, `\n\n[Error: ${data.error}]`);
                        }
                    } else if (data.phase === 'synthesizing') {
                        if (data.token) {
                            onSynthToken(data.token);
                        } else if (data.error) {
                            onError(data.error);
                        } else {
                            onSynthesizing();
                        }
                    } else if (data.phase === 'complete') {
                        doneFired = true;
                        onComplete(data);
                    }
                } catch (e) {
                    // ignore parse errors
                }
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
            if (!doneFired) onComplete({});
        };

        xhr.send(JSON.stringify({
            conversation_id: conversationId,
            message,
            attachments: attachments || undefined,
        }));

        return xhr;
    }

    function stopChat(conversationId) {
        return fetchJSON('/api/chat/stop', {
            method: 'POST',
            body: JSON.stringify({ conversation_id: conversationId }),
        });
    }

    // ── Conversations ──

    function listConversations() {
        return fetchJSON('/api/conversations');
    }

    function createConversation(title) {
        return fetchJSON('/api/conversations', {
            method: 'POST',
            body: JSON.stringify({ title }),
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
        return fetchJSON('/api/conversations/' + id, {
            method: 'DELETE',
        });
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
        getProvidersStatus,
        uploadFiles,
        chatStream, chatMultiStream, chatSmartStream, stopChat,
        listConversations, createConversation, getConversation,
        updateConversation, deleteConversation,
        getConfig, saveKeys, savePreferences,
    };
})();
