from api.repositories.favourites_repository import add_favorite, remove_favorite, list_favorites
from api.models import SystemUser

def favorite_add(user: SystemUser, recipe_id: int):
    return add_favorite(user, recipe_id)

def favorite_remove(user: SystemUser, recipe_id: int) -> bool:
    return remove_favorite(user, recipe_id)

def favorite_list(user: SystemUser):
    return list_favorites(user)
