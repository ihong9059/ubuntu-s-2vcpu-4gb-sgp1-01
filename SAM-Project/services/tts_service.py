"""edge-tts 한국어 음성 합성 서비스 (멤버별 음성 지원)"""
import os
import hashlib
import asyncio
from config import TTS_CACHE_DIR, TTS_VOICE_MALE
from services.member_data import MEMBER_VOICES


def _ensure_cache_dir():
    os.makedirs(TTS_CACHE_DIR, exist_ok=True)


def _get_cache_path(text, voice, rate, pitch):
    """텍스트+음성+설정 조합의 캐시 파일 경로"""
    key = f"{voice}:{rate}:{pitch}:{text}"
    h = hashlib.md5(key.encode('utf-8')).hexdigest()
    return os.path.join(TTS_CACHE_DIR, f'{h}.mp3')


async def _generate_tts(text, voice, rate, pitch, output_path):
    """edge-tts로 음성 파일 생성 (rate, pitch 지원)"""
    import edge_tts
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(output_path)


def synthesize(text, voice=None, member_id=None):
    """텍스트를 음성으로 변환, 캐시된 파일 경로 반환

    member_id가 주어지면 해당 멤버의 음성 설정을 사용
    Returns: 파일 경로 (str) or None
    """
    if not text or not text.strip():
        return None

    _ensure_cache_dir()

    # 멤버별 음성 설정 적용
    if member_id and member_id in MEMBER_VOICES:
        mv = MEMBER_VOICES[member_id]
        voice = mv['voice']
        rate = mv['rate']
        pitch = mv['pitch']
    else:
        voice = voice or TTS_VOICE_MALE
        rate = '+0%'
        pitch = '+0Hz'

    cache_path = _get_cache_path(text, voice, rate, pitch)

    if os.path.exists(cache_path):
        return cache_path

    try:
        loop = asyncio.new_event_loop()
        try:
            loop.run_until_complete(_generate_tts(text, voice, rate, pitch, cache_path))
        finally:
            loop.close()
        return cache_path
    except Exception as e:
        print(f"[TTS Error] {e}")
        if os.path.exists(cache_path):
            os.remove(cache_path)
        return None
