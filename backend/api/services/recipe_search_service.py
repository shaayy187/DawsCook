from dataclasses import dataclass
from typing import Literal
from django.db.models import QuerySet
from api.repositories.recipe_search_repository import search_recipes_queryset
from api.models import Recipe
from typing import Optional, List

SearchType = Literal["plain", "websearch", "phrase"]

@dataclass(frozen=True)
class RecipeSearchParams:
    q: str
    limit: int = 50
    min_trigram: float = 0.12
    config: str = "simple"
    search_type: SearchType = "plain"
    include_allergy_ids: Optional[List[int]] = None,
    exclude_allergy_ids: Optional[List[int]] = None,
    require_all_allergies: bool = False,
    ingredient: Optional[str] = None,
    category_id: Optional[int] = None,
    min_rating: Optional[float] = None,
    min_votes: Optional[int] = None,

def search_recipes(p: RecipeSearchParams) -> QuerySet:
    q = (p.q or "").strip()

    has_filters = any([
        p.ingredient,
        p.include_allergy_ids,
        p.exclude_allergy_ids,
        p.category_id,
        p.min_rating,
        p.min_votes,
    ])
    if not q and not has_filters:
        return Recipe.objects.none()
    limit = max(1, min(p.limit, 200))
    return search_recipes_queryset(
        q=q,
        limit=limit,
        min_trigram=p.min_trigram,
        config=p.config,
        search_type=p.search_type,
        include_allergy_ids=p.include_allergy_ids,
        exclude_allergy_ids=p.exclude_allergy_ids,
        require_all_allergies=p.require_all_allergies,
        ingredient=(p.ingredient or "").strip() or None,
        category_id=p.category_id,
        min_rating=p.min_rating,
        min_votes=p.min_votes,
    )