import json
import urllib.request
import urllib.error
from services.provider_base import ProviderBase
from config import OLLAMA_BASE_URL, DEFAULT_MODELS


class OllamaService(ProviderBase):

    def __init__(self):
        self.base_url = OLLAMA_BASE_URL

    def get_name(self):
        return 'ollama'

    def is_available(self):
        try:
            req = urllib.request.Request(f'{self.base_url}/api/tags', method='GET')
            with urllib.request.urlopen(req, timeout=3) as resp:
                return resp.status == 200
        except Exception:
            return False

    def get_models(self):
        try:
            req = urllib.request.Request(f'{self.base_url}/api/tags', method='GET')
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return [m['name'] for m in data.get('models', [])]
        except Exception:
            return []

    def _build_message(self, msg):
        """Convert a message with attachments for Ollama.

        For images: uses 'images' field (base64 list) on the message.
        For documents: prepends extracted text to content.
        """
        from services import file_service

        attachments = msg.get('attachments', [])
        if not attachments:
            return {'role': msg['role'], 'content': msg['content']}

        images = []
        extra_text = []

        for att in attachments:
            conv_id = att['conv_id']
            stored_name = att['stored_name']

            if att['file_type'] == 'image':
                b64 = file_service.get_file_base64(conv_id, stored_name)
                if b64:
                    images.append(b64)
            else:
                text = file_service.extract_text(conv_id, stored_name)
                if text:
                    extra_text.append(f'[File: {att["original_name"]}]\n{text}')

        content = msg['content']
        if extra_text:
            content = '\n\n'.join(extra_text) + '\n\n' + content

        result = {'role': msg['role'], 'content': content}
        if images:
            result['images'] = images
        return result

    def stream_chat(self, messages, model=None, system_prompt=None):
        model = model or DEFAULT_MODELS['ollama']

        ollama_messages = []
        if system_prompt:
            ollama_messages.append({'role': 'system', 'content': system_prompt})
        for msg in messages:
            if msg['role'] == 'user' and msg.get('attachments'):
                ollama_messages.append(self._build_message(msg))
            else:
                ollama_messages.append({
                    'role': msg['role'],
                    'content': msg['content'],
                })

        payload = json.dumps({
            'model': model,
            'messages': ollama_messages,
            'stream': True,
        }).encode('utf-8')

        req = urllib.request.Request(
            f'{self.base_url}/api/chat',
            data=payload,
            headers={'Content-Type': 'application/json'},
            method='POST',
        )

        try:
            with urllib.request.urlopen(req, timeout=300) as resp:
                for raw_line in resp:
                    line = raw_line.decode('utf-8').strip()
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                        content = data.get('message', {}).get('content', '')
                        if content:
                            yield content
                        if data.get('done'):
                            break
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            yield f'\n\n[Ollama Error: {e}]'
