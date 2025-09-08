import requests
from django.utils import timezone
from html import unescape
from html.parser import HTMLParser
from django.db import IntegrityError

from api.models import Recipe, Ingredient, Step, Nutrition, Category

API_KEY = "83f5d2ec48994328b675bf390370788e"


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
    url = "https://api.spoonacular.com/recipes/random"
    params = {
        "number": count,
        "apiKey": API_KEY,
        "includeNutrition": "true",
    }
    response = requests.get(url, params=params, timeout=30)
    if response.status_code != 200:
        print("Error:", response.text)
        return []
    return response.json().get("recipes", [])


def import_spoonacular_recipes(count: int = 5):
    recipes = fetch_spoonacular_recipes(count)

    for r in recipes:
        title = r.get("title")
        spoon_id = r.get("id")

        if not title or not spoon_id:
            continue

        if Recipe.objects.filter(spoonacular_id=spoon_id).exists():
            continue

        try:
            image_data = None
            image_url = r.get("image")
            if image_url:
                try:
                    img_response = requests.get(image_url, timeout=20)
                    if img_response.status_code == 200:
                        image_data = img_response.content
                except Exception:
                    pass

            raw_summary = r.get("summary", "") or ""
            clean_description = strip_tags(raw_summary)[:600]

            category = None
            for dish in (r.get("dishTypes") or []):
                category = Category.objects.filter(name__iexact=dish).first()
                if category:
                    break

            recipe = Recipe.objects.create(
                recipe=title[:30],
                description=clean_description,
                difficulty=(r.get("difficulty") or "unknown")[:30],
                created=timezone.now(),
                cooking_time=(r.get("readyInMinutes") or 0) * 60,
                spoonacular_id=spoon_id,
                image=image_data,
                category=category
            )

            for ing in (r.get("extendedIngredients") or []):
                measures = ing.get("measures") or {}
                metric = measures.get("metric") or {}
                us = measures.get("us") or {}

                m = metric if metric.get("amount") else us
                amount = m.get("amount")
                unit = (m.get("unitShort") or m.get("unitLong") or "").strip()

                Ingredient.objects.create(
                    recipe=recipe,
                    name=(ing.get("name") or "")[:100],
                    amount=amount,
                    unit=unit,
                    note=(ing.get("originalName") or "")[:120],
                    quantity=(ing.get("original") or "")[:50],
                )

            analyzed_instructions = r.get("analyzedInstructions") or []
            if analyzed_instructions:
                steps_data = analyzed_instructions[0].get("steps") or []
                for step in steps_data:
                    Step.objects.create(
                        recipe=recipe,
                        step_number=step.get("number") or 0,
                        instruction=(step.get("step") or "")[:1000]
                    )

            nutrition_info = (r.get("nutrition") or {}).get("nutrients") or []

            def get_nutr(name, default=0.0):
                for n in nutrition_info:
                    if n.get("name") == name:
                        return (n.get("amount") or 0.0), (n.get("unit") or "")
                return default, ""

            kcal, _      = get_nutr("Calories")
            fat, _       = get_nutr("Fat")
            saturates, _ = get_nutr("Saturated Fat")
            carbs, _     = get_nutr("Carbohydrates")
            sugars, _    = get_nutr("Sugar")
            fibre, _     = get_nutr("Fiber")
            protein, _   = get_nutr("Protein")

            sodium_amt, sodium_unit = get_nutr("Sodium")
            u = str(sodium_unit or "").lower()
            if u == "mg":
                sodium_mg = sodium_amt
            elif u == "g":
                sodium_mg = sodium_amt * 1000
            else:
                sodium_mg = 0
            salt_g = (sodium_mg / 1000.0) * 2.5

            Nutrition.objects.create(
                recipe=recipe,
                kcal=kcal or 0,
                fat=fat or 0,
                saturates=saturates or 0,
                carbs=carbs or 0,
                sugars=sugars or 0,
                fibre=fibre or 0,
                protein=protein or 0,
                salt=round(salt_g, 2)
            )

        except IntegrityError:
            print(f"IntegrityError for: {title}")
        except Exception as e:
            print(f"Exception: {e}")
