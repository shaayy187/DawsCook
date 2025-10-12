from django.shortcuts import get_object_or_404
from api.models import Favourites, Recipe, SystemUser

def add_favorite(user: SystemUser, recipe_id: int) -> Favourites:
    recipe = get_object_or_404(Recipe, pk=recipe_id)
    obj, _ = Favourites.objects.get_or_create(user=user, recipe=recipe)
    return obj

def remove_favorite(user: SystemUser, recipe_id: int) -> bool:
    return Favourites.objects.filter(user=user, recipe_id=recipe_id).delete()[0] > 0

def list_favorites(user: SystemUser):
    return (Recipe.objects.filter(favorited_by__user=user).order_by('-favorited_by__id').distinct())
