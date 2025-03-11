from rest_framework import serializers
from . models import *

class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['recipe','difficulty']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer do odczytu danych użytkownika systemowego.
    """
    class Meta:
        model = SystemUser
        fields = ['id', 'username', 'email'] 