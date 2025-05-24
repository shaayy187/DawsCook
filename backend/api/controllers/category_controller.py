from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..serializer import CategorySerializer
from ..services import category_service

class CategoryView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Retrieve a list of all categories or a specific category by ID.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_QUERY, description="Category ID", type=openapi.TYPE_INTEGER)
        ],
        responses={
            200: CategorySerializer(many=True),
            404: "Category not found"
        }
    )
    def get(self, request, id=None):
        categories = category_service.get_categories(id)
        return Response(categories, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Create a new category.",
        request_body=CategorySerializer,
        responses={
            201: CategorySerializer(),
            400: "Validation error"
        }
    )
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @swagger_auto_schema(
        operation_description="Update a category by ID.",
        request_body=CategorySerializer,
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Category ID", type=openapi.TYPE_INTEGER)
        ],
        responses={
            200: CategorySerializer(),
            400: "Validation error",
            404: "Category not found"
        }
    )
    def put(self, request, id):
        from ..models import Category 

        try:
            category = category_service.get_categories(id)
        except:
            return Response({"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

        from ..repositories import category_repository
        instance = category_repository.get_category_by_id(id)
        if not instance:
            return Response({"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_200_OK)
    
