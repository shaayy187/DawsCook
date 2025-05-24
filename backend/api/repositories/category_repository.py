from ..models import Category

def get_all_categories():
    return Category.objects.all()

def get_category_by_id(category_id):
    return Category.objects.filter(id=category_id).first()

def create_category(validated_data):
    return Category.objects.create(**validated_data)

def update_category(instance, validated_data):
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    instance.save()
    return instance