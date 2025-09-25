from typing import Optional, List
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from api.serializer import RecipeSerializer
from api.services.recipe_search_service import RecipeSearchParams, search_recipes

def _parse_ids(param: Optional[str]) -> Optional[List[int]]:
    if not param:
        return None
    out: List[int] = []
    for x in param.split(","):
        x = x.strip()
        if x.isdigit():
            out.append(int(x))
    return out or None

class RecipeSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        q = (request.GET.get("q") or "").strip()
        limit = int(request.GET.get("limit", 50) or 50)
        search_type = request.GET.get("type", "plain")
        min_trigram = float(request.GET.get("min_trigram", 0.12) or 0.12)

        include_allergy_ids = _parse_ids(request.GET.get("include_allergies"))
        exclude_allergy_ids = _parse_ids(request.GET.get("exclude_allergies"))
        require_all = str(request.GET.get("all_all", "0")).lower() in ("1", "true", "yes")
        ingredient = (request.GET.get("ingredient") or "").strip() or None
        category_id = int(request.GET.get("category_id")) if request.GET.get("category_id") else None
        min_rating = float(request.GET.get("min_rating")) if request.GET.get("min_rating") else None
        min_votes = int(request.GET.get("min_votes")) if request.GET.get("min_votes") else None

        params = RecipeSearchParams(
            q=q,
            limit=limit,
            search_type=search_type if search_type in ("plain", "websearch", "phrase") else "plain",
            min_trigram=min_trigram,
            include_allergy_ids=include_allergy_ids,
            exclude_allergy_ids=exclude_allergy_ids,
            require_all_allergies=require_all,
            ingredient=ingredient,
            category_id=category_id,
            min_rating=min_rating,
            min_votes=min_votes,
        )

        qs = search_recipes(params)
        data = RecipeSerializer(qs, many=True, context={"request": request}).data
        return Response(data, status=200)
