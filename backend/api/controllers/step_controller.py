from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from ..services import step_service
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

class StepDetailView(APIView):
    permission_classes = [IsAdminUser]

    @swagger_auto_schema(
    operation_description="Admin: Update a specific step of a recipe.",
    manual_parameters=[
        openapi.Parameter(
            'id', openapi.IN_PATH,
            description="ID of the step to update",
            type=openapi.TYPE_INTEGER
        )
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "step_number": openapi.Schema(type=openapi.TYPE_INTEGER, description="Updated step number"),
            "instruction": openapi.Schema(type=openapi.TYPE_STRING, description="Updated instruction text"),
            "image_upload": openapi.Schema(type=openapi.TYPE_STRING, description="Base64-encoded image (optional)")
        },
        required=["instruction"]
    ),
    responses={
        200: openapi.Response(description="Step updated successfully"),
        400: openapi.Response(description="Invalid input"),
        403: openapi.Response(description="Only admins can update steps"),
        404: openapi.Response(description="Step not found"),
    }
    )
    def patch(self, request, id):
        updated_step = step_service.update_step(id, request.data)
        return Response(updated_step, status=status.HTTP_200_OK)
