from django.urls import path
from . import views
from . views import *

urlpatterns = [
    path('recipes/', RecipeView.as_view(), name='recipe'), 
]
