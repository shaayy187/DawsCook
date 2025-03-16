from rest_framework import serializers
from . models import *

class RecipeSerializer(serializers.ModelSerializer):
    """
    Serializer do wrzucania przepisów.
    """
    class Meta:
        model = Recipe
        fields = ['id','recipe','difficulty']

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer do kategorii kulinarnych.
    """
    class Meta:
        model = Recipe
        fields = ['id','recipe','difficulty']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer do odczytu danych użytkownika systemowego.
    """
    password = serializers.CharField(write_only=True)
    class Meta:
        model = SystemUser
        fields = ['id', 'username', 'email', 'password'] 

    def create(self, validated_data):
        user = SystemUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user