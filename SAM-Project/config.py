import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CONVERSATIONS_DIR = os.path.join(DATA_DIR, 'conversations')
TTS_CACHE_DIR = os.path.join(DATA_DIR, 'tts_cache')
CONFIG_FILE = os.path.join(DATA_DIR, 'config.json')
SCHEDULES_FILE = os.path.join(DATA_DIR, 'schedules.json')

HOST = '0.0.0.0'
PORT = 6010

# Gemini defaults
DEFAULT_MODEL = 'gemini-2.5-flash'
MAX_TOKENS = 2048
TEMPERATURE = 0.9

# TTS
TTS_VOICE_MALE = 'ko-KR-InJoonNeural'
TTS_VOICE_FEMALE = 'ko-KR-SunHiNeural'
