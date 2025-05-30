from ..models import Recipe

def get_all_recipes():
    return Recipe.objects.all()

def get_recipe_by_id(recipe_id):
    return Recipe.objects.filter(id=recipe_id).first()

def create_recipe(validated_data):
    return Recipe.objects.create(**validated_data)

def update_recipe(instance, validated_data):
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    instance.save()
    return instance