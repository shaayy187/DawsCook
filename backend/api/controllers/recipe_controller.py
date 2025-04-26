from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..serializer import RecipeSerializer
from ..services import recipe_service

@permission_classes([AllowAny])
class RecipeView(APIView):

    @swagger_auto_schema(
        operation_description="Retrieve a recipe by ID or return all recipes if no ID is provided.",
        responses={200: RecipeSerializer(many=True)},
        manual_parameters=[
            openapi.Parameter(
                'id', openapi.IN_QUERY, description="Optional recipe ID to retrieve a single recipe", type=openapi.TYPE_INTEGER
            )
        ]
    )
    def get(self, request, id=None):
        recipes = recipe_service.get_recipes(id)
        return Response(recipes, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Create a new recipe.",
        request_body=RecipeSerializer,
        responses={201: RecipeSerializer}
    )
    def post(self, request):
        recipe = recipe_service.create_recipe(request.data)
        return Response(recipe, status=status.HTTP_201_CREATED)
