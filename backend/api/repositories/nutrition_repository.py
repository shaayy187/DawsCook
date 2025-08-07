from ..models import Nutrition
from django.shortcuts import get_object_or_404

def get_nutrition(nutrition_id):
    return get_object_or_404(Nutrition, id=nutrition_id)

def delete_nutrition(nutrition):
    nutrition.delete()
