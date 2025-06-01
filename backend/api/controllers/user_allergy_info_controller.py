from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound
from ..serializer import UserAllergyInfoSerializer
from ..services import user_allergy_info_service


class UserAllergyInfoListCreate(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = user_allergy_info_service.list_user_allergy_info(request.user)
        serializer = UserAllergyInfoSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

    def get(self, request, pk):
        instance = self.get_object(pk, request.user)
        if not instance:
            raise NotFound("Not found.")
        serializer = UserAllergyInfoSerializer(instance)
        return Response(serializer.data)

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

    def delete(self, request, pk):
        instance = self.get_object(pk, request.user)
        if not instance:
            raise NotFound("Not found.")

        try:
            user_allergy_info_service.delete_user_allergy_info(request.user, pk)
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
