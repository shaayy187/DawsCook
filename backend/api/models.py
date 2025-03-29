from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
# Create your models here.

class Allergy(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Recipe(models.Model):
    recipe = models.CharField(max_length=30)
    difficulty = models.CharField(max_length=30)
    allergies = models.ManyToManyField(Allergy, related_name="recipes", blank=True)
    rating = models.FloatField(default=0, blank=True)

    def __str__(self):
        return self.recipe
    
class Category(models.Model):
    name = models.CharField(max_length=30) 
    image = models.BinaryField(blank=True, null=True)

    def __str__(self):
        return self.name

class SystemUser(AbstractUser):
    email = models.EmailField(unique=True)
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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.text[:30]}"
