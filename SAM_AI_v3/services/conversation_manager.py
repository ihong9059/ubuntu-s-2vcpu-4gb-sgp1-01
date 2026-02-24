import json
import os
import re
import uuid
from datetime import datetime
from config import CONVERSATIONS_DIR

_UUID_RE = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)


def _ensure_dir():
    os.makedirs(CONVERSATIONS_DIR, exist_ok=True)


def _validate_id(conv_id):
    """Validate that conv_id is a proper UUID to prevent path traversal."""
    if not conv_id or not _UUID_RE.match(conv_id):
        return False
    return True


def _conv_path(conv_id):
    if not _validate_id(conv_id):
        raise ValueError(f'Invalid conversation ID: {conv_id}')
    return os.path.join(CONVERSATIONS_DIR, f'{conv_id}.json')


def create_conversation(title=None):
    _ensure_dir()
    conv_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    conv = {
        'id': conv_id,
        'title': title or 'New Chat',
        'created_at': now,
        'updated_at': now,
        'messages': [],
    }
    with open(_conv_path(conv_id), 'w', encoding='utf-8') as f:
        json.dump(conv, f, indent=2, ensure_ascii=False)
    return conv


def get_conversation(conv_id):
    try:
        path = _conv_path(conv_id)
    except ValueError:
        return None
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def update_conversation(conv_id, **kwargs):
    if not _validate_id(conv_id):
        return None
    conv = get_conversation(conv_id)
    if not conv:
        return None
    for key, value in kwargs.items():
        if key in ('title', 'messages'):
            conv[key] = value
    conv['updated_at'] = datetime.now().isoformat()
    with open(_conv_path(conv_id), 'w', encoding='utf-8') as f:
        json.dump(conv, f, indent=2, ensure_ascii=False)
    return conv


def delete_conversation(conv_id):
    try:
        path = _conv_path(conv_id)
    except ValueError:
        return False
    if os.path.exists(path):
        os.remove(path)
        # Also delete uploaded files for this conversation
        from services import file_service
        file_service.delete_uploads(conv_id)
        return True
    return False


def list_conversations():
    _ensure_dir()
    conversations = []
    for filename in os.listdir(CONVERSATIONS_DIR):
        if not filename.endswith('.json'):
            continue
        path = os.path.join(CONVERSATIONS_DIR, filename)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                conv = json.load(f)
            conversations.append({
                'id': conv['id'],
                'title': conv['title'],
                'created_at': conv['created_at'],
                'updated_at': conv['updated_at'],
                'message_count': len(conv.get('messages', [])),
            })
        except (json.JSONDecodeError, KeyError):
            continue
    # sort by updated_at descending
    conversations.sort(key=lambda c: c['updated_at'], reverse=True)
    return conversations


def add_multi_message(conv_id, responses):
    """Save a multi-provider assistant message.

    responses: list of {'provider': str, 'model': str, 'content': str}
    """
    if not _validate_id(conv_id):
        return None
    conv = get_conversation(conv_id)
    if not conv:
        return None
    msg = {
        'role': 'assistant',
        'multi_provider': True,
        'responses': responses,
        'timestamp': datetime.now().isoformat(),
    }
    conv['messages'].append(msg)
    conv['updated_at'] = datetime.now().isoformat()
    with open(_conv_path(conv_id), 'w', encoding='utf-8') as f:
        json.dump(conv, f, indent=2, ensure_ascii=False)
    return msg


def get_ai_messages(conv):
    """Convert conversation messages to OpenAI-format list for AI context.

    Multi-provider messages use the longest response as representative content.
    Smart-mode messages use the synthesized content.
    User messages with attachments include the attachments metadata.
    """
    result = []
    for m in conv.get('messages', []):
        if m['role'] == 'user':
            msg = {'role': 'user', 'content': m['content']}
            if m.get('attachments'):
                msg['attachments'] = m['attachments']
            result.append(msg)
        elif m['role'] == 'assistant':
            if m.get('smart_mode') and m.get('synthesized'):
                result.append({'role': 'assistant', 'content': m['synthesized']})
            elif m.get('multi_provider') and m.get('responses'):
                # Pick the longest response as context
                best = max(m['responses'], key=lambda r: len(r.get('content', '')))
                result.append({'role': 'assistant', 'content': best['content']})
            else:
                result.append({'role': 'assistant', 'content': m['content']})
    return result


def add_smart_message(conv_id, synthesized, contributions, raw_responses):
    """Save a Smart mode assistant message with synthesized content and contributions.

    synthesized: str - the final synthesized answer
    contributions: list of {'provider': str, 'model': str, 'tokens': int, 'percent': float}
    raw_responses: list of {'provider': str, 'model': str, 'content': str}
    """
    if not _validate_id(conv_id):
        return None
    conv = get_conversation(conv_id)
    if not conv:
        return None
    msg = {
        'role': 'assistant',
        'smart_mode': True,
        'synthesized': synthesized,
        'contributions': contributions,
        'raw_responses': raw_responses,
        'timestamp': datetime.now().isoformat(),
    }
    conv['messages'].append(msg)
    conv['updated_at'] = datetime.now().isoformat()
    with open(_conv_path(conv_id), 'w', encoding='utf-8') as f:
        json.dump(conv, f, indent=2, ensure_ascii=False)
    return msg


def add_message(conv_id, role, content, provider=None, model=None, attachments=None):
    if not _validate_id(conv_id):
        return None
    conv = get_conversation(conv_id)
    if not conv:
        return None
    msg = {
        'role': role,
        'content': content,
        'timestamp': datetime.now().isoformat(),
    }
    if provider:
        msg['provider'] = provider
    if model:
        msg['model'] = model
    if attachments:
        msg['attachments'] = attachments
    conv['messages'].append(msg)
    conv['updated_at'] = datetime.now().isoformat()
    with open(_conv_path(conv_id), 'w', encoding='utf-8') as f:
        json.dump(conv, f, indent=2, ensure_ascii=False)
    return msg
