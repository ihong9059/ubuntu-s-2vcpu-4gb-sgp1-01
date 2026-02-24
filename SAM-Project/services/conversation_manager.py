"""대화 저장/관리"""
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
    if not conv_id or not _UUID_RE.match(conv_id):
        return False
    return True


def _conv_path(conv_id):
    if not _validate_id(conv_id):
        raise ValueError(f'Invalid conversation ID: {conv_id}')
    return os.path.join(CONVERSATIONS_DIR, f'{conv_id}.json')


def create_conversation(title=None, member_id=None):
    _ensure_dir()
    conv_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    conv = {
        'id': conv_id,
        'title': title or 'New Chat',
        'member_id': member_id or 'bangchan',
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
        if key in ('title', 'messages', 'member_id'):
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
                'member_id': conv.get('member_id', 'bangchan'),
                'created_at': conv['created_at'],
                'updated_at': conv['updated_at'],
                'message_count': len(conv.get('messages', [])),
            })
        except (json.JSONDecodeError, KeyError):
            continue
    conversations.sort(key=lambda c: c['updated_at'], reverse=True)
    return conversations


def add_message(conv_id, role, content, member_id=None):
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
    if member_id:
        msg['member_id'] = member_id
    conv['messages'].append(msg)
    conv['updated_at'] = datetime.now().isoformat()
    with open(_conv_path(conv_id), 'w', encoding='utf-8') as f:
        json.dump(conv, f, indent=2, ensure_ascii=False)
    return msg


def get_ai_messages(conv):
    """대화 메시지를 Gemini용 리스트로 변환"""
    result = []
    for m in conv.get('messages', []):
        result.append({'role': m['role'], 'content': m['content']})
    return result
