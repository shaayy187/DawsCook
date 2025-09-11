from typing import Iterable, Optional
from api.models import GalleryImage, Recipe

def list_for_recipe(recipe_id: int) -> Iterable[GalleryImage]:
    return (GalleryImage.objects
            .select_related("user", "recipe")
            .filter(recipe_id=recipe_id)
            .order_by("-created"))

def get_by_id(image_id: int) -> Optional[GalleryImage]:
    try:
        return GalleryImage.objects.select_related("user", "recipe").get(pk=image_id)
    except GalleryImage.DoesNotExist:
        return None

def create_image(*, user, recipe: Recipe, image_bytes: bytes, content_type: str, caption: str = "") -> GalleryImage:
    return GalleryImage.objects.create(
        user=user, recipe=recipe, image=image_bytes,
        content_type=content_type or "image/jpeg", caption=caption or ""
    )

def delete_image(instance: GalleryImage) -> None:
    instance.delete()
