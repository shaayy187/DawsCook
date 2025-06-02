from django.urls import path
from rest_framework.routers import DefaultRouter
from .controllers.recipe_controller import RecipeView, RecipeDetailView, RecipeRatingView
from .controllers.user_controller import Register, UserProfile, ChangePasswordView, ChangeEmailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .controllers.step_controller import StepDetailView
from .controllers.category_controller import CategoryListView, CategoryDetailPublicView, CategoryAdminView
from .controllers.allergy_controller import AllergyView
from .controllers.ingredient_controller import IngredientAdminView
from .controllers.nutrition_controller import NutritionAdminView
from .controllers.user_allergy_info_controller import UserAllergyInfoListCreate, UserAllergyInfoDetail
from .controllers.comment_controller import CommentView

urlpatterns = [
    path('recipes/', RecipeView.as_view(), name='recipe-list'),
    path('recipes/<int:id>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('recipes/<int:id>/rate/', RecipeRatingView.as_view(), name='recipe-rate'),
    path('register/', Register.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'), 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('category/', CategoryListView.as_view(), name='category-list'),
    path('category/<int:id>/', CategoryDetailPublicView.as_view(), name='category-detail'),
    path('category/admin/', CategoryAdminView.as_view(), name='category-create'),
    path('category/admin/<int:id>/', CategoryAdminView.as_view(), name='category-update'),
    path('user/', UserProfile.as_view(), name='user-profile'),
    path('steps/<int:id>/', StepDetailView.as_view(), name='step-detail'),
    path('steps/', StepDetailView.as_view(), name='step-list-create'),
    path('user/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('user/change-email/', ChangeEmailView.as_view(), name='change-email'),
    path('allergies/', AllergyView.as_view(), name='allergy'),
    path('nutrition/', NutritionAdminView.as_view(), name='nutrition-list-create'),
    path('nutrition/<int:id>/', NutritionAdminView.as_view(), name='nutrition-detail'),
    path('ingredients/', IngredientAdminView.as_view(), name='ingredient-list-create'),
    path('ingredients/<int:id>/', IngredientAdminView.as_view(), name='ingredient-detail'),
    path("user_allergies/", UserAllergyInfoListCreate.as_view(), name="user_allergy_info-list-create"),
    path("user_allergies/<int:pk>/", UserAllergyInfoDetail.as_view(), name="user_allergy_info-detail"),
    path("comments/", CommentView.as_view(), name="comment-create"),
    path("comments/<int:id>/", CommentView.as_view(), name="comment-detail"),
]
