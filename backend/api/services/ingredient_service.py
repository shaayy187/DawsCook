from ..repositories import ingredient_repository
from ..serializer import IngredientSerializer

def create_ingredient(data):
    serializer = IngredientSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    ingredient = serializer.save()
    return serializer.data

def update_ingredient(ingredient_id, data):
    ingredient = ingredient_repository.get_ingredient(ingredient_id)
    serializer = IngredientSerializer(ingredient, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    ingredient = serializer.save()
    return serializer.data

def delete_ingredient(ingredient_id):
    ingredient = ingredient_repository.get_ingredient(ingredient_id)
    ingredient_repository.delete_ingredient(ingredient)
