from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializer import RecipeSerializer, UserSerializer, CategorySerializer
from .services import recipe_service, user_service, category_service


