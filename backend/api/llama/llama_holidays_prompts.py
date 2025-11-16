import json
from .llama_client import chat_ollama
from typing import List

TIMEOUT_LLM  = 120

SYSTEM = (
    'You are an extractor. Input is a Polish snippet from kalbi.pl '
    '(between "Nietypowe święta:" and "Przysłowia"). '
    'Choose the single MOST food-related observance. '
    'Return ONLY valid JSON object, no code fences. '
    'Schema: {"holiday": string}. ' 
    'If there is NO food-related observance, set "holiday" to an empty string ""'
)
USER_TPL = "Date: {iso}\nSource: {url}\n\nTEXT:\n{snippet}\n"

def _llama_extract(url: str, iso: str, snippet_text: str) -> List[str]:
    raw = chat_ollama(
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user",   "content": USER_TPL.format(iso=iso, url=url, snippet=snippet_text)}
        ],
        temperature=0.0,
        timeout=TIMEOUT_LLM,
    ).strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []

    h = data.get("holiday", None)
    if isinstance(h, str):
        h = h.strip()
    return [h] if h else []
