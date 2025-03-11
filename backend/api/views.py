from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Recipe
from .serializer import RecipeSerializer
from rest_framework import status

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
