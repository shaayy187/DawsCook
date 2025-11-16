from ..repositories import recipe_repository
from ..serializer import RecipeSerializer
from ..models import Recipe
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404

def get_recipes(recipe_id=None):
    if recipe_id:
        recipe = recipe_repository.get_recipe_by_id(recipe_id)
        if not recipe:
            raise NotFound("Recipe not found")
        serializer = RecipeSerializer(recipe)
        return serializer.data
    else:
        recipes = recipe_repository.get_all_recipes()
        serializer = RecipeSerializer(recipes, many=True)
        return {"recipes": serializer.data}

def create_recipe(data):
    serializer = RecipeSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    recipe = serializer.save()
    return RecipeSerializer(recipe).data

def update_recipe(recipe_id, data):
    recipe = recipe_repository.get_recipe_by_id(recipe_id)
    if not recipe:
        raise NotFound("Recipe not found")

    serializer = RecipeSerializer(recipe, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    updated_recipe = serializer.save()
    return RecipeSerializer(updated_recipe).data

def get_or_404(recipe_id: int) -> Recipe:
    return get_object_or_404(Recipe, pk=recipe_id)

def get_with_ingredients(recipe_id: int) -> Recipe:
    return get_object_or_404(Recipe.objects.prefetch_related("ingredients"), pk=recipe_id)
