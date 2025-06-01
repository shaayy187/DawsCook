from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from ..services import ingredient_service

class IngredientAdminView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_description="Admin: Create a new ingredient.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "recipe": openapi.Schema(type=openapi.TYPE_INTEGER, description="ID of recipe"),
                "name": openapi.Schema(type=openapi.TYPE_STRING, description="Name of the ingredient"),
                "quantity": openapi.Schema(type=openapi.TYPE_STRING, description="Quantity")
            },
            required=["recipe", "name", "quantity"]
        ),
        responses={201: "Ingredient created successfully"}
    )
    def post(self, request):
        new_ingredient = ingredient_service.create_ingredient(request.data)
        return Response(new_ingredient, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_description="Admin: Update an ingredient.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Ingredient ID", type=openapi.TYPE_INTEGER)
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "name": openapi.Schema(type=openapi.TYPE_STRING),
                "quantity": openapi.Schema(type=openapi.TYPE_STRING)
            }
        ),
        responses={200: "Ingredient updated successfully"}
    )
    def patch(self, request, id):
        updated_ingredient = ingredient_service.update_ingredient(id, request.data)
        return Response(updated_ingredient, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Admin: Delete an ingredient.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Ingredient ID", type=openapi.TYPE_INTEGER)
        ],
        responses={204: "Ingredient deleted successfully"}
    )
    def delete(self, request, id):
        ingredient_service.delete_ingredient(id)
        return Response(status=status.HTTP_204_NO_CONTENT)
