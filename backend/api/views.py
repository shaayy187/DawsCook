from django.shortcuts import render
from rest_framework.views import APIView
from . models import *
from . serializer import *
from rest_framework.response import Response

# Create your views here.

class RecipeView(APIView):
    def get(self, request):
        output = [{"recipe":output.recipe,"difficulty":output.difficulty}
                  for output in Recipe.objects.all()]
        return Response(output)
    
    def post(self, request):
        serializer = RecipeSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
