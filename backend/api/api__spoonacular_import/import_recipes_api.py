import requests
from django.utils import timezone
from api.models import Recipe, Ingredient
from django.db import IntegrityError
from html import unescape
from html.parser import HTMLParser

API_KEY = "83f5d2ec48994328b675bf390370788e"

# Pomocnicza klasa do usuwania tagów HTML
class HTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.fed = []

    def handle_data(self, d):
        self.fed.append(d)

    def get_data(self):
        return ''.join(self.fed)

def strip_tags(html):
    s = HTMLStripper()
    s.feed(unescape(html))
    return s.get_data()


def fetch_spoonacular_recipes(count=5):
    url = f"https://api.spoonacular.com/recipes/random?number={count}&apiKey={API_KEY}"
    response = requests.get(url)

    if response.status_code != 200:
        print("❌ Błąd pobierania:", response.json())
        return []

    return response.json().get("recipes", [])


def import_spoonacular_recipes():
    recipes = fetch_spoonacular_recipes()

    for r in recipes:
        title = r.get("title")
        spoon_id = r.get("id")

        if Recipe.objects.filter(spoonacular_id=spoon_id).exists():
            print(f"⏭️ Pomijam duplikat: {title}")
            continue

        try:
            # Pobieranie obrazu binarnego
            image_data = None
            image_url = r.get("image")
            if image_url:
                img_response = requests.get(image_url)
                if img_response.status_code == 200:
                    image_data = img_response.content

            # Usunięcie HTML z opisu
            raw_summary = r.get("summary", "")
            clean_description = strip_tags(raw_summary)[:600]

            # Tworzenie przepisu
            recipe = Recipe.objects.create(
                recipe=title,
                description=clean_description,
                difficulty="unknown",
                created=timezone.now(),
                cooking_time=r.get("readyInMinutes", 0) * 60,
                spoonacular_id=spoon_id,
                image=image_data,
            )
            print(f"✅ Dodano: {title}")

            # Dodawanie składników
            for ing in r.get("extendedIngredients", []):
                Ingredient.objects.create(
                    recipe=recipe,
                    name=ing.get("name", ""),
                    quantity=ing.get("original", "")
                )

        except IntegrityError:
            print(f"⚠️ Błąd przy dodawaniu: {title}")
        except Exception as e:
            print(f"❌ Wyjątek: {e}")
