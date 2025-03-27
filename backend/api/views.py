from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Recipe, Category, SystemUser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .serializer import RecipeSerializer, UserSerializer, CategorySerializer
from rest_framework import status

@permission_classes([AllowAny])
class RecipeView(APIView):
    def get(self, request):
        recipes = Recipe.objects.all()
        serializer = RecipeSerializer(recipes, many=True) 
        return Response({"recipes": serializer.data})  
    
    def post(self, request):
        serializer = RecipeSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@permission_classes([AllowAny])
class Register(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({
                "success": True,
                "message": "User registered successfully"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@permission_classes([AllowAny])
class CategoryView(APIView):
    def get(self, request, id=None):
        if id:
            try:
                category = Category.objects.get(id=id)
                serializer = CategorySerializer(category)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Category.DoesNotExist:
                return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            categories = Category.objects.all()
            serializer = CategorySerializer(categories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

