from services.provider_base import ProviderBase
from services.config_manager import get_api_key
from config import DEFAULT_MODELS


class GeminiService(ProviderBase):

    def get_name(self):
        return 'gemini'

    def is_available(self):
        return bool(get_api_key('gemini'))

    def get_models(self):
        if not self.is_available():
            return []
        return [
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
        ]

    def _build_parts(self, msg):
        """Convert a message with attachments to Gemini parts list."""
        from services import file_service
        import base64

        attachments = msg.get('attachments', [])
        if not attachments:
            return [msg['content']]

        parts = []

        for att in attachments:
            conv_id = att['conv_id']
            stored_name = att['stored_name']

            if att['file_type'] == 'image':
                b64 = file_service.get_file_base64(conv_id, stored_name)
                if b64:
                    parts.append({
                        'inline_data': {
                            'mime_type': att['mime_type'],
                            'data': b64,
                        }
                    })
            else:
                # Documents: extract text
                text = file_service.extract_text(conv_id, stored_name)
                if text:
                    parts.append(f'[File: {att["original_name"]}]\n{text}')

        # Add the user's text message
        if msg['content']:
            parts.append(msg['content'])

        return parts if parts else [msg['content']]

    def stream_chat(self, messages, model=None, system_prompt=None):
        import google.generativeai as genai

        api_key = get_api_key('gemini')
        if not api_key:
            yield '[Gemini Error: API key not configured]'
            return

        model_name = model or DEFAULT_MODELS['gemini']
        genai.configure(api_key=api_key)

        # Convert OpenAI format to Gemini format
        history = []
        for msg in messages[:-1]:  # all except last
            role = 'model' if msg['role'] == 'assistant' else 'user'
            if msg['role'] == 'user' and msg.get('attachments'):
                history.append({'role': role, 'parts': self._build_parts(msg)})
            else:
                history.append({'role': role, 'parts': [msg['content']]})

        # Build last message parts
        last_msg = messages[-1] if messages else {'content': '', 'role': 'user'}
        if last_msg.get('attachments'):
            last_parts = self._build_parts(last_msg)
        else:
            last_parts = last_msg['content']

        try:
            gen_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_prompt or None,
            )
            chat = gen_model.start_chat(history=history)
            response = chat.send_message(last_parts, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f'\n\n[Gemini Error: {e}]'
