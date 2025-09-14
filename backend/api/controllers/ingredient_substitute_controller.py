from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from ..services import ingredient_substitute_service

class RecipeSubstitutesView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="List substitutes grouped by ingredient for a given recipe.",
        manual_parameters=[
            openapi.Parameter(
                "id", openapi.IN_PATH, description="Recipe ID", type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                additional_properties=openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            "id": openapi.Schema(type=openapi.TYPE_INTEGER),
                            "ingredient": openapi.Schema(type=openapi.TYPE_INTEGER),
                            "name": openapi.Schema(type=openapi.TYPE_STRING),
                            "ratio": openapi.Schema(type=openapi.TYPE_NUMBER),
                            "note": openapi.Schema(type=openapi.TYPE_STRING),
                            "replaces_allergy": openapi.Schema(type=openapi.TYPE_INTEGER, nullable=True),
                            "priority": openapi.Schema(type=openapi.TYPE_INTEGER),
                        },
                    ),
                ),
                description="Map {ingredient_id: [substitute, ...]}",
            ),
            404: "Recipe not found",
        },
    )

    def get(self, request, id: int):
        data = ingredient_substitute_service.get_recipe_substitutes_map(id)
        return Response(data, status=status.HTTP_200_OK)
