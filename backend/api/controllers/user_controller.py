from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..serializer import UserSerializer
from ..services import user_service


class Register(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_description="Register a new user.",
        request_body=UserSerializer,
        responses={
            201: UserSerializer(),
            400: "Validation error"
        }
    )
    def post(self, request):
        result = user_service.register_user(request.data)
        return Response(result, status=status.HTTP_201_CREATED)
    

class UserProfile(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get the authenticated user's profile.",
        responses={
            200: UserSerializer()
        }
    )
    def get(self, request):
        user_data = user_service.get_user_profile(request.user)
        return Response(user_data)

    @swagger_auto_schema(
        operation_description="Update the authenticated user's profile.",
        request_body=UserSerializer,
        responses={
            200: UserSerializer(),
            400: "Validation error"
        }
    )
    def patch(self, request):
        updated_user = user_service.update_user_profile(request.user, request.data)
        return Response(updated_user)