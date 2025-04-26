from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializer import RecipeSerializer, UserSerializer, CategorySerializer
from .services import recipe_service, user_service, category_service


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


@permission_classes([AllowAny])
class Register(APIView):

    @swagger_auto_schema(
        operation_description="Register a new user.",
        request_body=UserSerializer,
        responses={201: openapi.Response("User registered successfully")}
    )
    def post(self, request):
        result = user_service.register_user(request.data)
        return Response(result, status=status.HTTP_201_CREATED)


@permission_classes([AllowAny])
class CategoryView(APIView):

    @swagger_auto_schema(
        operation_description="Retrieve a category by ID or return all categories if no ID is provided.",
        responses={200: CategorySerializer(many=True)},
        manual_parameters=[
            openapi.Parameter(
                'id', openapi.IN_QUERY, description="Optional category ID to retrieve a single category", type=openapi.TYPE_INTEGER
            )
        ]
    )
    def get(self, request, id=None):
        categories = category_service.get_categories(id)
        return Response(categories, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Create a new category.",
        request_body=CategorySerializer,
        responses={201: CategorySerializer}
    )
    def post(self, request):
        category = category_service.create_category(request.data)
        return Response(category, status=status.HTTP_201_CREATED)
