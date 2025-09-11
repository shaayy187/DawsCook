from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticatedOrReadOnly
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.exceptions import NotFound, ValidationError
from api.serializer import GalleryImageSerializer
from api.services import image_gallery_service
from api.services.image_gallery_service import CreateGalleryPayload

class RecipeGalleryView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        operation_description="List gallery images for a recipe.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Recipe ID", type=openapi.TYPE_INTEGER)
        ],
        responses={200: openapi.Response("OK", GalleryImageSerializer(many=True))}
    )
    def get(self, request, id):
        data = image_gallery_service.get_gallery(id)
        return Response(data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Create gallery image for a recipe. Requires authentication.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["image_upload"],
            properties={
                "image_upload": openapi.Schema(type=openapi.TYPE_STRING, description="raw base64 (no data: prefix)"),
                "caption": openapi.Schema(type=openapi.TYPE_STRING),
                "content_type": openapi.Schema(type=openapi.TYPE_STRING, default="image/jpeg"),
            },
        ),
        responses={201: GalleryImageSerializer(), 400: "Validation error", 404: "Recipe not found"}
    )
    def post(self, request, id):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        payload = CreateGalleryPayload(
            user=request.user,
            recipe_id=id,
            image_upload=request.data.get("image_upload", ""),
            caption=request.data.get("caption", "") or "",
            content_type=request.data.get("content_type", "image/jpeg") or "image/jpeg",
        )
        try:
            created = image_gallery_service.create_gallery_image(payload)
            return Response(created, status=status.HTTP_201_CREATED)
        except (ValidationError, NotFound) as e:
            code = status.HTTP_404_NOT_FOUND if isinstance(e, NotFound) else status.HTTP_400_BAD_REQUEST
            return Response({"detail": str(e)}, status=code)

class GalleryDetailView(APIView):
    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [AllowAny()]

    @swagger_auto_schema(
        operation_description="Retrieve single gallery image by ID.",
        manual_parameters=[openapi.Parameter('id', openapi.IN_PATH, type=openapi.TYPE_INTEGER)],
        responses={200: GalleryImageSerializer(), 404: "Not found"}
    )
    def get(self, request, id):
        try:
            data = image_gallery_service.get_gallery_item(id)
            return Response(data, status=status.HTTP_200_OK)
        except NotFound as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        operation_description="Delete gallery image by ID (owner or admin).",
        responses={204: "No content", 401: "Auth required", 403: "Forbidden", 404: "Not found"}
    )
    def delete(self, request, id):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            image_gallery_service.delete_gallery_image(id, request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except NotFound as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            from django.core.exceptions import PermissionDenied
            if isinstance(e, PermissionDenied):
                return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
