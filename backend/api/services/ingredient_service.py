from ..repositories import ingredient_repository
from ..serializer import IngredientSerializer

def create_ingredient(data):
    payload = {
        "recipe": data.get("recipe"),
        "name": data.get("name"),
        "amount": data.get("amount"),
        "unit": data.get("unit", "") or "",
        "note": data.get("note", "") or "",
        "quantity": data.get("quantity", ""),
    }
    ser = IngredientSerializer(data=payload)
    ser.is_valid(raise_exception=True)
    ser.save()
    return ser.data

def update_ingredient(ingredient_id, data):
    ingredient = ingredient_repository.get_ingredient(ingredient_id)
    serializer = IngredientSerializer(ingredient, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    ingredient = serializer.save()
    return serializer.data

def delete_ingredient(ingredient_id):
    ingredient = ingredient_repository.get_ingredient(ingredient_id)
    ingredient_repository.delete_ingredient(ingredient)
