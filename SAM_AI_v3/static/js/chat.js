// Chat UI + streaming logic
const Chat = (() => {
    const messagesEl = () => document.getElementById('chat-messages');
    const welcomeEl = () => document.getElementById('welcome-message');
    const inputEl = () => document.getElementById('chat-input');
    const sendBtn = () => document.getElementById('btn-send');
    const stopBtn = () => document.getElementById('btn-stop');
    const attachBtn = () => document.getElementById('btn-attach');
    const fileInput = () => document.getElementById('file-input');
    const filePreviewEl = () => document.getElementById('file-preview');

    const PROVIDER_COLORS = {
        claude: '#e07634',
        openai: '#10a37f',
        gemini: '#4285f4',
        ollama: '#888',
    };

    const PROVIDER_NAMES = {
        claude: 'Claude',
        openai: 'GPT',
        gemini: 'Gemini',
        ollama: 'Ollama',
    };

    let currentXHR = null;
    let isStreaming = false;
    let isMultiStreaming = false;
    let isSmartStreaming = false;
    let multiSpans = {};  // provider -> textSpan
    let smartSynthSpan = null;

    // ──────── File attachment state ────────
    let pendingFiles = [];

    function addPendingFiles(files) {
        for (const file of files) {
            if (pendingFiles.length >= 10) break;  // max 10 files
            pendingFiles.push(file);
        }
        renderFilePreview();
    }

    function removePendingFile(index) {
        pendingFiles.splice(index, 1);
        renderFilePreview();
    }

    function clearPendingFiles() {
        pendingFiles = [];
        renderFilePreview();
    }

    function renderFilePreview() {
        const preview = filePreviewEl();
        if (!preview) return;

        if (pendingFiles.length === 0) {
            preview.classList.add('hidden');
            preview.innerHTML = '';
            return;
        }

        preview.classList.remove('hidden');
        preview.innerHTML = '';

        pendingFiles.forEach((file, idx) => {
            const item = document.createElement('div');
            item.className = 'file-preview-item';

            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.className = 'file-preview-thumb';
                img.src = URL.createObjectURL(file);
                img.onload = () => URL.revokeObjectURL(img.src);
                item.appendChild(img);
            } else {
                const icon = document.createElement('div');
                icon.className = 'file-preview-icon';
                const ext = file.name.split('.').pop().toUpperCase();
                icon.textContent = ext;
                item.appendChild(icon);
            }

            const name = document.createElement('span');
            name.className = 'file-preview-name';
            name.textContent = file.name;
            name.title = file.name;
            item.appendChild(name);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'file-preview-remove';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove';
            removeBtn.addEventListener('click', () => removePendingFile(idx));
            item.appendChild(removeBtn);

            preview.appendChild(item);
        });
    }

    // ──────── Render attachments in messages ────────

    function renderAttachments(attachments, container) {
        if (!attachments || attachments.length === 0) return;

        const attDiv = document.createElement('div');
        attDiv.className = 'message-attachments';

        for (const att of attachments) {
            if (att.file_type === 'image') {
                const img = document.createElement('img');
                img.className = 'message-attachment-image';
                img.src = `/api/uploads/${att.conv_id}/${att.stored_name}`;
                img.alt = att.original_name;
                img.title = att.original_name;
                img.loading = 'lazy';
                attDiv.appendChild(img);
            } else {
                const badge = document.createElement('div');
                badge.className = 'message-attachment-doc';
                const ext = att.original_name.split('.').pop().toUpperCase();
                badge.innerHTML = `<span class="doc-ext">${ext}</span><span class="doc-name">${att.original_name}</span>`;
                attDiv.appendChild(badge);
            }
        }

        container.appendChild(attDiv);
    }

    // ──────── Messages ────────

    function clear() {
        const el = messagesEl();
        el.innerHTML = '';
        const w = welcomeEl();
        if (w) el.appendChild(w);
        showWelcome(true);
    }

    function showWelcome(show) {
        const w = document.getElementById('welcome-message');
        if (w) w.classList.toggle('hidden', !show);
    }

    function addMessage(role, content, meta = {}) {
        showWelcome(false);
        const el = messagesEl();
        const div = document.createElement('div');
        div.className = `message ${role}`;

        // Show attachments for user messages
        if (role === 'user' && meta.attachments) {
            renderAttachments(meta.attachments, div);
        }

        if (role === 'assistant') {
            div.innerHTML = MD.render(content);
            MD.addCopyButtons(div);
        } else {
            const textNode = document.createElement('div');
            textNode.textContent = content;
            div.appendChild(textNode);
        }

        if (meta.provider || meta.model) {
            const metaDiv = document.createElement('div');
            metaDiv.className = 'message-meta';
            if (meta.provider) {
                const badge = document.createElement('span');
                badge.className = 'message-badge';
                badge.textContent = meta.provider + (meta.model ? ' / ' + meta.model : '');
                metaDiv.appendChild(badge);
            }
            div.appendChild(metaDiv);
        }

        el.appendChild(div);
        scrollToBottom();
        return div;
    }

    // ──────── Multi-provider: render saved responses ────────

    function addMultiMessage(responses) {
        showWelcome(false);
        const el = messagesEl();
        const wrapper = document.createElement('div');
        wrapper.className = 'multi-response';

        const grid = document.createElement('div');
        grid.className = 'multi-grid';

        for (const resp of responses) {
            const card = document.createElement('div');
            card.className = 'multi-card';

            const header = document.createElement('div');
            header.className = 'multi-card-header';
            header.style.borderColor = PROVIDER_COLORS[resp.provider] || '#888';
            header.textContent = (resp.provider || '').charAt(0).toUpperCase() + (resp.provider || '').slice(1)
                + (resp.model ? ' / ' + resp.model : '');
            card.appendChild(header);

            const body = document.createElement('div');
            body.className = 'multi-card-body';
            body.innerHTML = MD.render(resp.content || '');
            MD.addCopyButtons(body);
            card.appendChild(body);

            grid.appendChild(card);
        }

        wrapper.appendChild(grid);
        el.appendChild(wrapper);
        scrollToBottom();
    }

    // ──────── Multi-provider: streaming ────────

    function createMultiStreamContainer(providersInfo) {
        showWelcome(false);
        const el = messagesEl();
        const wrapper = document.createElement('div');
        wrapper.className = 'multi-response';
        wrapper.id = 'multi-streaming';

        const grid = document.createElement('div');
        grid.className = 'multi-grid';

        const spans = {};
        for (const info of providersInfo) {
            const card = document.createElement('div');
            card.className = 'multi-card';
            card.id = `multi-card-${info.provider}`;

            const header = document.createElement('div');
            header.className = 'multi-card-header';
            header.style.borderColor = PROVIDER_COLORS[info.provider] || '#888';
            header.textContent = (info.display || info.provider)
                + (info.model ? ' / ' + info.model : '');
            card.appendChild(header);

            const body = document.createElement('div');
            body.className = 'multi-card-body';
            const textSpan = document.createElement('span');
            textSpan.className = 'streaming-text streaming-cursor';
            body.appendChild(textSpan);
            card.appendChild(body);

            grid.appendChild(card);
            spans[info.provider] = textSpan;
        }

        wrapper.appendChild(grid);
        el.appendChild(wrapper);
        scrollToBottom();
        return spans;
    }

    function appendMultiToken(spans, provider, token) {
        const span = spans[provider];
        if (span) {
            span.textContent += token;
            scrollToBottom();
        }
    }

    function finalizeMultiProvider(spans, provider) {
        const span = spans[provider];
        if (!span) return;
        span.classList.remove('streaming-cursor');
        const body = span.parentElement;
        const fullText = span.textContent;
        body.innerHTML = MD.render(fullText);
        MD.addCopyButtons(body);
        scrollToBottom();
    }

    function finalizeMultiStream() {
        const wrapper = document.getElementById('multi-streaming');
        if (wrapper) wrapper.removeAttribute('id');
        isMultiStreaming = false;
        multiSpans = {};
    }

    // ──────── Smart Mode: UI ────────

    function createSmartGatheringUI(providersInfo) {
        showWelcome(false);
        const el = messagesEl();

        // Wrapper for entire smart response
        const wrapper = document.createElement('div');
        wrapper.className = 'smart-response';
        wrapper.id = 'smart-streaming';

        // Gathering phase UI
        const gatherDiv = document.createElement('div');
        gatherDiv.className = 'smart-gathering';
        gatherDiv.id = 'smart-gathering';

        const gatherTitle = document.createElement('div');
        gatherTitle.className = 'smart-gathering-title';
        gatherTitle.textContent = 'Gathering responses...';
        gatherDiv.appendChild(gatherTitle);

        for (const info of providersInfo) {
            const row = document.createElement('div');
            row.className = 'smart-provider-status';
            row.id = `smart-status-${info.provider}`;

            const dot = document.createElement('span');
            dot.className = 'smart-provider-dot';
            dot.style.background = PROVIDER_COLORS[info.provider] || '#888';
            row.appendChild(dot);

            const name = document.createElement('span');
            name.className = 'smart-provider-name';
            name.textContent = info.display || info.provider;
            row.appendChild(name);

            const spinner = document.createElement('span');
            spinner.className = 'smart-spinner';
            spinner.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';
            row.appendChild(spinner);

            gatherDiv.appendChild(row);
        }

        wrapper.appendChild(gatherDiv);
        el.appendChild(wrapper);
        scrollToBottom();
    }

    function updateGatherStatus(provider, status) {
        const row = document.getElementById(`smart-status-${provider}`);
        if (!row) return;

        const spinner = row.querySelector('.smart-spinner');
        if (spinner) {
            if (status === 'done') {
                spinner.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ecdc4" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
                spinner.classList.add('smart-done');
            }
        }
    }

    function startSynthesisUI() {
        // Update gathering title
        const gatherTitle = document.querySelector('.smart-gathering-title');
        if (gatherTitle) gatherTitle.textContent = 'All responses collected';

        // Collapse gathering section
        const gatherDiv = document.getElementById('smart-gathering');
        if (gatherDiv) gatherDiv.classList.add('smart-gathering-collapsed');

        // Add synthesis streaming bubble
        const wrapper = document.getElementById('smart-streaming');
        if (!wrapper) return null;

        const synthDiv = document.createElement('div');
        synthDiv.className = 'message assistant smart-synthesis';
        synthDiv.id = 'smart-synthesis';

        const label = document.createElement('div');
        label.className = 'smart-synthesis-label';
        label.textContent = 'Smart Synthesis';
        synthDiv.appendChild(label);

        const textSpan = document.createElement('span');
        textSpan.className = 'streaming-text streaming-cursor';
        synthDiv.appendChild(textSpan);

        wrapper.appendChild(synthDiv);
        scrollToBottom();
        return textSpan;
    }

    function showContributions(contributions) {
        const wrapper = document.getElementById('smart-streaming');
        if (!wrapper) return;

        const barDiv = document.createElement('div');
        barDiv.className = 'contribution-section';

        // Stacked bar
        const stackedBar = document.createElement('div');
        stackedBar.className = 'contribution-stacked-bar';

        for (const c of contributions) {
            if (c.percent <= 0) continue;
            const seg = document.createElement('div');
            seg.className = 'contribution-segment';
            seg.style.width = c.percent + '%';
            seg.style.background = PROVIDER_COLORS[c.provider] || '#888';
            seg.title = `${PROVIDER_NAMES[c.provider] || c.provider}: ${c.percent}%`;
            stackedBar.appendChild(seg);
        }
        barDiv.appendChild(stackedBar);

        // Legend
        const legend = document.createElement('div');
        legend.className = 'contribution-legend';

        for (const c of contributions) {
            if (c.percent <= 0) continue;
            const item = document.createElement('div');
            item.className = 'contribution-item';

            const dot = document.createElement('span');
            dot.className = 'contribution-dot';
            dot.style.background = PROVIDER_COLORS[c.provider] || '#888';
            item.appendChild(dot);

            const label = document.createElement('span');
            label.textContent = `${PROVIDER_NAMES[c.provider] || c.provider} ${c.percent}%`;
            item.appendChild(label);

            legend.appendChild(item);
        }
        barDiv.appendChild(legend);

        wrapper.appendChild(barDiv);
        scrollToBottom();
    }

    function addRawResponsesToggle(rawResponses) {
        const wrapper = document.getElementById('smart-streaming');
        if (!wrapper) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'raw-responses-toggle';
        toggleBtn.textContent = 'Show original responses';
        wrapper.appendChild(toggleBtn);

        const rawDiv = document.createElement('div');
        rawDiv.className = 'raw-responses hidden';

        for (const resp of rawResponses) {
            const card = document.createElement('div');
            card.className = 'raw-response-card';

            const header = document.createElement('div');
            header.className = 'raw-response-header';
            header.style.borderColor = PROVIDER_COLORS[resp.provider] || '#888';
            header.textContent = PROVIDER_NAMES[resp.provider] || resp.provider;
            card.appendChild(header);

            const body = document.createElement('div');
            body.className = 'raw-response-body';
            body.innerHTML = MD.render(resp.content || '');
            MD.addCopyButtons(body);
            card.appendChild(body);

            rawDiv.appendChild(card);
        }

        wrapper.appendChild(rawDiv);

        toggleBtn.addEventListener('click', () => {
            const isHidden = rawDiv.classList.contains('hidden');
            rawDiv.classList.toggle('hidden');
            toggleBtn.textContent = isHidden ? 'Hide original responses' : 'Show original responses';
        });

        scrollToBottom();
    }

    function finalizeSmartStream(synthSpan, contributions, rawResponses) {
        // Finalize synthesis text
        if (synthSpan) {
            synthSpan.classList.remove('streaming-cursor');
            const div = synthSpan.parentElement;
            const fullText = synthSpan.textContent;

            // Keep the label
            const label = div.querySelector('.smart-synthesis-label');
            div.innerHTML = '';
            if (label) div.appendChild(label);

            const rendered = document.createElement('div');
            rendered.innerHTML = MD.render(fullText);
            MD.addCopyButtons(rendered);
            div.appendChild(rendered);

            div.removeAttribute('id');
        }

        // Show contributions bar
        if (contributions && contributions.length > 0) {
            showContributions(contributions);
        }

        // Add raw responses toggle
        if (rawResponses && rawResponses.length > 0) {
            addRawResponsesToggle(rawResponses);
        }

        // Clean up
        const wrapper = document.getElementById('smart-streaming');
        if (wrapper) wrapper.removeAttribute('id');
        isSmartStreaming = false;
        smartSynthSpan = null;

        scrollToBottom();
    }

    // ──────── Smart Mode: render saved message ────────

    function addSmartMessage(msg) {
        showWelcome(false);
        const el = messagesEl();

        const wrapper = document.createElement('div');
        wrapper.className = 'smart-response';

        // Synthesis content
        const synthDiv = document.createElement('div');
        synthDiv.className = 'message assistant smart-synthesis';

        const label = document.createElement('div');
        label.className = 'smart-synthesis-label';
        label.textContent = 'Smart Synthesis';
        synthDiv.appendChild(label);

        const bodyDiv = document.createElement('div');
        bodyDiv.innerHTML = MD.render(msg.synthesized || '');
        MD.addCopyButtons(bodyDiv);
        synthDiv.appendChild(bodyDiv);

        wrapper.appendChild(synthDiv);

        // Contributions bar
        if (msg.contributions && msg.contributions.length > 0) {
            const barDiv = document.createElement('div');
            barDiv.className = 'contribution-section';

            const stackedBar = document.createElement('div');
            stackedBar.className = 'contribution-stacked-bar';

            for (const c of msg.contributions) {
                if (c.percent <= 0) continue;
                const seg = document.createElement('div');
                seg.className = 'contribution-segment';
                seg.style.width = c.percent + '%';
                seg.style.background = PROVIDER_COLORS[c.provider] || '#888';
                seg.title = `${PROVIDER_NAMES[c.provider] || c.provider}: ${c.percent}%`;
                stackedBar.appendChild(seg);
            }
            barDiv.appendChild(stackedBar);

            const legend = document.createElement('div');
            legend.className = 'contribution-legend';
            for (const c of msg.contributions) {
                if (c.percent <= 0) continue;
                const item = document.createElement('div');
                item.className = 'contribution-item';
                const dot = document.createElement('span');
                dot.className = 'contribution-dot';
                dot.style.background = PROVIDER_COLORS[c.provider] || '#888';
                item.appendChild(dot);
                const lbl = document.createElement('span');
                lbl.textContent = `${PROVIDER_NAMES[c.provider] || c.provider} ${c.percent}%`;
                item.appendChild(lbl);
                legend.appendChild(item);
            }
            barDiv.appendChild(legend);
            wrapper.appendChild(barDiv);
        }

        // Raw responses toggle
        if (msg.raw_responses && msg.raw_responses.length > 0) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'raw-responses-toggle';
            toggleBtn.textContent = 'Show original responses';
            wrapper.appendChild(toggleBtn);

            const rawDiv = document.createElement('div');
            rawDiv.className = 'raw-responses hidden';

            for (const resp of msg.raw_responses) {
                const card = document.createElement('div');
                card.className = 'raw-response-card';
                const header = document.createElement('div');
                header.className = 'raw-response-header';
                header.style.borderColor = PROVIDER_COLORS[resp.provider] || '#888';
                header.textContent = PROVIDER_NAMES[resp.provider] || resp.provider;
                card.appendChild(header);
                const body = document.createElement('div');
                body.className = 'raw-response-body';
                body.innerHTML = MD.render(resp.content || '');
                MD.addCopyButtons(body);
                card.appendChild(body);
                rawDiv.appendChild(card);
            }

            wrapper.appendChild(rawDiv);

            toggleBtn.addEventListener('click', () => {
                const isHidden = rawDiv.classList.contains('hidden');
                rawDiv.classList.toggle('hidden');
                toggleBtn.textContent = isHidden ? 'Hide original responses' : 'Show original responses';
            });
        }

        el.appendChild(wrapper);
        scrollToBottom();
    }

    // ──────── Single-provider streaming ────────

    function createStreamBubble() {
        showWelcome(false);
        const el = messagesEl();
        const div = document.createElement('div');
        div.className = 'message assistant';
        div.id = 'streaming-message';

        const textSpan = document.createElement('span');
        textSpan.className = 'streaming-text streaming-cursor';
        div.appendChild(textSpan);

        el.appendChild(div);
        scrollToBottom();
        return textSpan;
    }

    function appendToken(textSpan, token) {
        textSpan.textContent += token;
        scrollToBottom();
    }

    function finalizeStream(textSpan, meta = {}) {
        textSpan.classList.remove('streaming-cursor');
        const div = textSpan.parentElement;
        const fullText = textSpan.textContent;

        // Replace raw text with rendered markdown
        div.innerHTML = MD.render(fullText);
        MD.addCopyButtons(div);

        if (meta.provider || meta.model) {
            const metaDiv = document.createElement('div');
            metaDiv.className = 'message-meta';
            const badge = document.createElement('span');
            badge.className = 'message-badge';
            badge.textContent = (meta.provider || '') + (meta.model ? ' / ' + meta.model : '');
            metaDiv.appendChild(badge);
            div.appendChild(metaDiv);
        }

        div.removeAttribute('id');
        scrollToBottom();
    }

    function scrollToBottom() {
        const el = messagesEl();
        el.scrollTop = el.scrollHeight;
    }

    // ──────── Render conversation ────────

    function renderConversation(conv) {
        clear();
        if (!conv || !conv.messages || conv.messages.length === 0) return;

        for (const msg of conv.messages) {
            if (msg.smart_mode && msg.synthesized) {
                addSmartMessage(msg);
            } else if (msg.multi_provider && msg.responses) {
                addMultiMessage(msg.responses);
            } else {
                addMessage(msg.role, msg.content, {
                    provider: msg.provider,
                    model: msg.model,
                    attachments: msg.attachments,
                });
            }
        }
    }

    // ──────── Send message ────────

    async function sendMessage() {
        const input = inputEl();
        const text = input.value.trim();
        if ((!text && pendingFiles.length === 0) || isStreaming) return;

        const convId = App.getCurrentConversationId();
        if (!convId) {
            // Create new conversation first
            const conv = await API.createConversation();
            App.setCurrentConversation(conv.id);
        }

        const activeConvId = App.getCurrentConversationId();
        const mode = document.getElementById('mode-select').value;
        const provider = document.getElementById('provider-select').value;
        const model = document.getElementById('model-select').value || undefined;

        // Upload files if any
        let attachments = undefined;
        const filesToUpload = [...pendingFiles];
        if (filesToUpload.length > 0) {
            try {
                const result = await API.uploadFiles(activeConvId, filesToUpload);
                attachments = result.files.filter(f => !f.error);
                if (attachments.length === 0) attachments = undefined;
            } catch (e) {
                console.error('Upload failed:', e);
            }
        }

        // Add user message to UI
        addMessage('user', text || '(attached files)', { attachments });
        input.value = '';
        autoResize(input);
        clearPendingFiles();

        // Show streaming state
        setStreaming(true);

        // Use text or a placeholder if only files
        const messageText = text || 'Please analyze the attached file(s).';

        if (mode === 'smart') {
            // ── Smart mode ──
            isSmartStreaming = true;
            let gatherRawResponses = [];  // Store raw for toggle

            currentXHR = API.chatSmartStream({
                conversationId: activeConvId,
                message: messageText,
                attachments,
                onGathering: (providersInfo) => {
                    createSmartGatheringUI(providersInfo);
                    // Pre-initialize raw responses tracking
                    gatherRawResponses = providersInfo.map(p => ({
                        provider: p.provider, model: p.model, content: ''
                    }));
                },
                onGatherToken: (prov, token) => {
                    // Track raw content for toggle
                    const r = gatherRawResponses.find(x => x.provider === prov);
                    if (r) r.content += token;
                },
                onGatherDone: (prov) => {
                    updateGatherStatus(prov, 'done');
                },
                onSynthesizing: () => {
                    smartSynthSpan = startSynthesisUI();
                },
                onSynthToken: (token) => {
                    if (smartSynthSpan) {
                        appendToken(smartSynthSpan, token);
                    }
                },
                onComplete: (data) => {
                    finalizeSmartStream(
                        smartSynthSpan,
                        data.contributions || [],
                        gatherRawResponses
                    );
                    setStreaming(false);
                    currentXHR = null;
                },
                onError: (err) => {
                    if (smartSynthSpan) {
                        appendToken(smartSynthSpan, `\n\n[Error: ${err}]`);
                    }
                    finalizeSmartStream(smartSynthSpan, [], gatherRawResponses);
                    setStreaming(false);
                    currentXHR = null;
                },
            });

        } else if (mode === 'compare') {
            // ── Compare mode (was multi) ──
            isMultiStreaming = true;
            currentXHR = API.chatMultiStream({
                conversationId: activeConvId,
                message: messageText,
                attachments,
                onProvidersInfo: (info) => {
                    multiSpans = createMultiStreamContainer(info);
                },
                onToken: (prov, token) => {
                    appendMultiToken(multiSpans, prov, token);
                },
                onProviderDone: (prov) => {
                    finalizeMultiProvider(multiSpans, prov);
                },
                onAllDone: () => {
                    finalizeMultiStream();
                    setStreaming(false);
                    currentXHR = null;
                },
                onError: (err) => {
                    finalizeMultiStream();
                    setStreaming(false);
                    currentXHR = null;
                },
            });
        } else {
            // ── Single-provider mode ──
            const textSpan = createStreamBubble();
            currentXHR = API.chatStream({
                conversationId: activeConvId,
                message: messageText,
                provider,
                model,
                attachments,
                onToken: (token) => {
                    appendToken(textSpan, token);
                },
                onDone: (data) => {
                    finalizeStream(textSpan, { provider: data.provider, model: data.model });
                    setStreaming(false);
                    currentXHR = null;
                },
                onError: (err) => {
                    appendToken(textSpan, `\n\n[Error: ${err}]`);
                    finalizeStream(textSpan);
                    setStreaming(false);
                    currentXHR = null;
                },
            });
        }
    }

    // ──────── Stop generation ────────

    function stopGeneration() {
        const convId = App.getCurrentConversationId();
        if (convId) {
            API.stopChat(convId);
        }
        if (currentXHR) {
            currentXHR.abort();
            currentXHR = null;
        }

        if (isSmartStreaming) {
            finalizeSmartStream(smartSynthSpan, [], []);
        } else if (isMultiStreaming) {
            // Finalize all multi-provider cards
            for (const prov of Object.keys(multiSpans)) {
                finalizeMultiProvider(multiSpans, prov);
            }
            finalizeMultiStream();
        } else {
            // Finalize single stream bubble
            const textSpan = document.querySelector('#streaming-message .streaming-text');
            if (textSpan) {
                finalizeStream(textSpan);
            }
        }
        setStreaming(false);
    }

    function setStreaming(streaming) {
        isStreaming = streaming;
        sendBtn().classList.toggle('hidden', streaming);
        stopBtn().classList.toggle('hidden', !streaming);
        inputEl().disabled = streaming;
    }

    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    function initInput() {
        const input = inputEl();
        input.addEventListener('input', () => autoResize(input));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        sendBtn().addEventListener('click', sendMessage);
        stopBtn().addEventListener('click', stopGeneration);

        // ── File attachment handlers ──
        const attach = attachBtn();
        const fInput = fileInput();

        if (attach && fInput) {
            attach.addEventListener('click', () => fInput.click());
            fInput.addEventListener('change', () => {
                if (fInput.files.length > 0) {
                    addPendingFiles(fInput.files);
                    fInput.value = '';  // reset so same file can be re-selected
                }
            });
        }

        // Drag & drop on chat area
        const chatArea = document.querySelector('.input-area');
        if (chatArea) {
            chatArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                chatArea.classList.add('drag-over');
            });
            chatArea.addEventListener('dragleave', () => {
                chatArea.classList.remove('drag-over');
            });
            chatArea.addEventListener('drop', (e) => {
                e.preventDefault();
                chatArea.classList.remove('drag-over');
                if (e.dataTransfer.files.length > 0) {
                    addPendingFiles(e.dataTransfer.files);
                }
            });
        }

        // Clipboard paste (images)
        input.addEventListener('paste', (e) => {
            const items = e.clipboardData && e.clipboardData.items;
            if (!items) return;
            const imageFiles = [];
            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) imageFiles.push(file);
                }
            }
            if (imageFiles.length > 0) {
                e.preventDefault();
                addPendingFiles(imageFiles);
            }
        });
    }

    return {
        clear, addMessage, addMultiMessage, addSmartMessage,
        renderConversation, sendMessage,
        stopGeneration, initInput, scrollToBottom,
    };
})();
