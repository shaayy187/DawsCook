from wagtail_modeladmin.options import (ModelAdmin, modeladmin_register, ModelAdminGroup)

from api.models import (
    Category, Allergy, Recipe, Ingredient, Nutrition,
    Step, Comment, GalleryImage, IngredientSubstitute, UserAllergyInfo, SystemUser
)
from .forms import CategoryForm, RecipeForm, StepForm, GalleryImageForm, SystemUserAvatarForm

class BaseAdmin(ModelAdmin):
    list_per_page = 50
    ordering = ("id",)
    menu_order = 200

class AllergyAdmin(BaseAdmin):
    model = Allergy
    menu_label = "Allergies"
    list_display = ("id", "name")
    search_fields = ("name",)

class CategoryAdmin(BaseAdmin):
    model = Category
    menu_label = "Categories"
    list_display = ("id", "name")
    search_fields = ("name",)
    form = CategoryForm

class RecipeAdmin(BaseAdmin):
    model = Recipe
    menu_label = "Recipes"
    list_display = ("id", "recipe", "category", "difficulty", "rating", "created")
    list_filter = ("category", "difficulty")
    search_fields = ("recipe", "description")
    form = RecipeForm

class IngredientAdmin(BaseAdmin):
    model = Ingredient
    menu_label = "Ingredients"
    list_display = ("id", "recipe", "name", "amount", "unit", "quantity")
    list_filter = ("recipe",)
    search_fields = ("name", "recipe__recipe")

class StepAdmin(BaseAdmin):
    model = Step
    menu_label = "Steps"
    list_display = ("id", "recipe", "step_number")
    list_filter = ("recipe",)
    form = StepForm

class NutritionAdmin(BaseAdmin):
    model = Nutrition
    menu_label = "Nutrition"
    list_display = ("id", "recipe", "kcal", "protein", "carbs", "fat")
    list_filter = ("recipe",)

class RatingCommentAdmin(BaseAdmin):
    model = Comment
    menu_label = "Comments"
    list_display = ("id", "recipe", "user", "created_at")
    list_filter = ("recipe", "user")
    search_fields = ("text", "user__username", "recipe__recipe")

class GalleryImageAdmin(BaseAdmin):
    model = GalleryImage
    menu_label = "Gallery"
    list_display = ("id", "recipe", "user", "created")
    list_filter = ("recipe", "user", "created")
    form = GalleryImageForm

class IngredientSubstituteAdmin(BaseAdmin):
    model = IngredientSubstitute
    menu_label = "Substitutes"
    list_display = ("id", "ingredient", "name", "ratio", "priority")
    list_filter = ("ingredient", "replaces_allergy")
    search_fields = ("name",)

class UserAllergyInfoAdmin(BaseAdmin):
    model = UserAllergyInfo
    menu_label = "User allergy info"
    list_display = ("id", "user", "allergy", "power")
    list_filter = ("user", "allergy")
    search_fields = ("symptoms", "treatment", "user__username")

class SystemUserAdmin(BaseAdmin):
    model = SystemUser
    menu_label = "Users"
    list_display = ("id", "username", "email", "is_superuser")
    search_fields = ("username", "email")
    form = SystemUserAvatarForm

class DictionaryGroup(ModelAdminGroup):
    menu_label = "Dictionaries"
    menu_icon = "list-ul"
    menu_order = 100
    items = (AllergyAdmin, CategoryAdmin)

class RecipesGroup(ModelAdminGroup):
    menu_label = "Recipes"
    menu_icon = "folder-open-inverse"
    menu_order = 110
    items = (RecipeAdmin, IngredientAdmin, StepAdmin, NutritionAdmin, GalleryImageAdmin, IngredientSubstituteAdmin)

class CommunityGroup(ModelAdminGroup):
    menu_label = "Community"
    menu_icon = "group"
    menu_order = 120
    items = (RatingCommentAdmin, UserAllergyInfoAdmin, SystemUserAdmin)

modeladmin_register(DictionaryGroup)
modeladmin_register(RecipesGroup)
modeladmin_register(CommunityGroup)
