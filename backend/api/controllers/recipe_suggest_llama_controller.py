from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.services.recipe_suggest_llama_service import RecipeSuggestService, SuggestConfig
from api.serializer import RecipeSerializer

class RecipeSuggestLlamaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        mood = (request.GET.get("mood") or "").strip()
        if not mood:
            return Response([], status=200)

        service = RecipeSuggestService(SuggestConfig(
            limit_candidates=int(request.GET.get("limit", 40) or 40)
        ))
        picks = service.suggest(mood)

        data = RecipeSerializer(picks, many=True, context={"request": request}).data
        return Response(data, status=200)
