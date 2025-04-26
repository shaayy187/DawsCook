from ..repositories import category_repository
from ..serializer import CategorySerializer
from rest_framework.exceptions import NotFound

def get_categories(category_id=None):
    if category_id:
        category = category_repository.get_category_by_id(category_id)
        if not category:
            raise NotFound("Category not found")
        serializer=CategorySerializer(category)
        return serializer.data
    else:
        category = category_repository.get_all_categories()
        if not category:
            raise NotFound("Categories not found")
        serializer=CategorySerializer(category, many=True)
        return serializer.data

def create_category(data):
    serializer = CategorySerializer(data=data)
    serializer.is_valid(raise_exception=True)
    category = serializer.save()
    return CategorySerializer(category).data
