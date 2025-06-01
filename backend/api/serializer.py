from rest_framework import serializers
from . models import *
import base64
from django.core.files.base import ContentFile

def decode_base64(data):
    if not data:
        return None
    try:
        if ';base64,' in data:
            _, data = data.split(';base64,')
        return base64.b64decode(data)
    except Exception:
        raise serializers.ValidationError({"image_upload": "Invalid image data."})
    
class AllergySerializer(serializers.ModelSerializer):
    """
    Serializer dla alergenów.
    """
    class Meta:
        model = Allergy
        fields = ['id','name']


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer do kategorii kulinarnych.
    """
    image = serializers.SerializerMethodField() # odczytuje obraz z bazy danych i koduje go w formacie Base64
    image_upload = serializers.CharField(write_only=True, required=False)  # przyjmuje obraz w formacie Base64 i przekształca go do formatu binarnego i wrzuca do bazy

    class Meta:
        model = Category
        fields = ['id','name', 'image', 'image_upload']

     # zmieniam obraz na ten typ z biblioteki i zwracam jako odpowiedź
    def get_image(self, obj):
        if obj.image:
            return base64.b64encode(obj.image).decode('utf-8')
        return None

    # dekodujemy obraz na postać binarną oraz tworzymy rekord
    def create(self, validated_data):
        image_data = validated_data.pop('image_upload', None)
        if image_data:
            validated_data['image'] = decode_base64(image_data)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        image_data = validated_data.pop('image_upload', None)
        if image_data is not None:
            instance.image = decode_base64(image_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer do odczytu danych użytkownika systemowego.
    """
    password = serializers.CharField(write_only=True)
    image = serializers.SerializerMethodField() # odczytuje obraz z bazy danych i koduje go w formacie Base64
    image_upload = serializers.CharField(write_only=True, required=False, allow_blank=True)  # przyjmuje obraz w formacie Base64 i przekształca go do formatu binarnego i wrzuca do bazy
    allergies = AllergySerializer(many=True)
    allergy_ids = serializers.PrimaryKeyRelatedField(
        queryset=Allergy.objects.all(),
        source='allergies',
        many=True,
        write_only=True
    )

    class Meta:
        model = SystemUser
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name','age','pronouns', 'is_superuser', 'allergies', 'allergy_ids', 'image', 'image_upload'] 

    def get_image(self, obj):
        if obj.image:
            return base64.b64encode(obj.image).decode('utf-8')
        return None

    def create(self, validated_data):
        image_data = validated_data.pop('image_upload', None)
        password = validated_data.pop('password')
        user = SystemUser(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            age=validated_data.get('age', None),
            pronouns=validated_data.get('pronouns', '')
        )
        user.set_password(password)

        if image_data:
            user.image = decode_base64(image_data)

        user.save()
        return user

    def update(self, instance, validated_data):
        image_data = validated_data.pop('image_upload', None)
        if image_data is not None:
            instance.image = decode_base64(image_data) if image_data else None

        if 'allergies' in validated_data:
            allergens = validated_data.pop('allergies')
            instance.allergies.set(allergens)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    
class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField() 

    class Meta:
        model = Comment
        fields = ['id', 'recipe', 'user', 'text', 'parent', 'replies', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True).data

    def create(self, validated_data):
        request = self.context['request']
        validated_data['user'] = request.user
        return super().create(validated_data)

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id','recipe' ,'name', 'quantity']

class NutritionSerializer(serializers.ModelSerializer):
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all())

    class Meta:
        model = Nutrition
        fields = [
            'id', 'recipe', 'kcal', 'fat', 'saturates', 'carbs', 'sugars',
            'fibre', 'protein', 'salt'
        ]

class StepSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_upload = serializers.CharField(write_only=True, required=False)
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all())

    class Meta:
        model = Step
        fields = ['id', 'recipe','step_number', 'instruction','image', 'image_upload']
    
    def get_image(self, obj):
        if obj.image:
            return base64.b64encode(obj.image).decode('utf-8')
        return None

    def create(self, validated_data):
        image_data = validated_data.pop('image_upload', None)
        if image_data:
            validated_data['image'] = decode_base64(image_data)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        image_data = validated_data.pop('image_upload', None)
        if image_data is not None:
            instance.image = decode_base64(image_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
   
class RecipeSerializer(serializers.ModelSerializer):
    allergies = AllergySerializer(many=True)
    allergy_ids = serializers.PrimaryKeyRelatedField(
        queryset=Allergy.objects.all(),
        source='allergies',
        many=True,
        write_only=True
    )
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    rating = serializers.FloatField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    image_upload = serializers.CharField(write_only=True, required=False)
    ingredients = IngredientSerializer(many=True, read_only=True)
    nutrition = NutritionSerializer(read_only=True)
    steps = StepSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id', 'recipe', 'difficulty','description',
            'allergies', 'allergy_ids',
            'rating', 'comments','category','category_id',
            'ingredients', 'nutrition', 'steps',
            'image', 'image_upload'
        ]

    def get_image(self, obj):
        if obj.image:
            return base64.b64encode(obj.image).decode('utf-8')
        return None

    def create(self, validated_data):
        image_data = validated_data.pop('image_upload', None)
        if image_data:
            validated_data['image'] = decode_base64(image_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        image_data = validated_data.pop('image_upload', None)
        if image_data is not None:
            instance.image = decode_base64(image_data) if image_data else None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
