from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
# Create your models here.

class Recipe(models.Model):
    recipe = models.CharField(max_length=30)
    difficulty = models.CharField(max_length=30)

class Category(models.Model):
    name = models.CharField(max_length=30) 
    image = models.BinaryField(blank=True, null=True)

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

