from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import permission_classes
from drf_yasg import openapi
from rest_framework.exceptions import NotFound
from ..serializer import RecipeSerializer
from ..services import recipe_service
from ..models import Recipe
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

@swagger_auto_schema(
    operation_description="Retrieve and create recipes with pagination, filtering and search."
)
class RecipeView(ListAPIView):
    permission_classes = [AllowAny]

    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['difficulty', 'category']
    ordering_fields = ['rating', 'recipe']
    search_fields = ['recipe', 'description']


class RecipeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve a single recipe by ID. Requires authentication.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Recipe ID", type=openapi.TYPE_INTEGER)
        ],
        responses={
            200: RecipeSerializer(),
            404: "Recipe not found"
        }
    )
    def get(self, request, id):
        recipe = recipe_service.get_recipes(id)
        if not recipe:
            raise NotFound("Recipe not found")
        return Response(recipe, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
    operation_description="Update a recipe by ID.",
    request_body=RecipeSerializer,
    responses={
        200: RecipeSerializer(),
        400: "Validation error",
        404: "Recipe not found"
        }
    )   
    def patch(self, request, id):
        updated_recipe = recipe_service.update_recipe(id, request.data)
        return Response(updated_recipe, status=status.HTTP_200_OK)
