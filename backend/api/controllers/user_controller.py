from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..serializer import UserSerializer
from ..services import user_service

@permission_classes([AllowAny])
class Register(APIView):

    @swagger_auto_schema(
        operation_description="Register a new user.",
        request_body=UserSerializer,
        responses={
            201: openapi.Response("User registered successfully"),
            400: "Validation error"
        }
    )
    def post(self, request):
        result = user_service.register_user(request.data)
        return Response(result, status=status.HTTP_201_CREATED)
    

class UserProfile(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Receive information about exact user.",
        request_body=UserSerializer,
        responses={
            201: openapi.Response("User found."),
            400: "Validation error"
        }
    )
    def get(self, request):
        user_data = user_service.get_user_profile(request.user)
        return Response(user_data)
    
    @swagger_auto_schema(
        operation_description="Update information about user.",
        request_body=UserSerializer,
        responses={
            201: openapi.Response("Process successful!."),
            400: "Validation error"
        }
    )
    def patch(self, request):
        updated_user = user_service.update_user_profile(request.user, request.data)
        return Response(updated_user)