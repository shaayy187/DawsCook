from django.core.exceptions import ObjectDoesNotExist
from ..models import Comment, Recipe

def get_comment_by_id(comment_id: int) -> Comment:
    return Comment.objects.get(pk=comment_id)

def create_comment_entry(user, recipe, text: str, parent=None) -> Comment:
    return Comment.objects.create(
        user=user,
        recipe=recipe,
        text=text,
        parent=parent
    )

def update_comment_entry(comment: Comment, new_text: str = None, new_parent=None) -> Comment:
    if new_text is not None:
        comment.text = new_text
    comment.parent = new_parent
    comment.save()
    return comment

def delete_comment_entry(comment: Comment) -> None:
    comment.delete()
