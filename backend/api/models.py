from django.db import models

# Create your models here.

class Recipe(models.Model):
    recipe = models.CharField(max_length=30)
    difficulty = models.CharField(max_length=30)