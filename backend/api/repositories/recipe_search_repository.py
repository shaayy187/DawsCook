from typing import Optional, List
from django.db import connection
from django.db.models import F, Q, Count, QuerySet, Value
from django.db.models.functions import Coalesce
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank, TrigramSimilarity
from api.models import Recipe

def _has_pg_trgm() -> bool:
    try:
        with connection.cursor() as cur:
            cur.execute("SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='pg_trgm')")
            return bool(cur.fetchone()[0])
    except Exception:
        return False

def search_recipes_queryset(
    q: str,
    *,
    limit: int = 50,
    min_trigram: float = 0.12,
    config: str = "simple",
    search_type: str = "plain",
    include_allergy_ids: Optional[List[int]] = None,
    exclude_allergy_ids: Optional[List[int]] = None,
    require_all_allergies: bool = False,
    ingredient: Optional[str] = None,
    category_id: Optional[int] = None,
    min_rating: Optional[float] = None,
    min_votes: Optional[int] = None,
) -> QuerySet:
    if q is None:
        q = ""

    qs = Recipe.objects.all()

    if include_allergy_ids:
        if require_all_allergies:
            for aid in include_allergy_ids:
                qs = qs.filter(allergies__id=aid)
        else:
            qs = qs.filter(allergies__id__in=include_allergy_ids)

    if exclude_allergy_ids:
        qs = qs.exclude(allergies__id__in=exclude_allergy_ids)

    qs = qs.distinct()

    if ingredient:
        qs = qs.filter(ingredients__name__icontains=ingredient)

    if category_id:
        qs = qs.filter(category_id=category_id)

    if min_rating is not None:
        qs = qs.filter(rating__gte=min_rating)

    if min_votes is not None:
        qs = qs.annotate(_votes=Count("ratings__id", distinct=True)).filter(_votes__gte=min_votes)

    qs = qs.annotate(ratings_count=Count("ratings__id", distinct=True))

    if not q:
        return qs.order_by(
            F("rating").desc(nulls_last=True),
            F("ratings_count").desc(nulls_last=True),
            F("created").desc(nulls_last=True),
            F("id").asc(),
        )[:limit]

    vector = (
        SearchVector("recipe", weight="A", config=config) +
        SearchVector("description", weight="B", config=config)
    )
    query = SearchQuery(q, config=config, search_type=search_type)

    qs = qs.annotate(vector=vector)
    qs = qs.annotate(rank=SearchRank(F("vector"), query))

    if _has_pg_trgm():
        similarity = Coalesce(
            TrigramSimilarity("recipe", q) + TrigramSimilarity("description", q),
            Value(0.0),
        )
        qs = qs.annotate(similarity=similarity)
        qs = qs.filter(Q(rank__gt=0.0) | Q(similarity__gt=min_trigram))
    else:
        qs = qs.annotate(similarity=Value(0.0))
        qs = qs.filter(rank__gt=0.0)

    qs = qs.annotate(ratings_count=Count("ratings__id", distinct=True))

    qs = qs.annotate(
        score=F("rank")
            + 0.15 * F("similarity")
            + 0.02 * F("ratings_count")
            + 0.05 * F("rating")
    )

    return qs.order_by("-score", F("created").desc(nulls_last=True), F("id").asc()).distinct()[:limit]
