from django.core.exceptions import ObjectDoesNotExist
from ..models import Comment, Recipe
from rest_framework.exceptions import ValidationError

def create_comment(data: dict, user):
    recipe_id = data.get("recipe")
    text = data.get("text", "").strip()
    parent_id = data.get("parent", None)

    if recipe_id is None:
        raise ValidationError({"recipe": "This field is required."})
    if not text:
        raise ValidationError({"text": "This field may not be blank."})

    try:
        recipe = Recipe.objects.get(pk=recipe_id)
    except Recipe.DoesNotExist as e:
        raise ValidationError({"recipe": f"Recipe with id={recipe_id} does not exist."})

    parent_comment = None
    if parent_id is not None:
        try:
            parent_comment = Comment.objects.get(pk=parent_id)
        except Comment.DoesNotExist:
            raise ValidationError({"parent": f"Parent comment with id={parent_id} does not exist."})

    new_comment = Comment.objects.create(
        user=user,
        recipe=recipe,
        text=text,
        parent=parent_comment
    )
    return new_comment


def update_comment(comment_id: int, data: dict):
    try:
        comment = Comment.objects.get(pk=comment_id)
    except Comment.DoesNotExist:
        raise ValidationError({"detail": f"Comment with id={comment_id} not found."})

    new_text = data.get("text", None)
    if new_text is not None:
        new_text = new_text.strip()
        if not new_text:
            raise ValidationError({"text": "Text cannot be blank."})
        comment.text = new_text

    if "parent" in data:
        parent_id = data.get("parent")
        if parent_id is None:
            comment.parent = None
        else:
            try:
                parent_comment = Comment.objects.get(pk=parent_id)
            except Comment.DoesNotExist:
                raise ValidationError({"parent": f"Parent comment with id={parent_id} does not exist."})
            comment.parent = parent_comment

    comment.save()
    return comment


def delete_comment(comment_id: int):
    try:
        comment = Comment.objects.get(pk=comment_id)
    except Comment.DoesNotExist:
        raise ValidationError({"detail": f"Comment with id={comment_id} not found."})
    comment.delete()
    return None
