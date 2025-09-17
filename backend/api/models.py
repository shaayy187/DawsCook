from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils import timezone
# Create your models here.

class Allergy(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=30) 
    image = models.BinaryField(blank=True, null=True)

    def __str__(self):
        return self.name
    
class Recipe(models.Model):
    recipe = models.CharField(max_length=30, db_index=True)
    difficulty = models.CharField(max_length=30)
    allergies = models.ManyToManyField(Allergy, related_name="recipes", blank=True)
    rating = models.FloatField(default=0, blank=True, db_index=True)
    image = models.BinaryField(blank=True, null=True)
    description = models.CharField(max_length=600, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='recipes', blank=True, null=True)
    created = models.DateTimeField(default=timezone.now)
    cooking_time = models.IntegerField(default=0, blank=True, null=True)
    spoonacular_id = models.IntegerField(null=True, blank=True, unique=True)

    def __str__(self):
        return self.recipe


class UserAllergyInfo(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user_allergy_info")
    allergy = models.ForeignKey(Allergy, on_delete=models.CASCADE, related_name="user_allergy_info")
    power = models.CharField( max_length=100, blank=True)
    symptoms = models.TextField(blank=True)
    treatment = models.TextField(blank=True)

    class Meta:
        unique_together = ("user", "allergy")

    def __str__(self):
        return f"{self.user.username} – {self.allergy.name}"

class Rating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    value = models.IntegerField()

    class Meta:
        unique_together = ('user', 'recipe')

    def __str__(self):
        return f"{self.user.username} → {self.recipe.recipe}: {self.value}"

class SystemUser(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.BinaryField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    pronouns = models.CharField(blank=True, max_length=30)
    allergies = models.ManyToManyField(Allergy, related_name='users', blank=True)
    groups = models.ManyToManyField(Group, related_name="custom_user_set", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="custom_user_permissions_set",  blank=True)

class Comment(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(SystemUser, on_delete=models.CASCADE)
    text = models.TextField()
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="replies")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.user.username}: {self.text[:30]}"

class Ingredient(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    amount = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=20, blank=True)
    note = models.CharField(max_length=120, blank=True)
    quantity = models.CharField(max_length=50)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')

    def __str__(self):
        return f"{self.quantity} {self.name}"

class Nutrition(models.Model):
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, related_name='nutrition')
    kcal = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    saturates = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    sugars = models.FloatField(default=0)
    fibre = models.FloatField(default=0)
    protein = models.FloatField(default=0)
    salt = models.FloatField(default=0)

class Step(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="steps")
    step_number = models.PositiveIntegerField(db_index=True)
    instruction = models.TextField()
    image = models.BinaryField(blank=True, null=True)

    class Meta:
        ordering = ['step_number']

class GalleryImage(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="gallery_images")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="gallery_images")
    image = models.BinaryField()
    content_type = models.CharField(max_length=64, default="image/jpeg")
    caption = models.CharField(max_length=160, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]
        indexes = [models.Index(fields=["recipe", "created"])]

class IngredientSubstitute(models.Model):
    ingredient = models.ForeignKey("Ingredient", on_delete=models.CASCADE, related_name="substitutes")
    name = models.CharField(max_length=120)
    ratio = models.FloatField(default=1.0)
    note = models.CharField(max_length=200, blank=True)
    replaces_allergy = models.ForeignKey("Allergy", null=True, blank=True, on_delete=models.SET_NULL)
    priority = models.PositiveIntegerField(default=10)

    def __str__(self):
        return f"{self.name} for {self.ingredient.name}"

