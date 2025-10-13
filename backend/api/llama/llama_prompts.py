import json
from .llama_client import chat_ollama

SYSTEM = (
    "You are a culinary assistant. "
    "From a short user mood/craving description, extract simple search criteria. "
    "Always reply with a VALID JSON object only (no comments, no extra text). "
    "All JSON text fields MUST be in English (US)."
)

USER_TPL = """
    User text: "{text}"

    Return ONLY a JSON object in exactly this shape:
    {{
    "keywords": [string, ...],             // English words, e.g. creamy, spicy, crispy, sweet
    "include_ingredients": [string, ...],  // English ingredient names
    "exclude_ingredients": [string, ...],
    "style": [string, ...],                // e.g., creamy, spicy, crispy, comfort, light
    "max_time": null                       // minutes (integer) or null
    }}

    Rules:
    - If the user implies quick/fast (any language), set max_time between 20–30.
    - If unsure, leave lists empty and max_time null.
    - Output ONLY the JSON object, nothing else.
"""

def parse_intent(text: str) -> dict:
    messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": USER_TPL.format(text=text[:300])},
    ]
    raw = chat_ollama(messages).strip()
    data = json.loads(raw)
    return {
            "keywords": list(map(str, data.get("keywords", [])))[:8],
            "include_ingredients": list(map(str, data.get("include_ingredients", [])))[:8],
            "exclude_ingredients": list(map(str, data.get("exclude_ingredients", [])))[:8],
            "style": list(map(str, data.get("style", [])))[:8],
            "max_time": data.get("max_time", None),
        }
