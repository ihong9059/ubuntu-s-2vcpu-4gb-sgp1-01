"""Gemini API 스트리밍 서비스 (google-genai SDK)"""
from services.config_manager import get_api_key
from services.member_data import get_system_prompt
from config import DEFAULT_MODEL, MAX_TOKENS, TEMPERATURE


def stream_chat(messages, member_id='bangchan', model=None):
    """Gemini API 스트리밍 응답 생성

    messages: [{'role': 'user'|'assistant', 'content': str}, ...]
    member_id: 멤버 ID (시스템 프롬프트 결정)
    """
    from google import genai
    from google.genai import types

    api_key = get_api_key('gemini')
    if not api_key:
        yield '[Error: Gemini API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.]'
        return

    model_name = model or DEFAULT_MODEL
    system_prompt = get_system_prompt(member_id)

    client = genai.Client(api_key=api_key)

    # Build contents in Gemini format
    contents = []
    for msg in messages:
        role = 'model' if msg['role'] == 'assistant' else 'user'
        contents.append(types.Content(
            role=role,
            parts=[types.Part.from_text(text=msg['content'])]
        ))

    config = types.GenerateContentConfig(
        system_instruction=system_prompt or None,
        max_output_tokens=MAX_TOKENS,
        temperature=TEMPERATURE,
    )

    try:
        response = client.models.generate_content_stream(
            model=model_name,
            contents=contents,
            config=config,
        )
        for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f'\n\n[Gemini Error: {e}]'
