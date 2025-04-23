import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from api.models import Recipe, Category

User = get_user_model()

@pytest.mark.django_db
class TestRecipeEndpoints:

    def setup_method(self):
        self.client = APIClient()

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
        data = {"recipe": "Spaghetti", "difficulty": "hard", "allergy_ids": [], "rating": 5.0}
        response = self.client.post("/api/recipes/", data, format="json")
        assert response.status_code == 201

    def test_post_recipe_invalid(self):
        response = self.client.post("/api/recipes/", {}, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestCategoryEndpoints:

    def setup_method(self):
        self.client = APIClient()

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
        response = self.client.post("/api/category/", data, format="json")
        assert response.status_code == 201

    def test_post_category_invalid(self):
        response = self.client.post("/api/category/", {}, format="json")
        assert response.status_code == 400


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
        User.objects.create_user(username="user1", password="pass1234")
        response = self.client.post("/api/login/", {"username": "user1", "password": "pass1234"}, format="json")
        assert response.status_code == 200
        assert "access" in response.data

    def test_login_invalid(self):
        response = self.client.post("/api/login/", {"username": "nouser", "password": "wrong"}, format="json")
        assert response.status_code == 401
