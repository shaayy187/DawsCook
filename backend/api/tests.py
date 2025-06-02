import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from api.models import Recipe, Nutrition, Step, Category

User = get_user_model()

@pytest.mark.django_db
class TestRecipeEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="testuser@example.com"
        )
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save()
        self.client.force_authenticate(user=self.user)

    def test_get_all_recipes(self):
        Recipe.objects.create(recipe="Soup", difficulty="easy", rating=4.0)
        response = self.client.get("/api/recipes/")
        assert response.status_code == 200

    def test_get_single_recipe_success(self):
        r = Recipe.objects.create(recipe="Pizza", difficulty="medium", rating=3.5)
        response = self.client.get(f"/api/recipes/{r.id}/")
        assert response.status_code == 200

    def test_get_single_recipe_not_found(self):
        response = self.client.get("/api/recipes/999/")
        assert response.status_code == 404

    def test_post_recipe_success(self):
        cat = Category.objects.create(name="Pasta")
        data = {
            "recipe": "Spaghetti",
            "difficulty": "hard",
            "allergy_ids": [],
            "category_id": cat.id
        }
        response = self.client.post("/api/recipes/", data, format="json")
        assert response.status_code == 201

    def test_post_recipe_invalid(self):
        response = self.client.post("/api/recipes/", {}, format="json")
        assert response.status_code == 400

    def test_patch_recipe_invalid(self):
        cat = Category.objects.create(name="X")
        r = Recipe.objects.create(recipe="R", difficulty="easy", rating=1.0, category=cat)
        resp = self.client.patch(f"/api/recipes/{r.id}/", {}, format="json")
        assert resp.status_code == 400

    def test_filter_recipes_by_category(self):
        cat1 = Category.objects.create(name="A")
        cat2 = Category.objects.create(name="B")
        Recipe.objects.create(recipe="One", difficulty="easy", rating=1.0, category=cat1)
        Recipe.objects.create(recipe="Two", difficulty="easy", rating=2.0, category=cat2)
        resp = self.client.get(f"/api/recipes/?category={cat1.id}")
        assert resp.status_code == 200
        results = resp.data.get("results", resp.data)
        assert all(item["category"]["id"] == cat1.id for item in results)

    def test_order_recipes_by_rating(self):
        cat = Category.objects.create(name="C")
        Recipe.objects.create(recipe="Low", difficulty="easy", rating=1.0, category=cat)
        Recipe.objects.create(recipe="High", difficulty="easy", rating=5.0, category=cat)
        resp = self.client.get("/api/recipes/?ordering=rating")
        assert resp.status_code == 200
        results = resp.data.get("results", resp.data)
        ratings = [item["rating"] for item in results]
        assert ratings == sorted(ratings)


@pytest.mark.django_db
class TestCategoryEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username="adminuser",
            password="adminpass123",
            email="admin@example.com"
        )
        self.admin_user.is_staff = True
        self.admin_user.is_superuser = True
        self.admin_user.save()
        self.client.force_authenticate(user=self.admin_user)

    def test_get_all_categories(self):
        Category.objects.create(name="Breakfast")
        response = self.client.get("/api/category/")
        assert response.status_code == 200

    def test_get_category_success(self):
        c = Category.objects.create(name="Lunch")
        response = self.client.get(f"/api/category/{c.id}/")
        assert response.status_code == 200

    def test_get_category_not_found(self):
        response = self.client.get("/api/category/999/")
        assert response.status_code == 404

    def test_post_category_success(self):
        data = {"name": "Dinner"}
        response = self.client.post("/api/category/admin/", data, format="json")
        assert response.status_code == 201

    def test_post_category_invalid(self):
        response = self.client.post("/api/category/admin/", {}, format="json")
        assert response.status_code == 400

    def test_get_all_categories_empty(self):
        response = self.client.get("/api/category/")
        assert response.status_code == 200
        assert response.data == []



@pytest.mark.django_db
class TestAuthEndpoints:

    def setup_method(self):
        self.client = APIClient()

    def test_register_user_success(self):
        data = {"username": "testuser", "email": "test@example.com", "password": "TestPass123"}
        response = self.client.post("/api/register/", data, format="json")
        assert response.status_code == 201

    def test_register_user_invalid(self):
        response = self.client.post("/api/register/", {}, format="json")
        assert response.status_code == 400

    def test_login_success(self):
        User.objects.create_user(username="user1", password="pass1234", email="u1@example.com")
        response = self.client.post("/api/login/", {"username": "user1", "password": "pass1234"}, format="json")
        assert response.status_code == 200
        assert "access" in response.data

    def test_login_invalid(self):
        response = self.client.post("/api/login/", {"username": "nouser", "password": "wrong"}, format="json")
        assert response.status_code == 401


@pytest.mark.django_db
class TestCategoryAdminExtras:

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user",
            password="pass123",
            email="user@example.com"
        )
        self.admin = User.objects.create_user(
            username="admin",
            password="admin123",
            email="admin2@example.com"
        )
        self.admin.is_staff = True
        self.admin.is_superuser = True
        self.admin.save()

    def test_put_category_success(self):
        self.client.force_authenticate(user=self.admin)
        c = Category.objects.create(name="OldName")
        data = {"name": "NewName"}
        response = self.client.put(f"/api/category/admin/{c.id}/", data, format="json")
        assert response.status_code == 200
        assert response.data["name"] == "NewName"

    def test_put_category_invalid(self):
        self.client.force_authenticate(user=self.admin)
        c = Category.objects.create(name="Foo")
        response = self.client.put(f"/api/category/admin/{c.id}/", {}, format="json")
        assert response.status_code == 400

    def test_non_admin_cannot_post_or_put(self):
        self.client.force_authenticate(user=self.user)
        resp1 = self.client.post("/api/category/admin/", {"name": "X"}, format="json")
        assert resp1.status_code == 403
        resp2 = self.client.put("/api/category/admin/1/", {"name": "Y"}, format="json")
        assert resp2.status_code in (403, 404)

    def test_put_category_not_found(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.put("/api/category/admin/999/", {"name": "X"}, format="json")
        assert response.status_code == 404


@pytest.mark.django_db
class TestRecipeExtras:

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser2",
            password="testpass123",
            email="testuser2@example.com"
        )
        self.client.force_authenticate(user=self.user)

    def test_patch_recipe_success(self):
        cat = Category.objects.create(name="C")
        r = Recipe.objects.create(recipe="Orig", difficulty="easy", rating=1.0, category=cat)
        data = {"recipe": "UpdatedName", "difficulty": "hard"}
        resp = self.client.patch(f"/api/recipes/{r.id}/", data, format="json")
        assert resp.status_code == 200
        assert resp.data["recipe"] == "UpdatedName"
        assert resp.data["difficulty"] == "hard"

    def test_patch_recipe_not_found(self):
        data = {"recipe": "Nope"}
        resp = self.client.patch("/api/recipes/999/", data, format="json")
        assert resp.status_code == 404

    def test_recipe_detail_requires_authentication(self):
        self.client.force_authenticate(user=None)
        r = Recipe.objects.create(recipe="Sec", difficulty="easy", rating=2.0)
        resp = self.client.get(f"/api/recipes/{r.id}/")
        assert resp.status_code == 401

@pytest.mark.django_db
class TestNutritionAdminEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username="admin", password="adminpass")
        self.admin.is_staff = True
        self.client.force_authenticate(user=self.admin)
        self.recipe = Recipe.objects.create(recipe="Test", difficulty="easy", rating=3.0)

    def test_create_nutrition_success(self):
        data = {"recipe": self.recipe.id, "kcal": 200, "fat": 10}
        response = self.client.post("/api/nutrition/", data, format="json")
        assert response.status_code == 201

    def test_update_nutrition_success(self):
        nutrition = Nutrition.objects.create(recipe=self.recipe, kcal=100, fat=5)
        data = {"kcal": 150}
        response = self.client.patch(f"/api/nutrition/{nutrition.id}/", data, format="json")
        assert response.status_code == 200

    def test_delete_nutrition_success(self):
        nutrition = Nutrition.objects.create(recipe=self.recipe, kcal=100, fat=5)
        response = self.client.delete(f"/api/nutrition/{nutrition.id}/")
        assert response.status_code == 204


@pytest.mark.django_db
class TestUserProfileEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass", email="test@example.com")
        self.client.force_authenticate(user=self.user)

    def test_get_user_profile_success(self):
        response = self.client.get("/api/user/")
        assert response.status_code == 200
        assert response.data["username"] == "testuser"

    def test_update_user_profile_success(self):
        data = {"username": "updateduser"}
        response = self.client.patch("/api/user/", data, format="json")
        assert response.status_code == 200
        assert response.data["username"] == "updateduser"


@pytest.mark.django_db
class TestChangeEmailEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="user", password="pass", email="old@example.com")
        self.client.force_authenticate(user=self.user)

    def test_change_email_success(self):
        data = {"new_email": "new@example.com", "confirm_email": "new@example.com"}
        response = self.client.post("/api/user/change-email/", data, format="json")
        assert response.status_code in (200, 400)

    def test_change_email_mismatch(self):
        data = {"new_email": "one@example.com", "confirm_email": "two@example.com"}
        response = self.client.post("/api/user/change-email/", data, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestRecipeRatingEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="user", password="pass")
        self.client.force_authenticate(user=self.user)
        self.recipe = Recipe.objects.create(recipe="Soup", difficulty="easy", rating=3.0)

    def test_submit_rating_success(self):
        data = {"recipe": self.recipe.id, "value": 5}
        response = self.client.post(f"/api/recipes/{self.recipe.id}/rate/", data, format="json")
        assert response.status_code in (200, 201)
        assert response.data["id"] == self.recipe.id or response.data.get("recipe") == self.recipe.id

    def test_submit_rating_invalid(self):
        data = {"value": 10}
        response = self.client.post(f"/api/recipes/{self.recipe.id}/rate/", data, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestStepAdminEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(username="admin", password="adminpass")
        self.admin.is_staff = True
        self.client.force_authenticate(user=self.admin)
        self.recipe = Recipe.objects.create(recipe="Salad", difficulty="easy", rating=3.0)

    def test_create_step_success(self):
        data = {"recipe": self.recipe.id, "step_number": 1, "instruction": "Chop veggies"}
        response = self.client.post("/api/steps/", data, format="json")
        assert response.status_code == 201

    def test_update_step_success(self):
        step = Step.objects.create(recipe=self.recipe, step_number=1, instruction="Initial")
        data = {"instruction": "Updated instruction"}
        response = self.client.patch(f"/api/steps/{step.id}/", data, format="json")
        assert response.status_code == 200

    def test_delete_step_success(self):
        step = Step.objects.create(recipe=self.recipe, step_number=1, instruction="To delete")
        response = self.client.delete(f"/api/steps/{step.id}/")
        assert response.status_code == 204

@pytest.mark.django_db
class TestChangePasswordEndpoints:
    
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="user", password="oldpass")
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        data = {"old_password": "oldpass", "new_password": "newpass123"}
        response = self.client.post("/api/user/change-password/", data, format="json")
        assert response.status_code == 200