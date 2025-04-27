from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.exceptions import AuthenticationFailed
from ..serializer import RecipeSerializer
from ..services import recipe_service

class RecipeView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    @swagger_auto_schema(
        operation_description="Retrieve a recipe by ID or return all recipes if no ID is provided.",
        responses={
            200: RecipeSerializer(many=True),
            404: 'Recipe not found',
            400: 'Bad request'
        },
        manual_parameters=[
            openapi.Parameter(
                'id', openapi.IN_QUERY, description="Optional recipe ID to retrieve a single recipe", type=openapi.TYPE_INTEGER
            )
        ]
    )
    def get(self, request, id=None):
        if id is not None:
            if not request.user.is_authenticated: 
                raise AuthenticationFailed("No Permissions")
            recipe = recipe_service.get_recipes(id)
            return Response(recipe, status=status.HTTP_200_OK)
        
        recipes = recipe_service.get_recipes()
        return Response(recipes, status=status.HTTP_200_OK)


    @swagger_auto_schema(
        operation_description="Create a new recipe.",
        request_body=RecipeSerializer,
        responses={
            201: RecipeSerializer,
            400: 'Validation error'
        }
    )
    def post(self, request):
        recipe = recipe_service.create_recipe(request.data)
        return Response(recipe, status=status.HTTP_201_CREATED)
