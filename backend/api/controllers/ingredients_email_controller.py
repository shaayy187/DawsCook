from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.exceptions import ValidationError, NotFound
from api.services.ingredient_email_service import IngredientEmailService

class EmailIngredientsController(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Send email with ingredients information to an user.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={"portion": openapi.Schema(type=openapi.TYPE_NUMBER, description="Portion quantity")},
        ),
        responses={200: openapi.Schema(type=openapi.TYPE_OBJECT, properties={"status": openapi.Schema(type=openapi.TYPE_STRING)})},
    )
    def post(self, request, id: int):
        service = IngredientEmailService()
        try:
            portion = request.data.get("portion", 1)
            result = service.send_ingredients(recipe_id=id, user=request.user, portion=portion)
            return Response(result, status=status.HTTP_200_OK)
        except ValidationError as ve:
            return Response(ve.detail, status=status.HTTP_400_BAD_REQUEST)
        except NotFound as nf:
            return Response({"detail": str(nf)}, status=status.HTTP_404_NOT_FOUND)
