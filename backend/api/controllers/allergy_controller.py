from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import permission_classes
from drf_yasg import openapi
from rest_framework.exceptions import NotFound
from ..serializer import AllergySerializer
from ..services import allergy_service

class AllergyView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Get list of all allergies.",
        responses={200: AllergySerializer(many=True)}
    )
    def get(self, request):
        allergies = allergy_service.get_allergies()
        if not allergies:
            raise NotFound("No allergies found")
        return Response(allergies, status=status.HTTP_200_OK)

    
   