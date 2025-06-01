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
        serializer = UserAllergyInfoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        allergy_obj = validated.get("allergy")
        power = validated.get("power", "")
        symptoms = validated.get("symptoms", "")
        treatment = validated.get("treatment", "")

        try:
            created = user_allergy_info_service.create_user_allergy_info(
                user=request.user,
                allergy_id=allergy_obj.id,
                power=power,
                symptoms=symptoms,
                treatment=treatment
            )
        except ObjectDoesNotExist as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

        out_serializer = UserAllergyInfoSerializer(created)
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)


class UserAllergyInfoDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        return user_allergy_info_service.list_user_allergy_info(user).filter(pk=pk).first()

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
        instance = self.get_object(pk, request.user)
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
        instance = self.get_object(pk, request.user)
        if not instance:
            raise NotFound("Not found.")

        serializer = UserAllergyInfoSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_fields = {}
        for field in ("power", "symptoms", "treatment"):
            if field in serializer.validated_data:
                updated_fields[field] = serializer.validated_data[field]

        try:
            updated_instance = user_allergy_info_service.update_user_allergy_info(
                request.user,
                pk,
                updated_fields
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        out_serializer = UserAllergyInfoSerializer(updated_instance)
        return Response(out_serializer.data)

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
        instance = self.get_object(pk, request.user)
        if not instance:
            raise NotFound("Not found.")

        try:
            user_allergy_info_service.delete_user_allergy_info(request.user, pk)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
