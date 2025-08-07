from ..models import Ingredient
from django.shortcuts import get_object_or_404

def get_ingredient(ingredient_id):
    return get_object_or_404(Ingredient, id=ingredient_id)

def delete_ingredient(ingredient):
    ingredient.delete()
