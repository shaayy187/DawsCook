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


class RecipeView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Retrieve all recipes.",
        responses={
            200: RecipeSerializer(many=True)
        }
    )
    def get(self, request):
        recipes = recipe_service.get_recipes()
        return Response(recipes, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Create a new recipe.",
        request_body=RecipeSerializer,
        responses={
            201: RecipeSerializer(),
            400: "Validation error"
        }
    )
    def post(self, request):
        serializer = RecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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
    
    
    def patch(self, request, id):
        from ..models import Recipe 
        try:
            recipe = recipe_service.get_recipes(id)
        except Recipe.DoesNotExist:
            raise NotFound("Recipe not found")

        serializer = RecipeSerializer(recipe, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
