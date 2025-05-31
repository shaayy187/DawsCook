from django.urls import path
from .controllers.recipe_controller import RecipeView, RecipeDetailView
from .controllers.user_controller import Register, UserProfile, ChangePasswordView, ChangeEmailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .controllers.step_controller import StepDetailView
from .controllers.category_controller import CategoryListView, CategoryDetailPublicView, CategoryAdminView
from .controllers.allergy_controller import AllergyView

urlpatterns = [
    path('recipes/', RecipeView.as_view(), name='recipe-list'),
    path('recipes/<int:id>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('register/', Register.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'), 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('category/', CategoryListView.as_view(), name='category-list'),
    path('category/<int:id>/', CategoryDetailPublicView.as_view(), name='category-detail'),
    path('category/admin/', CategoryAdminView.as_view(), name='category-create'),
    path('category/admin/<int:id>/', CategoryAdminView.as_view(), name='category-update'),
    path('user/', UserProfile.as_view(), name='user-profile'),
    path('steps/<int:id>/', StepDetailView.as_view(), name='step-detail'),
    path('user/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('user/change-email/', ChangeEmailView.as_view(), name='change-email'),
    path('allergies/', AllergyView.as_view(), name='allergy'),
]
