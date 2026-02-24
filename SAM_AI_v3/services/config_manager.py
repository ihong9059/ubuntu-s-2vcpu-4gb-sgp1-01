import json
import os
from config import CONFIG_FILE, DATA_DIR

DEFAULT_CONFIG = {
    'api_keys': {
        'claude': '',
        'openai': '',
        'gemini': '',
    },
    'preferences': {
        'default_provider': 'ollama',
        'default_model': {},
        'system_prompt': 'You are a helpful AI assistant.',
    }
}


def _ensure_config():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(DEFAULT_CONFIG, f, indent=2)


def load_config():
    _ensure_config()
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        config = json.load(f)
    # merge defaults for missing keys
    for key in DEFAULT_CONFIG:
        if key not in config:
            config[key] = DEFAULT_CONFIG[key]
    return config


def save_config(config):
    _ensure_config()
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


def get_api_key(provider):
    config = load_config()
    return config.get('api_keys', {}).get(provider, '')


def set_api_keys(keys_dict):
    config = load_config()
    if 'api_keys' not in config:
        config['api_keys'] = {}
    for provider, key in keys_dict.items():
        if key is not None:  # allow empty string to clear
            config['api_keys'][provider] = key
    save_config(config)


def get_preferences():
    config = load_config()
    return config.get('preferences', DEFAULT_CONFIG['preferences'])


def set_preferences(prefs):
    config = load_config()
    if 'preferences' not in config:
        config['preferences'] = {}
    config['preferences'].update(prefs)
    save_config(config)


def get_masked_config():
    config = load_config()
    masked = {
        'api_keys': {},
        'preferences': config.get('preferences', DEFAULT_CONFIG['preferences']),
    }
    for provider, key in config.get('api_keys', {}).items():
        if key and len(key) > 8:
            masked['api_keys'][provider] = key[:4] + '...' + key[-4:]
        elif key:
            masked['api_keys'][provider] = key[:2] + '...'
        else:
            masked['api_keys'][provider] = ''
    return masked
