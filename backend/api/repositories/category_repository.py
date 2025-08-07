from ..models import Category

def get_all_categories():
    return Category.objects.all()

def get_category_by_id(category_id):
    return Category.objects.filter(id=category_id).first()