import os
import requests

LLM_HOST = os.getenv("LLM_HOST", "http://localhost:11434")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.1")

def chat_ollama(messages, temperature=0.2, timeout=1024):
        r = requests.post(
            f"{LLM_HOST}/api/chat",
            json={
                "model": LLM_MODEL,
                "messages": messages,
                "stream": False,
                "options": {"temperature": temperature},
            },
            timeout=timeout,
        )
        r.raise_for_status()
        return r.json()["message"]["content"]
