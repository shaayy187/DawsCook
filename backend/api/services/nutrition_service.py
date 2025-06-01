from ..repositories import nutrition_repository
from ..serializer import NutritionSerializer

def create_nutrition(data):
    serializer = NutritionSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    nutrition = serializer.save()
    return serializer.data

def update_nutrition(nutrition_id, data):
    nutrition = nutrition_repository.get_nutrition(nutrition_id)
    serializer = NutritionSerializer(nutrition, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    nutrition = serializer.save()
    return serializer.data

def delete_nutrition(nutrition_id):
    nutrition = nutrition_repository.get_nutrition(nutrition_id)
    nutrition_repository.delete_nutrition(nutrition)
