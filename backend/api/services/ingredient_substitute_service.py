from rest_framework.exceptions import NotFound
from api.repositories import ingredient_substitute_repository
from ..serializer import IngredientSubstituteSerializer

def get_recipe_substitutes_map(recipe_id: int) -> dict:
    if not ingredient_substitute_repository.recipe_exists(recipe_id):
        raise NotFound("Recipe not found")

    qs = ingredient_substitute_repository.get_substitutes_for_recipe(recipe_id)
    out: dict[int, list[dict]] = {}

    for sub in qs:
        ser = IngredientSubstituteSerializer(sub).data
        out.setdefault(sub.ingredient_id, []).append(ser)

    return out
