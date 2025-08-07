from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound
from ..serializer import UserAllergyInfoSerializer
from ..services import user_allergy_info_service
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class UserAllergyInfoListCreate(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieves all information about users' allergys.",
        responses={200: UserAllergyInfoSerializer(many=True)},
    )
    def get(self, request):
        queryset = user_allergy_info_service.list_user_allergy_info(request.user)
        serializer = UserAllergyInfoSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Create a new allergy information entry for the authenticated user.",
        request_body=UserAllergyInfoSerializer,
        responses={
            201: UserAllergyInfoSerializer,
            400: "Invalid data (e.g., missing allergy_id or non-existent Allergy ID)."
        },
    )
    def post(self, request):
        new_step = user_allergy_info_service.create_user_allergy_info(request.user, request.data)
        return Response(new_step, status=status.HTTP_201_CREATED)


class UserAllergyInfoDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve a specific allergy information entry by its ID for the authenticated user.",
        manual_parameters=[
            openapi.Parameter(
                name="pk",
                in_=openapi.IN_PATH,
                description="ID of the allergy information entry",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: UserAllergyInfoSerializer,
            404: "Not found"
        },
    )
    def get(self, request, pk):
        instance = user_allergy_info_service.list_user_allergy_info(request.user).filter(pk=pk).first()
        if not instance:
            raise NotFound("Not found.")
        serializer = UserAllergyInfoSerializer(instance)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Update selected fields (power, symptoms, treatment) of an allergy information entry for the authenticated user.",
        manual_parameters=[
            openapi.Parameter(
                name="pk",
                in_=openapi.IN_PATH,
                description="ID of the allergy information entry to update",
                type=openapi.TYPE_INTEGER
            )
        ],
        request_body=UserAllergyInfoSerializer,
        responses={
            200: UserAllergyInfoSerializer,
            400: "Invalid data",
            404: "Not found"
        },
    )
    def patch(self, request, pk):
        updated_step = user_allergy_info_service.update_user_allergy_info(request.user, pk, request.data)
        return Response(updated_step, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Delete an allergy information entry by its ID for the authenticated user.",
        manual_parameters=[
            openapi.Parameter(
                name="pk",
                in_=openapi.IN_PATH,
                description="ID of the allergy information entry to delete",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            204: "Deleted successfully",
            404: "Not found"
        },
    )
    def delete(self, request, pk):
        user_allergy_info_service.delete_user_allergy_info(request.user, pk)
        return Response(status=status.HTTP_204_NO_CONTENT)