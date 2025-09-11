import base64
from dataclasses import dataclass
from django.core.exceptions import PermissionDenied
from rest_framework.exceptions import ValidationError, NotFound
from api.models import Recipe
from api.repositories import image_gallery_repository
from api.serializer import GalleryImageSerializer

@dataclass
class CreateGalleryPayload:
    user: any
    recipe_id: int
    image_upload: str
    caption: str = ""
    content_type: str = "image/jpeg"

def serialize_gi(obj):
    return GalleryImageSerializer(obj).data

def get_gallery(recipe_id: int):
    return {"images": [serialize_gi(x) for x in image_gallery_repository.list_for_recipe(recipe_id)]}

def get_gallery_item(image_id: int):
    obj = image_gallery_repository.get_by_id(image_id)
    if not obj:
        raise NotFound("Image not found")
    return serialize_gi(obj)

def create_gallery_image(data: CreateGalleryPayload):
    if not data.image_upload:
        raise ValidationError("image_upload is required")
    try:
        img_bytes = base64.b64decode(data.image_upload)
    except Exception:
        raise ValidationError("image_upload must be valid base64")

    try:
        recipe = Recipe.objects.get(pk=data.recipe_id)
    except Recipe.DoesNotExist:
        raise NotFound("Recipe not found")

    obj = image_gallery_repository.create_image(
        user=data.user, recipe=recipe, image_bytes=img_bytes,
        content_type=data.content_type or "image/jpeg", caption=data.caption or ""
    )
    return serialize_gi(obj)

def delete_gallery_image(image_id: int, user):
    obj = image_gallery_repository.get_by_id(image_id)
    if not obj:
        raise NotFound("Image not found")
    if not (obj.user_id == user.id or getattr(user, "is_superuser", False)):
        raise PermissionDenied("Forbidden")
    image_gallery_repository.delete_image(obj)
    return True
