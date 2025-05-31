from ..models import Allergy
from ..serializer import AllergySerializer

def get_all_allergies():
    allergies = Allergy.objects.all()
    serializer = AllergySerializer(allergies, many=True)
    return serializer.data