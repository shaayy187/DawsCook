from ..models import Nutrition
from django.shortcuts import get_object_or_404

def create_nutrition(data):
    return Nutrition.objects.create(**data)

def get_nutrition(nutrition_id):
    return get_object_or_404(Nutrition, id=nutrition_id)

def update_nutrition(nutrition, data):
    for attr, value in data.items():
        setattr(nutrition, attr, value)
    nutrition.save()
    return nutrition

def delete_nutrition(nutrition):
    nutrition.delete()
