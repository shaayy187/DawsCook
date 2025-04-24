from django.urls import path
from . import views
from . views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('recipes/', RecipeView.as_view(), name='recipe-list'),
    path('recipes/<int:id>/', RecipeView.as_view(), name='recipe-detail'), 
    path('register/', Register.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'), 
    path('category/<int:id>/', CategoryView.as_view(), name='category-detail'),
    path('category/', CategoryView.as_view(), name='category-list'),
]
