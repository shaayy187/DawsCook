from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..serializer import UserSerializer
from ..services import user_service

@permission_classes([AllowAny])
class Register(APIView):

    @swagger_auto_schema(
        operation_description="Register a new user.",
        request_body=UserSerializer,
        responses={201: openapi.Response("User registered successfully")}
    )
    def post(self, request):
        result = user_service.register_user(request.data)
        return Response(result, status=status.HTTP_201_CREATED)
