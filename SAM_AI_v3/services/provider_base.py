from abc import ABC, abstractmethod


class ProviderBase(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    def get_name(self):
        """Return provider identifier string."""
        pass

    @abstractmethod
    def is_available(self):
        """Check if the provider is configured and reachable."""
        pass

    @abstractmethod
    def get_models(self):
        """Return list of available model names."""
        pass

    @abstractmethod
    def stream_chat(self, messages, model=None, system_prompt=None):
        """
        Generator that yields content tokens.

        Args:
            messages: list of {role, content} dicts (OpenAI format)
            model: model name override
            system_prompt: system prompt string

        Yields:
            str: content token chunks
        """
        pass
