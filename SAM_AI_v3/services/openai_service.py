from services.provider_base import ProviderBase
from services.config_manager import get_api_key
from config import DEFAULT_MODELS


class OpenAIService(ProviderBase):

    def get_name(self):
        return 'openai'

    def is_available(self):
        return bool(get_api_key('openai'))

    def get_models(self):
        if not self.is_available():
            return []
        return [
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4.1',
            'gpt-4.1-mini',
        ]

    def _build_content_parts(self, msg):
        """Convert a message with attachments to OpenAI content parts."""
        from services import file_service

        attachments = msg.get('attachments', [])
        if not attachments:
            return msg['content']

        parts = []

        for att in attachments:
            conv_id = att['conv_id']
            stored_name = att['stored_name']

            if att['file_type'] == 'image':
                b64 = file_service.get_file_base64(conv_id, stored_name)
                if b64:
                    parts.append({
                        'type': 'image_url',
                        'image_url': {
                            'url': f'data:{att["mime_type"]};base64,{b64}',
                        }
                    })
            else:
                # Documents: extract text
                text = file_service.extract_text(conv_id, stored_name)
                if text:
                    parts.append({
                        'type': 'text',
                        'text': f'[File: {att["original_name"]}]\n{text}',
                    })

        # Add the user's text message
        if msg['content']:
            parts.append({'type': 'text', 'text': msg['content']})

        return parts if parts else msg['content']

    def stream_chat(self, messages, model=None, system_prompt=None):
        from openai import OpenAI

        api_key = get_api_key('openai')
        if not api_key:
            yield '[GPT Error: API key not configured]'
            return

        model = model or DEFAULT_MODELS['openai']
        client = OpenAI(api_key=api_key)

        oai_messages = []
        if system_prompt:
            oai_messages.append({'role': 'system', 'content': system_prompt})
        for msg in messages:
            content = self._build_content_parts(msg) if msg['role'] == 'user' else msg['content']
            oai_messages.append({
                'role': msg['role'],
                'content': content,
            })

        try:
            response = client.chat.completions.create(
                model=model,
                messages=oai_messages,
                stream=True,
            )
            for chunk in response:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and delta.content:
                    yield delta.content
        except Exception as e:
            yield f'\n\n[GPT Error: {e}]'
