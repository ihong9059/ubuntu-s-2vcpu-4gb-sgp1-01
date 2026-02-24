import json
import queue
import threading
import time

import os
from flask import Flask, render_template, request, Response, jsonify, stream_with_context, send_from_directory
from flask_cors import CORS

from config import HOST, PORT, SSE_KEEPALIVE_INTERVAL, DEFAULT_MODELS, PROVIDER_DISPLAY_NAMES, SYNTHESIZER_PROMPT, UPLOADS_DIR
from services import config_manager, conversation_manager, ai_dispatcher, file_service

app = Flask(__name__)
CORS(app)

# Track active generation threads for stop functionality
_active_streams = {}  # conv_id -> threading.Event (set = stop requested)


@app.route('/')
def index():
    resp = Response(render_template('index.html'), mimetype='text/html')
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp


@app.route('/guide')
def guide():
    resp = Response(render_template('guide.html'), mimetype='text/html')
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return resp


@app.route('/architecture')
def architecture():
    resp = Response(render_template('architecture.html'), mimetype='text/html')
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return resp


@app.route('/api/clear-cache')
def clear_cache():
    return Response('''<!DOCTYPE html>
<html><head><title>Clear Cache</title></head>
<body style="background:#1a1a2e;color:#fff;font-family:sans-serif;text-align:center;padding:50px">
<h2>Clearing cache...</h2>
<p id="status">Working...</p>
<script>
async function clearAll() {
    const s = document.getElementById('status');
    try {
        // Unregister all service workers
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) { await r.unregister(); }
        s.textContent = 'Service workers removed: ' + regs.length;

        // Delete all caches
        const keys = await caches.keys();
        for (const k of keys) { await caches.delete(k); }
        s.textContent += '\\nCaches deleted: ' + keys.length;

        s.textContent += '\\nRedirecting...';
        setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch(e) {
        s.textContent = 'Error: ' + e.message;
    }
}
clearAll();
</script>
</body></html>''', mimetype='text/html', headers={
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
    })


# ──────────────────── Provider Status ────────────────────

@app.route('/api/providers/status')
def providers_status():
    return jsonify(ai_dispatcher.get_all_providers_status())


# ──────────────────── File Upload ────────────────────

@app.route('/api/upload', methods=['POST'])
def upload_files():
    conv_id = request.form.get('conversation_id')
    if not conv_id:
        return jsonify({'error': 'conversation_id required'}), 400

    conv = conversation_manager.get_conversation(conv_id)
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404

    files = request.files.getlist('files')
    if not files:
        return jsonify({'error': 'No files provided'}), 400

    results = []
    for f in files:
        try:
            meta = file_service.save_upload(conv_id, f)
            results.append(meta)
        except ValueError as e:
            results.append({'error': str(e), 'original_name': f.filename})

    return jsonify({'files': results})


@app.route('/api/uploads/<conv_id>/<filename>')
def serve_upload(conv_id, filename):
    upload_dir = os.path.join(UPLOADS_DIR, conv_id)
    return send_from_directory(upload_dir, filename)


# ──────────────────── Chat (SSE Streaming) ────────────────────

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body'}), 400

    conv_id = data.get('conversation_id')
    message = data.get('message', '').strip()
    provider_name = data.get('provider', 'ollama')
    model = data.get('model')
    attachments = data.get('attachments')

    if not conv_id or not message:
        return jsonify({'error': 'conversation_id and message required'}), 400

    # Get or create conversation
    conv = conversation_manager.get_conversation(conv_id)
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404

    # Save user message
    conversation_manager.add_message(conv_id, 'user', message, attachments=attachments)

    # Build messages for the AI (OpenAI format, multi-provider aware)
    conv = conversation_manager.get_conversation(conv_id)
    ai_messages = conversation_manager.get_ai_messages(conv)

    prefs = config_manager.get_preferences()
    system_prompt = prefs.get('system_prompt', '')

    # Stop event for this conversation
    stop_event = threading.Event()
    _active_streams[conv_id] = stop_event

    q = queue.Queue()

    def generate_in_thread():
        try:
            for token in ai_dispatcher.stream_chat(
                provider_name, ai_messages, model=model, system_prompt=system_prompt
            ):
                if stop_event.is_set():
                    break
                q.put(('token', token))
        except Exception as e:
            q.put(('error', str(e)))
        finally:
            q.put(('done', None))

    thread = threading.Thread(target=generate_in_thread, daemon=True)
    thread.start()

    def _save_response(full_response):
        """Save assistant response and auto-title if first exchange."""
        assistant_text = ''.join(full_response)
        if assistant_text:
            conversation_manager.add_message(
                conv_id, 'assistant', assistant_text,
                provider=provider_name, model=model
            )
            # Auto-title on first exchange
            conv = conversation_manager.get_conversation(conv_id)
            if conv and len([m for m in conv['messages'] if m['role'] == 'assistant']) == 1:
                title = message[:50] + ('...' if len(message) > 50 else '')
                conversation_manager.update_conversation(conv_id, title=title)

    def sse_stream():
        full_response = []
        last_keepalive = time.time()

        while True:
            try:
                msg_type, content = q.get(timeout=1)

                if msg_type == 'token':
                    full_response.append(content)
                    yield f'data: {json.dumps({"token": content})}\n\n'

                elif msg_type == 'error':
                    yield f'data: {json.dumps({"error": content})}\n\n'
                    break

                elif msg_type == 'done':
                    _save_response(full_response)
                    yield f'data: {json.dumps({"done": True, "provider": provider_name, "model": model})}\n\n'
                    break

            except queue.Empty:
                # Check if stop was requested — save partial response
                if stop_event.is_set():
                    _save_response(full_response)
                    yield f'data: {json.dumps({"done": True, "stopped": True, "provider": provider_name, "model": model})}\n\n'
                    break
                # Send keepalive
                now = time.time()
                if now - last_keepalive >= SSE_KEEPALIVE_INTERVAL:
                    yield f': keepalive\n\n'
                    last_keepalive = now
                continue

        # Cleanup
        _active_streams.pop(conv_id, None)

    return Response(
        stream_with_context(sse_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive',
        }
    )


@app.route('/api/chat/multi', methods=['POST'])
def chat_multi():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body'}), 400

    conv_id = data.get('conversation_id')
    message = data.get('message', '').strip()
    attachments = data.get('attachments')

    if not conv_id or not message:
        return jsonify({'error': 'conversation_id and message required'}), 400

    conv = conversation_manager.get_conversation(conv_id)
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404

    # Save user message
    conversation_manager.add_message(conv_id, 'user', message, attachments=attachments)

    # Build AI message history
    conv = conversation_manager.get_conversation(conv_id)
    ai_messages = conversation_manager.get_ai_messages(conv)

    prefs = config_manager.get_preferences()
    system_prompt = prefs.get('system_prompt', '')

    # Get available providers (exclude Ollama when online providers exist)
    providers = ai_dispatcher.get_online_providers()
    if not providers:
        return jsonify({'error': 'No providers available'}), 503

    # Stop event for this conversation
    stop_event = threading.Event()
    _active_streams[conv_id] = stop_event

    q = queue.Queue()

    # Build provider info with display names and models
    providers_info = []
    for p in providers:
        model = DEFAULT_MODELS.get(p, '')
        display = PROVIDER_DISPLAY_NAMES.get(p, p)
        providers_info.append({'provider': p, 'model': model, 'display': display})

    # Launch one thread per provider
    def provider_thread(pname, pmodel):
        try:
            for token in ai_dispatcher.stream_chat(
                pname, ai_messages, model=pmodel, system_prompt=system_prompt
            ):
                if stop_event.is_set():
                    break
                q.put(('token', pname, token))
        except Exception as e:
            q.put(('error', pname, str(e)))
        finally:
            q.put(('provider_done', pname, None))

    threads = []
    for info in providers_info:
        t = threading.Thread(
            target=provider_thread,
            args=(info['provider'], info['model']),
            daemon=True,
        )
        threads.append(t)
        t.start()

    def _save_multi_response(buffers):
        """Save all provider responses as a multi-provider message."""
        responses = []
        for info in providers_info:
            p = info['provider']
            content = ''.join(buffers.get(p, []))
            if content:
                responses.append({
                    'provider': p,
                    'model': info['model'],
                    'content': content,
                })
        if responses:
            conversation_manager.add_multi_message(conv_id, responses)
            # Auto-title on first exchange
            conv = conversation_manager.get_conversation(conv_id)
            if conv and len([m for m in conv['messages'] if m['role'] == 'assistant']) == 1:
                title = message[:50] + ('...' if len(message) > 50 else '')
                conversation_manager.update_conversation(conv_id, title=title)

    def sse_stream():
        buffers = {info['provider']: [] for info in providers_info}
        done_count = 0
        total = len(providers_info)
        last_keepalive = time.time()

        # Send providers_info as first event
        yield f'data: {json.dumps({"providers_info": providers_info})}\n\n'

        while done_count < total:
            try:
                msg_type, provider, content = q.get(timeout=1)

                if msg_type == 'token':
                    buffers[provider].append(content)
                    yield f'data: {json.dumps({"provider": provider, "token": content})}\n\n'

                elif msg_type == 'error':
                    buffers[provider].append(f'\n\n[Error: {content}]')
                    yield f'data: {json.dumps({"provider": provider, "error": content})}\n\n'

                elif msg_type == 'provider_done':
                    done_count += 1
                    yield f'data: {json.dumps({"provider": provider, "provider_done": True})}\n\n'

            except queue.Empty:
                if stop_event.is_set():
                    _save_multi_response(buffers)
                    yield f'data: {json.dumps({"all_done": True, "stopped": True})}\n\n'
                    _active_streams.pop(conv_id, None)
                    return
                now = time.time()
                if now - last_keepalive >= SSE_KEEPALIVE_INTERVAL:
                    yield f': keepalive\n\n'
                    last_keepalive = now
                continue

        # All providers done
        _save_multi_response(buffers)
        yield f'data: {json.dumps({"all_done": True})}\n\n'
        _active_streams.pop(conv_id, None)

    return Response(
        stream_with_context(sse_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive',
        }
    )


# ──────────────────── Smart Mode (SSE 2-Phase) ────────────────────

@app.route('/api/chat/smart', methods=['POST'])
def chat_smart():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body'}), 400

    conv_id = data.get('conversation_id')
    message = data.get('message', '').strip()
    attachments = data.get('attachments')

    if not conv_id or not message:
        return jsonify({'error': 'conversation_id and message required'}), 400

    conv = conversation_manager.get_conversation(conv_id)
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404

    # Save user message
    conversation_manager.add_message(conv_id, 'user', message, attachments=attachments)

    # Build AI message history
    conv = conversation_manager.get_conversation(conv_id)
    ai_messages = conversation_manager.get_ai_messages(conv)

    prefs = config_manager.get_preferences()
    system_prompt = prefs.get('system_prompt', '')

    # Get online providers
    providers = ai_dispatcher.get_online_providers()
    if not providers:
        return jsonify({'error': 'No providers available'}), 503

    stop_event = threading.Event()
    _active_streams[conv_id] = stop_event

    gather_q = queue.Queue()

    # Build provider info
    providers_info = []
    for p in providers:
        model = DEFAULT_MODELS.get(p, '')
        display = PROVIDER_DISPLAY_NAMES.get(p, p)
        providers_info.append({'provider': p, 'model': model, 'display': display})

    # Phase 1: Gather responses from all providers in parallel
    def provider_thread(pname, pmodel):
        try:
            for token in ai_dispatcher.stream_chat(
                pname, ai_messages, model=pmodel, system_prompt=system_prompt
            ):
                if stop_event.is_set():
                    break
                gather_q.put(('token', pname, token))
        except Exception as e:
            gather_q.put(('error', pname, str(e)))
        finally:
            gather_q.put(('provider_done', pname, None))

    threads = []
    for info in providers_info:
        t = threading.Thread(
            target=provider_thread,
            args=(info['provider'], info['model']),
            daemon=True,
        )
        threads.append(t)
        t.start()

    def sse_stream():
        buffers = {info['provider']: [] for info in providers_info}
        errored = set()  # Track providers that errored
        done_count = 0
        total = len(providers_info)
        last_keepalive = time.time()

        # Send phase 1 start with providers info
        yield f'data: {json.dumps({"phase": "gathering", "providers_info": providers_info})}\n\n'

        # ── Phase 1: Gather ──
        while done_count < total:
            try:
                msg_type, provider, content = gather_q.get(timeout=1)

                if msg_type == 'token':
                    buffers[provider].append(content)
                    yield f'data: {json.dumps({"phase": "gathering", "provider": provider, "token": content})}\n\n'

                elif msg_type == 'error':
                    errored.add(provider)
                    yield f'data: {json.dumps({"phase": "gathering", "provider": provider, "error": content})}\n\n'

                elif msg_type == 'provider_done':
                    done_count += 1
                    yield f'data: {json.dumps({"phase": "gathering", "provider": provider, "provider_done": True})}\n\n'

            except queue.Empty:
                if stop_event.is_set():
                    _active_streams.pop(conv_id, None)
                    yield f'data: {json.dumps({"phase": "complete", "stopped": True})}\n\n'
                    return
                now = time.time()
                if now - last_keepalive >= SSE_KEEPALIVE_INTERVAL:
                    yield f': keepalive\n\n'
                    last_keepalive = now
                continue

        if stop_event.is_set():
            _active_streams.pop(conv_id, None)
            yield f'data: {json.dumps({"phase": "complete", "stopped": True})}\n\n'
            return

        # Build raw responses and calculate contributions (exclude errored providers)
        raw_responses = []
        contributions = []
        total_tokens = 0

        for info in providers_info:
            p = info['provider']
            content = ''.join(buffers.get(p, []))
            # Detect error responses yielded as text tokens
            if p in errored or not content.strip() or '[Error:' in content or 'Error:' in content[:20]:
                errored.add(p)
                continue
            token_count = len(content)
            total_tokens += token_count
            raw_responses.append({
                'provider': p,
                'model': info['model'],
                'content': content,
            })
            contributions.append({
                'provider': p,
                'model': info['model'],
                'tokens': token_count,
                'percent': 0,
            })

        # Calculate percentages
        if total_tokens > 0:
            for c in contributions:
                c['percent'] = round(c['tokens'] / total_tokens * 100)

        # If only one provider succeeded, use its response directly
        if len(raw_responses) <= 1:
            synth_text = raw_responses[0]['content'] if raw_responses else ''
            yield f'data: {json.dumps({"phase": "synthesizing"})}\n\n'
            yield f'data: {json.dumps({"phase": "synthesizing", "token": synth_text})}\n\n'

            if synth_text:
                conversation_manager.add_smart_message(
                    conv_id, synth_text, contributions, raw_responses
                )
                conv_now = conversation_manager.get_conversation(conv_id)
                if conv_now and len([m for m in conv_now['messages'] if m['role'] == 'assistant']) == 1:
                    title = message[:50] + ('...' if len(message) > 50 else '')
                    conversation_manager.update_conversation(conv_id, title=title)

            yield f'data: {json.dumps({"phase": "complete", "contributions": contributions})}\n\n'
            _active_streams.pop(conv_id, None)
            return

        # ── Phase 2: Synthesize ──
        yield f'data: {json.dumps({"phase": "synthesizing"})}\n\n'

        # Build synthesis prompt (only from successful responses)
        responses_block = ''
        for resp in raw_responses:
            display_name = PROVIDER_DISPLAY_NAMES.get(resp['provider'], resp['provider'])
            responses_block += f"[{display_name} 답변]:\n{resp['content']}\n\n"

        synth_prompt = SYNTHESIZER_PROMPT.format(
            user_message=message,
            responses_block=responses_block.strip(),
        )

        # Pick synthesizer AI (exclude errored providers)
        synth_provider = ai_dispatcher.get_synthesizer(exclude=errored)
        if not synth_provider:
            # Fallback: use raw responses concatenated
            synth_text = raw_responses[0]['content'] if raw_responses else ''
            yield f'data: {json.dumps({"phase": "synthesizing", "token": synth_text})}\n\n'
        else:
            synth_messages = [{'role': 'user', 'content': synth_prompt}]
            synth_model = DEFAULT_MODELS.get(synth_provider, '')

            synth_q = queue.Queue()

            def synth_thread():
                try:
                    for token in ai_dispatcher.stream_chat(
                        synth_provider, synth_messages, model=synth_model
                    ):
                        if stop_event.is_set():
                            break
                        synth_q.put(('token', token))
                except Exception as e:
                    synth_q.put(('error', str(e)))
                finally:
                    synth_q.put(('done', None))

            t = threading.Thread(target=synth_thread, daemon=True)
            t.start()

            synth_buffer = []
            while True:
                try:
                    msg_type, content = synth_q.get(timeout=1)

                    if msg_type == 'token':
                        synth_buffer.append(content)
                        yield f'data: {json.dumps({"phase": "synthesizing", "token": content})}\n\n'

                    elif msg_type == 'error':
                        yield f'data: {json.dumps({"phase": "synthesizing", "error": content})}\n\n'
                        break

                    elif msg_type == 'done':
                        break

                except queue.Empty:
                    if stop_event.is_set():
                        break
                    now = time.time()
                    if now - last_keepalive >= SSE_KEEPALIVE_INTERVAL:
                        yield f': keepalive\n\n'
                        last_keepalive = now
                    continue

            synth_text = ''.join(synth_buffer)

        # Save smart message
        if synth_text:
            conversation_manager.add_smart_message(
                conv_id, synth_text, contributions, raw_responses
            )
            # Auto-title on first exchange
            conv = conversation_manager.get_conversation(conv_id)
            if conv and len([m for m in conv['messages'] if m['role'] == 'assistant']) == 1:
                title = message[:50] + ('...' if len(message) > 50 else '')
                conversation_manager.update_conversation(conv_id, title=title)

        # Send complete event with contributions
        yield f'data: {json.dumps({"phase": "complete", "contributions": contributions})}\n\n'
        _active_streams.pop(conv_id, None)

    return Response(
        stream_with_context(sse_stream()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive',
        }
    )


@app.route('/api/chat/stop', methods=['POST'])
def chat_stop():
    data = request.get_json() or {}
    conv_id = data.get('conversation_id')
    if conv_id and conv_id in _active_streams:
        _active_streams[conv_id].set()
        return jsonify({'stopped': True})
    return jsonify({'stopped': False})


# ──────────────────── Conversations ────────────────────

@app.route('/api/conversations', methods=['GET'])
def list_convs():
    return jsonify(conversation_manager.list_conversations())


@app.route('/api/conversations', methods=['POST'])
def create_conv():
    data = request.get_json() or {}
    conv = conversation_manager.create_conversation(title=data.get('title'))
    return jsonify(conv), 201


@app.route('/api/conversations/<conv_id>', methods=['GET'])
def get_conv(conv_id):
    conv = conversation_manager.get_conversation(conv_id)
    if not conv:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(conv)


@app.route('/api/conversations/<conv_id>', methods=['PUT'])
def update_conv(conv_id):
    data = request.get_json() or {}
    conv = conversation_manager.update_conversation(conv_id, **data)
    if not conv:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(conv)


@app.route('/api/conversations/<conv_id>', methods=['DELETE'])
def delete_conv(conv_id):
    if conversation_manager.delete_conversation(conv_id):
        return jsonify({'deleted': True})
    return jsonify({'error': 'Not found'}), 404


# ──────────────────── Config ────────────────────

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify(config_manager.get_masked_config())


@app.route('/api/config/keys', methods=['POST'])
def save_keys():
    data = request.get_json() or {}
    config_manager.set_api_keys(data)
    return jsonify({'saved': True})


@app.route('/api/config/preferences', methods=['POST'])
def save_preferences():
    data = request.get_json() or {}
    config_manager.set_preferences(data)
    return jsonify({'saved': True})


if __name__ == '__main__':
    app.run(host=HOST, port=PORT, debug=True, threaded=True)
