from ..models import IngredientSubstitute, Recipe

def recipe_exists(recipe_id: int) -> bool:
    return Recipe.objects.filter(id=recipe_id).exists()

def get_substitutes_for_recipe(recipe_id: int):
    return (
        IngredientSubstitute.objects
        .filter(ingredient__recipe_id=recipe_id)
        .select_related("ingredient", "replaces_allergy")
        .order_by("priority", "id")
    )
