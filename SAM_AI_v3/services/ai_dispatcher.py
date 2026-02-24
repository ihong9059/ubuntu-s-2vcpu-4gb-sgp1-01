from config import SYNTHESIZER_PRIORITY
from services.ollama_service import OllamaService
from services.claude_service import ClaudeService
from services.openai_service import OpenAIService
from services.gemini_service import GeminiService

_providers = {
    'ollama': OllamaService(),
    'claude': ClaudeService(),
    'openai': OpenAIService(),
    'gemini': GeminiService(),
}


def get_provider(name):
    return _providers.get(name)


def get_all_providers_status():
    status = {}
    for name, provider in _providers.items():
        available = provider.is_available()
        models = provider.get_models() if available else []
        status[name] = {
            'available': available,
            'models': models,
        }
    return status


def get_available_providers():
    """Return list of provider names that are currently available."""
    return [name for name, provider in _providers.items() if provider.is_available()]


def get_online_providers():
    """Return available providers excluding Ollama (for Compare/Smart modes)."""
    available = get_available_providers()
    online = [p for p in available if p != 'ollama']
    return online if online else available


def get_synthesizer(exclude=None):
    """Pick the best available provider for synthesis, following priority order.
    Optionally exclude a set of provider names."""
    exclude = set(exclude or [])
    available = get_available_providers()
    for name in SYNTHESIZER_PRIORITY:
        if name in available and name not in exclude:
            return name
    # Fallback to any available
    for name in available:
        if name not in exclude and name != 'ollama':
            return name
    return None


def stream_chat(provider_name, messages, model=None, system_prompt=None):
    provider = _providers.get(provider_name)
    if not provider:
        yield f'[Error: Unknown provider "{provider_name}"]'
        return
    if not provider.is_available():
        yield f'[Error: {provider_name} is not available]'
        return
    yield from provider.stream_chat(messages, model=model, system_prompt=system_prompt)
