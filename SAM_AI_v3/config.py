import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
CONVERSATIONS_DIR = os.path.join(DATA_DIR, 'conversations')
CONFIG_FILE = os.path.join(DATA_DIR, 'config.json')

HOST = '0.0.0.0'
PORT = 5050

# ──────── File Upload ────────
UPLOADS_DIR = os.path.join(DATA_DIR, 'uploads')
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

ALLOWED_IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp'}
ALLOWED_DOC_EXTENSIONS = {'.pdf', '.txt', '.md', '.csv', '.docx'}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_DOC_EXTENSIONS

MIME_TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.csv': 'text/csv',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

OLLAMA_BASE_URL = 'http://localhost:11434'

DEFAULT_MODELS = {
    'claude': 'claude-sonnet-4-20250514',
    'openai': 'gpt-4o',
    'gemini': 'gemini-2.5-flash',
    'ollama': 'gemma3:4b',
}

PROVIDER_DISPLAY_NAMES = {
    'claude': 'Claude',
    'openai': 'GPT',
    'gemini': 'Gemini',
    'ollama': 'Ollama',
}

SSE_KEEPALIVE_INTERVAL = 3  # seconds

# ──────── Chat Modes ────────

CHAT_MODES = ['single', 'compare', 'smart']

# Synthesizer AI selection priority (strongest analysis first)
SYNTHESIZER_PRIORITY = ['claude', 'gemini', 'openai']

SYNTHESIZER_PROMPT = """다음은 여러 AI가 같은 질문에 대해 답변한 내용입니다.
각 답변의 장점을 종합하여 최상의 답변을 작성하세요.
출처 AI를 언급하지 말고 자연스러운 하나의 답변으로 통합하세요.

[질문]: {user_message}

{responses_block}"""
