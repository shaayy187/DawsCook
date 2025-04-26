from ..repositories import recipe_repository
from ..serializer import RecipeSerializer
from rest_framework.exceptions import NotFound

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
