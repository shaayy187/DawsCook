from ..models import Recipe
from typing import Iterable, List, Optional
from api.services.recipe_search_service import RecipeSearchParams, search_recipes

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

def filter_by_max_time(recipes: Iterable[Recipe], max_time: Optional[int]):
    if not max_time:
        return list(recipes)
    return [r for r in recipes if (r.cooking_time or 9999) <= int(max_time)]