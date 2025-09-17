from django import forms
from api.models import Category, Recipe, Step, GalleryImage, SystemUser

def _file_to_bytes(f):
    if not f:
        return None
    return f.read()

class BinaryImageMixin:
    """
    Miks, który dodaje pole uploadu pliku i podczas clean()
    wkłada bajty do wskazanego BinaryField.
    """
    upload_field_name = "image_upload"
    model_binary_field = "image"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.upload_field_name] = forms.FileField(
            required=False, label="Image (file upload)"
        )

    def clean(self):
        cleaned = super().clean()
        f = self.files.get(self.upload_field_name)
        if f:
            cleaned[self.model_binary_field] = _file_to_bytes(f)
        return cleaned

class CategoryForm(BinaryImageMixin, forms.ModelForm):
    class Meta:
        model = Category
        fields = ["name"]

class RecipeForm(BinaryImageMixin, forms.ModelForm):
    class Meta:
        model = Recipe
        fields = [
            "recipe", "difficulty", "description",
            "category", "cooking_time", "spoonacular_id",
            "allergies",
        ]

class StepForm(BinaryImageMixin, forms.ModelForm):
    class Meta:
        model = Step
        fields = ["recipe", "step_number", "instruction"]

class GalleryImageForm(BinaryImageMixin, forms.ModelForm):
    class Meta:
        model = GalleryImage
        fields = ["recipe", "user", "caption", "content_type"]

class SystemUserAvatarForm(BinaryImageMixin, forms.ModelForm):
    model_binary_field = "avatar"

    class Meta:
        model = SystemUser
        fields = ["username", "email", "first_name", "last_name", "age", "pronouns", "allergies", "is_superuser"]
