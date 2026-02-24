from services.provider_base import ProviderBase
from services.config_manager import get_api_key
from config import DEFAULT_MODELS


class ClaudeService(ProviderBase):

    def get_name(self):
        return 'claude'

    def is_available(self):
        return bool(get_api_key('claude'))

    def get_models(self):
        if not self.is_available():
            return []
        return [
            'claude-sonnet-4-20250514',
            'claude-haiku-4-20250514',
        ]

    def _build_content_blocks(self, msg):
        """Convert a message with attachments to Claude content blocks."""
        from services import file_service

        attachments = msg.get('attachments', [])
        if not attachments:
            return msg['content']

        blocks = []

        for att in attachments:
            conv_id = att['conv_id']
            stored_name = att['stored_name']

            if att['file_type'] == 'image':
                b64 = file_service.get_file_base64(conv_id, stored_name)
                if b64:
                    blocks.append({
                        'type': 'image',
                        'source': {
                            'type': 'base64',
                            'media_type': att['mime_type'],
                            'data': b64,
                        }
                    })
            elif att['mime_type'] == 'application/pdf':
                b64 = file_service.get_file_base64(conv_id, stored_name)
                if b64:
                    blocks.append({
                        'type': 'document',
                        'source': {
                            'type': 'base64',
                            'media_type': 'application/pdf',
                            'data': b64,
                        }
                    })
            else:
                # Text-based documents: extract text
                text = file_service.extract_text(conv_id, stored_name)
                if text:
                    blocks.append({
                        'type': 'text',
                        'text': f'[File: {att["original_name"]}]\n{text}',
                    })

        # Add the user's text message
        if msg['content']:
            blocks.append({'type': 'text', 'text': msg['content']})

        return blocks if blocks else msg['content']

    def stream_chat(self, messages, model=None, system_prompt=None):
        import anthropic

        api_key = get_api_key('claude')
        if not api_key:
            yield '[Claude Error: API key not configured]'
            return

        model = model or DEFAULT_MODELS['claude']
        client = anthropic.Anthropic(api_key=api_key)

        # Convert from OpenAI format to Anthropic format
        anthropic_messages = []
        for msg in messages:
            if msg['role'] == 'system':
                continue
            content = self._build_content_blocks(msg) if msg['role'] == 'user' else msg['content']
            anthropic_messages.append({
                'role': msg['role'],
                'content': content,
            })

        try:
            with client.messages.stream(
                model=model,
                max_tokens=4096,
                system=system_prompt or '',
                messages=anthropic_messages,
            ) as stream:
                for text in stream.text_stream:
                    yield text
        except anthropic.APIError as e:
            yield f'\n\n[Claude Error: {e.message}]'
        except Exception as e:
            yield f'\n\n[Claude Error: {e}]'
