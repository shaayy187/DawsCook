from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.exceptions import NotFound
from ..serializer import RecipeSerializer, RatingSerializer
from ..services import recipe_service
from ..models import Recipe
from rest_framework.generics import ListCreateAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

@swagger_auto_schema(
    operation_description="Retrieve and create recipes with pagination, filtering and search."
)
class RecipeView(ListCreateAPIView):

    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = ['difficulty', 'category']
    ordering_fields = ['rating', 'recipe']
    search_fields = ['recipe', 'description']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()] 
        return [AllowAny()] 


class RecipeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Retrieve a single recipe by ID. Requires authentication.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="Recipe ID", type=openapi.TYPE_INTEGER)
        ],
        responses={
            200: RecipeSerializer(),
            404: "Recipe not found"
        }
    )
    def get(self, request, id):
        recipe = recipe_service.get_recipes(id)
        if not recipe:
            raise NotFound("Recipe not found")
        return Response(recipe, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
    operation_description="Update a recipe by ID.",
    request_body=RecipeSerializer,
    responses={
        200: RecipeSerializer(),
        400: "Validation error",
        404: "Recipe not found"
        }
    )   
    def patch(self, request, id):
        if not request.user.is_superuser:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        if not request.data:
            return Response({"detail": "No data provided."}, status=status.HTTP_400_BAD_REQUEST)
        updated_recipe = recipe_service.update_recipe(id, request.data)
        return Response(updated_recipe, status=status.HTTP_200_OK)

class RecipeRatingView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Submit or update your rating (1..5) for a given recipe. Returns full Recipe with updated avg_rating.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["value"],
            properties={
                "value": openapi.Schema(type=openapi.TYPE_INTEGER, description="Rating from 1 to 5")
            },
        ),
        responses={
            200: RecipeSerializer(),
            400: "Invalid payload",
            404: "Recipe not found"
        }
    )
    def post(self, request, id):
        serializer = RatingSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        recipe = Recipe.objects.get(pk=id)
        out = RecipeSerializer(recipe, context={'request': request})
        return Response(out.data, status=status.HTTP_200_OK)