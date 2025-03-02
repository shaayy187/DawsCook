from django.urls import path
from . import views
from . views import *

urlpatterns = [
    path('users/', RecipeView.as_view(), name='recipe'),  # ✅ Poprawnie
]
