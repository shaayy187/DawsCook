from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken
from ..serializer import UserSerializer
from ..services import user_service
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
    operation_description="Change the authenticated user's password.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=["old_password", "new_password"],
        properties={
            "old_password": openapi.Schema(type=openapi.TYPE_STRING, description="Current password"),
            "new_password": openapi.Schema(type=openapi.TYPE_STRING, description="New password")
        },
    ),
    responses={
        200: openapi.Response(description="Password changed successfully."),
        400: openapi.Response(description="Password change failed. Invalid credentials or validation error.")
    }
    )
    def post(self, request):
        result = user_service.change_password(request.user, request.data)
        if result["success"]:
            return Response({"detail": result["message"]}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": result["message"]}, status=status.HTTP_400_BAD_REQUEST)

class ChangeEmailView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Change the authenticated user's email.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["new_email", "confirm_email"],
            properties={
                "new_email":     openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
                "confirm_email": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
            },
        ),
        responses={
            200: openapi.Response(description="Email changed successfully."),
            400: openapi.Response(description="Validation error or mismatch.")
        }
    )
    def post(self, request):
        result = user_service.change_email(request.user, request.data)
        if result["success"]:
            return Response({"detail": result["message"]}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": result["message"]}, status=status.HTTP_400_BAD_REQUEST)

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
    

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        token = request.data.get("id_token") or request.data.get("credential")
        if not token:
            return Response({"detail": "Missing id_token"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            info = id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
            if not info.get("email_verified"):
                return Response({"detail": "Email not verified"}, status=status.HTTP_400_BAD_REQUEST)
            email = info.get("email")
            if not email:
                return Response({"detail": "No email in token"}, status=status.HTTP_400_BAD_REQUEST)

            user, created = User.objects.get_or_create(
                email=email, defaults={"username": email.split("@")[0]}
            )
            if created:
                user.set_unusable_password()
                user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_new": created
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({"detail": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)