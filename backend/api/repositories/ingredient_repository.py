from ..models import Ingredient
from django.shortcuts import get_object_or_404

def create_ingredient(data):
    return Ingredient.objects.create(**data)

def get_ingredient(ingredient_id):
    return get_object_or_404(Ingredient, id=ingredient_id)

def update_ingredient(ingredient, data):
    for attr, value in data.items():
        setattr(ingredient, attr, value)
    ingredient.save()
    return ingredient

def delete_ingredient(ingredient):
    ingredient.delete()
