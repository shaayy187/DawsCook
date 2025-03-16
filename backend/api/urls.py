from django.urls import path
from . import views
from . views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('recipes/', RecipeView.as_view(), name='recipe'), 
    path('register/', Register.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'), 
]
