from .models import Recipe, Category, SystemUser
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .serializer import RecipeSerializer, UserSerializer, CategorySerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

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
        if id is not None:
            recipe = get_object_or_404(Recipe, id=id)
            serializer = RecipeSerializer(recipe)
            return Response(serializer.data, status=status.HTTP_200_OK)

        recipes = Recipe.objects.all()
        serializer = RecipeSerializer(recipes, many=True)
        return Response({"recipes": serializer.data}, status=status.HTTP_200_OK)
    

    @swagger_auto_schema(
        operation_description="Create a new recipe.",
        request_body=RecipeSerializer,
        responses={201: RecipeSerializer}
    )
    def post(self, request):
        serializer = RecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@permission_classes([AllowAny])
class Register(APIView):


    @swagger_auto_schema(
        operation_description="Register a new user.",
        request_body=UserSerializer,
        responses={201: openapi.Response("User registered successfully")}
    )
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "success": True,
            "message": "User registered successfully"
        }, status=status.HTTP_201_CREATED)


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
        if id:
            category = get_object_or_404(Category, id=id)
            serializer = CategorySerializer(category)
            return Response(serializer.data, status=status.HTTP_200_OK)

        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    @swagger_auto_schema(
        operation_description="Create a new category.",
        request_body=CategorySerializer,
        responses={201: CategorySerializer}
    )
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


