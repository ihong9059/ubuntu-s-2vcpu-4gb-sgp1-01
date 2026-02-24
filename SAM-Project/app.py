"""SKZ AI - Stray Kids AI Chat"""
import json
import queue
import threading
import time
import os

from flask import Flask, render_template, request, Response, jsonify, stream_with_context, send_from_directory
from flask_cors import CORS

from config import HOST, PORT, TTS_CACHE_DIR
from services import config_manager, conversation_manager, gemini_service, tts_service, news_service
from services.member_data import get_all_members_summary, get_member, MEMBER_ORDER

app = Flask(__name__)
CORS(app)

SSE_KEEPALIVE_INTERVAL = 15

# Track active generation threads for stop functionality
_active_streams = {}  # conv_id -> threading.Event


@app.route('/')
def index():
    resp = Response(render_template('index.html'), mimetype='text/html')
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
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
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) { await r.unregister(); }
        const keys = await caches.keys();
        for (const k of keys) { await caches.delete(k); }
        s.textContent = 'Cache cleared! Redirecting...';
        setTimeout(() => { window.location.href = '/'; }, 1500);
    } catch(e) {
        s.textContent = 'Error: ' + e.message;
    }
}
clearAll();
</script>
</body></html>''', mimetype='text/html', headers={
        'Cache-Control': 'no-cache, no-store, must-revalidate',
    })


# ──────────────────── Members ────────────────────

@app.route('/api/members')
def list_members():
    return jsonify(get_all_members_summary())


# ──────────────────── Chat (SSE Streaming) ────────────────────

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body'}), 400

    conv_id = data.get('conversation_id')
    message = data.get('message', '').strip()
    member_id = data.get('member_id', 'bangchan')

    if not conv_id or not message:
        return jsonify({'error': 'conversation_id and message required'}), 400

    conv = conversation_manager.get_conversation(conv_id)
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404

    # Update member if changed
    if conv.get('member_id') != member_id:
        conversation_manager.update_conversation(conv_id, member_id=member_id)

    # Save user message
    conversation_manager.add_message(conv_id, 'user', message)

    # Build messages for AI
    conv = conversation_manager.get_conversation(conv_id)
    ai_messages = conversation_manager.get_ai_messages(conv)

    # Stop event
    stop_event = threading.Event()
    _active_streams[conv_id] = stop_event

    q = queue.Queue()

    def generate_in_thread():
        try:
            for token in gemini_service.stream_chat(
                ai_messages, member_id=member_id
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
        assistant_text = ''.join(full_response)
        if assistant_text:
            conversation_manager.add_message(
                conv_id, 'assistant', assistant_text, member_id=member_id
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
                    yield f'data: {json.dumps({"done": True})}\n\n'
                    break

            except queue.Empty:
                if stop_event.is_set():
                    _save_response(full_response)
                    yield f'data: {json.dumps({"done": True, "stopped": True})}\n\n'
                    break
                now = time.time()
                if now - last_keepalive >= SSE_KEEPALIVE_INTERVAL:
                    yield f': keepalive\n\n'
                    last_keepalive = now
                continue

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


# ──────────────────── TTS ────────────────────

@app.route('/api/tts', methods=['POST'])
def tts():
    data = request.get_json()
    if not data or not data.get('text'):
        return jsonify({'error': 'text required'}), 400

    text = data['text'][:500]  # Limit length
    voice = data.get('voice')
    member_id = data.get('member_id')

    path = tts_service.synthesize(text, voice=voice, member_id=member_id)
    if not path:
        return jsonify({'error': 'TTS generation failed'}), 500

    return jsonify({'audio_url': f'/api/tts/audio/{os.path.basename(path)}'})


@app.route('/api/tts/audio/<filename>')
def serve_tts_audio(filename):
    return send_from_directory(TTS_CACHE_DIR, filename)


# ──────────────────── News / Schedules ────────────────────

@app.route('/api/news')
def get_news():
    return jsonify({
        'birthdays': news_service.get_upcoming_birthdays(),
        'events': news_service.get_upcoming_events(),
        'news': news_service.fetch_news(),
    })


# ──────────────────── Conversations ────────────────────

@app.route('/api/conversations', methods=['GET'])
def list_convs():
    return jsonify(conversation_manager.list_conversations())


@app.route('/api/conversations', methods=['POST'])
def create_conv():
    data = request.get_json() or {}
    conv = conversation_manager.create_conversation(
        title=data.get('title'),
        member_id=data.get('member_id', 'bangchan'),
    )
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
