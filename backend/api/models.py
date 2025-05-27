from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
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

    def __str__(self):
        return self.recipe

class SystemUser(AbstractUser):
    email = models.EmailField(unique=True)
    image = models.BinaryField(blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    pronouns = models.CharField(blank=True, max_length=30)
    groups = models.ManyToManyField( 
        Group,
        related_name="custom_user_set", 
        blank=True,
    )
    user_permissions = models.ManyToManyField( 
        Permission,
        related_name="custom_user_permissions_set",  
        blank=True,
    )

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