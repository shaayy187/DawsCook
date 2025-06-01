from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from ..services import nutrition_service

class NutritionAdminView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_description="Admin: Create a new nutrition.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "recipe": openapi.Schema(type=openapi.TYPE_INTEGER, description="ID of recipe"),
                "kcal": openapi.Schema(type=openapi.TYPE_NUMBER),
                "fat": openapi.Schema(type=openapi.TYPE_NUMBER),
                "saturates": openapi.Schema(type=openapi.TYPE_NUMBER),
                "carbs": openapi.Schema(type=openapi.TYPE_NUMBER),
                "sugars": openapi.Schema(type=openapi.TYPE_NUMBER),
                "fibre": openapi.Schema(type=openapi.TYPE_NUMBER),
                "protein": openapi.Schema(type=openapi.TYPE_NUMBER),
                "salt": openapi.Schema(type=openapi.TYPE_NUMBER)
            },
            required=["recipe"]
        ),
        responses={201: "Nutrition created successfully"}
    )
    def post(self, request):
        new_nutrition = nutrition_service.create_nutrition(request.data)
        return Response(new_nutrition, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_description="Admin: Update a nutrition.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Nutrition ID", type=openapi.TYPE_INTEGER)
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "kcal": openapi.Schema(type=openapi.TYPE_NUMBER),
                "fat": openapi.Schema(type=openapi.TYPE_NUMBER),
                "saturates": openapi.Schema(type=openapi.TYPE_NUMBER),
                "carbs": openapi.Schema(type=openapi.TYPE_NUMBER),
                "sugars": openapi.Schema(type=openapi.TYPE_NUMBER),
                "fibre": openapi.Schema(type=openapi.TYPE_NUMBER),
                "protein": openapi.Schema(type=openapi.TYPE_NUMBER),
                "salt": openapi.Schema(type=openapi.TYPE_NUMBER)
            }
        ),
        responses={200: "Nutrition updated successfully"}
    )
    def patch(self, request, id):
        updated_nutrition = nutrition_service.update_nutrition(id, request.data)
        return Response(updated_nutrition, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Admin: Delete a nutrition.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Nutrition ID", type=openapi.TYPE_INTEGER)
        ],
        responses={204: "Nutrition deleted successfully"}
    )
    def delete(self, request, id):
        nutrition_service.delete_nutrition(id)
        return Response(status=status.HTTP_204_NO_CONTENT)
