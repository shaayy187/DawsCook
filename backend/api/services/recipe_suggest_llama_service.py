import random, time
from dataclasses import dataclass
from api.llama.llama_suggest_prompts import parse_intent
from api.repositories.recipe_repository import search_by_params, filter_by_max_time
from api.services.recipe_search_service import RecipeSearchParams

import logging
logger = logging.getLogger(__name__)

@dataclass(frozen=True) 
class SuggestConfig: 
    limit_candidates: int = 40 
    top_window: int = 10 
    picks: int = 3 
    min_trigram: float = 0.25 
    search_type: str = "websearch"


class RecipeSuggestService:
    MOOD2INTENT = {
        "sad":        {"keywords": ["pasta","soup","chicken","chocolate","cake","mac","cheese","stew","risotto"], "max_time": 30},
        "happy":      {"keywords": ["salad","grilled","tacos","wrap","pizza","bbq","skewers","party","snack"],      "max_time": None},
        "tired":      {"keywords": ["quick","easy","one-pan","egg","omelet","sandwich","pasta"],                    "max_time": 20},
        "stressed":   {"keywords": ["soup","broth","chicken","noodle","ginger"],                                     "max_time": 30},
        "sick":       {"keywords": ["chicken","noodle","soup","ginger","lemon"],                                     "max_time": 30},
        "angry":      {"keywords": ["spicy","chili","curry","sichuan","crunchy"],                                    "max_time": None},
        "excited":    {"keywords": ["tacos","wings","bbq","street","sharing","nachos"],                              "max_time": None},
    }

    
    TRIGGERS_FAST = ["fast", "quick", "speedy", "express", "rapid"]

    def __init__(self, config: SuggestConfig):
        self.config = config or SuggestConfig()
        self.__dict__.update(vars(self.config))

    def _dedup(self, items):
        seen, out = set(), []
        for x in items:
            if x and x not in seen:
                seen.add(x)
                out.append(x)
        return out

    def _mood_terms(self, mood_text: str):
        txt = (mood_text or "").lower()
        extra, hinted_time = [], None
        for k, v in self.MOOD2INTENT.items():
            if k in txt:
                extra.extend(v.get("keywords", []))
                if hinted_time is None and v.get("max_time") is not None:
                    hinted_time = int(v["max_time"])
        return self._dedup(extra), hinted_time

    def _build_query(self, mood_text: str):
        intent = parse_intent(mood_text)
        logger.info("LLM intent: %s", intent)

        llama_keywords = intent.get("keywords") or []
        llama_style    = intent.get("style") or []
        llama_terms    = self._dedup(llama_keywords + llama_style)
        llama_time     = intent.get("max_time", None)

        text_lc = (mood_text or "").lower()
        has_fast_signal = any(w in text_lc for w in self.TRIGGERS_FAST) or \
                          any(s.lower() in ("quick", "fast", "easy") for s in llama_style)

        if llama_time is None and has_fast_signal:
            llama_time = 20

        if llama_terms or (llama_time is not None):
            return " ".join(llama_terms), (int(llama_time) if llama_time is not None else None)

        mood_terms, mood_time = self._mood_terms(mood_text)
        return " ".join(mood_terms), (int(mood_time) if mood_time is not None else None)

    def _search(self, q, max_time):
        params = RecipeSearchParams(
            q=q,
            limit=self.limit_candidates,
            search_type=self.search_type,
            min_trigram=self.min_trigram,
            include_allergy_ids=None,
            exclude_allergy_ids=None,
            require_all_allergies=False,
            ingredient=None,
            category_id=None,
            min_rating=None,
            min_votes=None,
        )
        recipes = search_by_params(params)
        return filter_by_max_time(recipes, max_time)

    def suggest(self, mood_text):
        mood = (mood_text or "").strip()
        if not mood:
            return []

        q, max_time = self._build_query(mood)
        recipes = self._search(q or "", max_time)

        if not recipes:
            mood_terms, mood_time = self._mood_terms(mood)
            recipes = self._search(" ".join(mood_terms), mood_time if mood_time is not None else max_time)

        if not recipes:
            from api.models import Recipe
            recipes = list(Recipe.objects.order_by("-rating")[: self.limit_candidates])
            if not recipes:
                return []

        recipes.sort(key=lambda r: (getattr(r, "rating", 0) or 0) + random.random() * 0.3, reverse=True)
        top = recipes[: self.top_window]
        if not top:
            return []
        k = min(self.picks, len(top))
        return random.sample(top, k=k)

