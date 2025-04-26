from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..serializer import CategorySerializer
from ..services import category_service

@permission_classes([AllowAny])
class CategoryView(APIView):

    @swagger_auto_schema(
        operation_description="Retrieve a category by ID or return all categories if no ID is provided.",
        responses={
            200: CategorySerializer(many=True),
            404: 'Category not found',
            400: 'Bad request'
        },
        manual_parameters=[
            openapi.Parameter(
                'id', openapi.IN_QUERY, description="Optional category ID to retrieve a single category", type=openapi.TYPE_INTEGER
            )
        ]
    )
    def get(self, request, id=None):
        categories = category_service.get_categories(id)
        return Response(categories, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Create a new category.",
        request_body=CategorySerializer,
        responses={
            201: CategorySerializer,
            400: 'Validation error'
        }
    )
    def post(self, request):
        category = category_service.create_category(request.data)
        return Response(category, status=status.HTTP_201_CREATED)
