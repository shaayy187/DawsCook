from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.serializer import RecipeSerializer
from api.services.favourites_service import favorite_add, favorite_remove, favorite_list
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from api.models import *
from api.serializer import *

class FavouriteListView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_id="list_favourites",
        operation_description="Return the current user's favourite recipes.",
        tags=["Favourites"],
        responses={200: openapi.Response("OK", RecipeSerializer(many=True))},
    )
    def get(self, request, recipe_id=None):
        if recipe_id is None:
            qs = favorite_list(request.user)
            data = RecipeSerializer(qs, many=True, context={'request': request}).data
            return Response(data, status=200)
        exists = Favourites.objects.filter(user=request.user, recipe_id=recipe_id).exists()
        if not exists:
            return Response(status=status.HTTP_404_NOT_FOUND)
        fav = Favourites.objects.select_related("recipe").get(user=request.user, recipe_id=recipe_id)
        data = FavoriteSerializer(fav, context={'request': request}).data
        return Response(data, status=200)

    @swagger_auto_schema(
        operation_id="add_favourite",
        operation_description="Add a recipe to the current user's favourites.",
        tags=["Favourites"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["recipe"],
            properties={
                "recipe": openapi.Schema(type=openapi.TYPE_INTEGER, description="Recipe ID")
            },
            example={"recipe": 123},
        ),
        responses={
            201: "Added to favourites",
            400: "Missing 'recipe'",
        },
    )
    def post(self, request):
        recipe_id = request.data.get("recipe")
        if not recipe_id:
            return Response({"detail": "Missing 'recipe'."}, status=400)
        favorite_add(request.user, int(recipe_id))
        return Response({"detail": "Added to favorites"}, status=201)

    @swagger_auto_schema(
        operation_id="remove_favourite",
        operation_description="Remove a recipe from the current user's favourites.",
        tags=["Favourites"],
        manual_parameters=[
            openapi.Parameter("recipe_id", openapi.IN_PATH, description="Recipe ID", type=openapi.TYPE_INTEGER),
        ],
        responses={
            204: "Removed",
            404: "Not found",
        },
    )
    def delete(self, request, recipe_id: int):
        ok = favorite_remove(request.user, int(recipe_id))
        return Response(status=status.HTTP_204_NO_CONTENT if ok else status.HTTP_404_NOT_FOUND)
