from ..repositories import allergy_repository
from ..serializer import AllergySerializer
from rest_framework.exceptions import NotFound

def get_allergies():
        category = allergy_repository.get_all_allergies()
        serializer=AllergySerializer(category, many=True)
        return serializer.data