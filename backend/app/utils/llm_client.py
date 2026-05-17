"""
Shared Mistral LLM client.
Singleton pattern — initialized once, reused across all agents.
"""

import os
from dotenv import load_dotenv
from mistralai import Mistral

load_dotenv()

_client = None


def get_client():
    """Get or create the shared Mistral client instance."""
    global _client

    if _client is None:
        api_key = os.getenv("MISTRAL_API_KEY")

        if not api_key:
            raise ValueError("MISTRAL_API_KEY not found in environment variables")

        _client = Mistral(api_key=api_key)

    return _client