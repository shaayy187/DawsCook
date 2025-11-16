from ..models import Recipe
from typing import Iterable, List, Optional
from api.services.recipe_search_service import RecipeSearchParams, search_recipes
from django.shortcuts import get_object_or_404
from ..models import Recipe

def get_all_recipes():
    return Recipe.objects.all()

def get_recipe_by_id(recipe_id):
    return Recipe.objects.filter(id=recipe_id).first()

def update_recipe(instance, validated_data):
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    instance.save()
    return instance

def search_by_params(params: RecipeSearchParams):
    qs = search_recipes(params)
    return list(qs)

def filter_by_max_time(recipes, max_time_minutes):
    if not max_time_minutes:
        return list(recipes)
    out = []
    for r in recipes:
        ct = getattr(r, "cooking_time", None)
        if ct is None:
            continue
        minutes = int(ct) // 60
        if minutes <= int(max_time_minutes):
            out.append(r)
    return out

def get_with_ingredients_or_404(recipe_id: int) -> Recipe:
    return get_object_or_404(
        Recipe.objects.prefetch_related("ingredients"),
        pk=recipe_id
    )