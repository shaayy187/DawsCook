from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from ..serializer import CategorySerializer
from ..services import category_service

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Public: Get all categories.",
        responses={200: CategorySerializer(many=True)}
    )
    def get(self, request):
        categories = category_service.get_categories()
        return Response(categories, status=status.HTTP_200_OK)


class CategoryDetailPublicView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Public: Get a specific category by ID.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Category ID", type=openapi.TYPE_INTEGER)
        ],
        responses={200: CategorySerializer(), 404: "Not found"}
    )
    def get(self, request, id):
        category = category_service.get_categories(id)
        return Response(category, status=status.HTTP_200_OK)


class CategoryAdminView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
        operation_description="Admin: Create a new category.",
        request_body=CategorySerializer,
        responses={201: CategorySerializer(), 400: "Validation error"}
    )
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created = category_service.create_category(request.data)
        return Response(created, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        operation_description="Admin: Update a category by ID.",
        request_body=CategorySerializer,
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Category ID", type=openapi.TYPE_INTEGER)
        ],
        responses={200: CategorySerializer(), 400: "Validation error", 404: "Not found"}
    )
    def put(self, request, id):
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = category_service.update_category(id, request.data)
        return Response(updated, status=status.HTTP_200_OK)
