import random, time
from dataclasses import dataclass
from typing import List, Optional
from api.llama.llama_prompts import parse_intent
from api.repositories.recipe_repository import search_by_params, filter_by_max_time
from api.services.recipe_search_service import RecipeSearchParams
from api.models import Recipe

@dataclass(frozen=True) 
class SuggestConfig: 
    limit_candidates: int = 40 
    top_window: int = 10 
    picks: int = 3 
    min_trigram: float = 0.12 
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

    MOOD_RETRY = {
        "sad":   ["mac","cheese","pasta","soup","chocolate","cake"],
        "happy": ["salad","grilled","tacos","pizza"],
        "tired": ["quick","easy","egg","sandwich","pasta"],
        "stressed": ["soup","broth","noodle"],
        "sick":  ["chicken","noodle","soup"],
        "angry": ["spicy","chili","curry"],
    }

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

    def _build_query(self, mood_text):
        intent = parse_intent(mood_text)
        llama_terms = (intent.get("keywords") or []) + (intent.get("style") or [])
        mood_terms, mood_time = self._mood_terms(mood_text)
        terms = self._dedup([*llama_terms, *mood_terms])
        q = " ".join(terms)
        max_time = intent.get("max_time") if intent.get("max_time") is not None else mood_time
        return q, (int(max_time) if max_time else None)

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
        recipes = self._search(q, max_time) if q else []

        if not recipes:
            txt = mood.lower()
            retry_terms = []
            for k, terms in self.MOOD_RETRY.items():
                if k in txt:
                    retry_terms.extend(terms)
            retry_terms = self._dedup(retry_terms)
            if retry_terms:
                q2 = " ".join(retry_terms)
                recipes = self._search(q2, max_time)

        if not recipes:
            from api.models import Recipe
            recipes = list(Recipe.objects.order_by("-rating")[: self.limit_candidates])

        if not recipes:
            return []

        recipes.sort(
            key=lambda r: (getattr(r, "rating", 0) or 0) + random.random() * 0.3,
            reverse=True
        )
        top = recipes[: self.top_window]
        if not top:
            return []
        import time as _t
        random.seed(_t.time())
        k = min(self.picks, len(top))
        return random.sample(top, k=k)

