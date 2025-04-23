from .models import Recipe, Category, SystemUser
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .serializer import RecipeSerializer, UserSerializer, CategorySerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404


@permission_classes([AllowAny])
class RecipeView(APIView):
    def get(self, request, id=None): 
        if id is not None:
            recipe = get_object_or_404(Recipe, id=id)
            serializer = RecipeSerializer(recipe)
            return Response(serializer.data, status=status.HTTP_200_OK)

        recipes = Recipe.objects.all()
        serializer = RecipeSerializer(recipes, many=True)
        return Response({"recipes": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = RecipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@permission_classes([AllowAny])
class Register(APIView):
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
    def get(self, request, id=None):
        if id:
            category = get_object_or_404(Category, id=id)
            serializer = CategorySerializer(category)
            return Response(serializer.data, status=status.HTTP_200_OK)

        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


