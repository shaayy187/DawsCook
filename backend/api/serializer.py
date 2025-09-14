from rest_framework import serializers
from . models import *
import base64
from django.core.files.base import ContentFile
from django.db.models import Avg, Count
from django.utils import timezone

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
    class Meta:
        model = Allergy
        fields = ['id','name']


class CategorySerializer(serializers.ModelSerializer):
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


class UserAllergyInfoSerializer(serializers.ModelSerializer):
    allergy = serializers.StringRelatedField(read_only=True)

    allergy_id = serializers.PrimaryKeyRelatedField(
        queryset=Allergy.objects.all(),
        source="allergy",
        write_only=True
    )

    class Meta:
        model = UserAllergyInfo
        fields = [
            "id",
            "allergy",
            "allergy_id",
            "power",
            "symptoms",
            "treatment",
        ]

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    image = serializers.SerializerMethodField() # odczytuje obraz z bazy danych i koduje go w formacie Base64
    image_upload = serializers.CharField(write_only=True, required=False, allow_blank=True)  # przyjmuje obraz w formacie Base64 i przekształca go do formatu binarnego i wrzuca do bazy
    allergies = AllergySerializer(many=True, required=False)
    allergy_ids = serializers.PrimaryKeyRelatedField(
        queryset=Allergy.objects.all(),
        source='allergies',
        many=True,
        write_only=True,
        required=False
    )
    user_allergy_info = UserAllergyInfoSerializer(many=True, read_only=True)

    class Meta:
        model = SystemUser
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name','age','pronouns', 'is_superuser', 'allergies', 'allergy_ids', "user_allergy_info", 'image', 'image_upload'] 

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
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'recipe',
            'username',
            'avatar',
            'text',
            'parent',
            'replies',
            'created_at',
        ]
        read_only_fields = ['username', 'avatar', 'created_at']

    def get_avatar(self, obj):
        user = obj.user
        if user.image:
            return base64.b64encode(user.image).decode('utf-8')
        return None

    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True, context=self.context).data

    def create(self, validated_data):
        request = self.context['request']
        validated_data['user'] = request.user
        return super().create(validated_data)

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'recipe', 'name', 'amount', 'unit', 'note', 'quantity']

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
    allergies = AllergySerializer(many=True, required=False)
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

    rating = serializers.FloatField(read_only=True,  required=False)
    my_rating = serializers.SerializerMethodField( required=False)
    avg_rating = serializers.SerializerMethodField( required=False)
    ratings_count = serializers.SerializerMethodField( required=False)
    comments = CommentSerializer(many=True, read_only=True, required=False)
    image = serializers.SerializerMethodField()
    image_upload = serializers.CharField(write_only=True, required=False)
    ingredients = IngredientSerializer(many=True, read_only=True)
    nutrition = NutritionSerializer(read_only=True)
    steps = StepSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id',
            'recipe',
            'difficulty',
            'description',
            'allergies',
            'allergy_ids',
            'rating',
            'my_rating',
            'avg_rating',
            'ratings_count',
            'comments',
            'category',
            'category_id',
            'ingredients',
            'nutrition',
            'steps',
            'created',
            'cooking_time',
            'image',
            'image_upload',
        ]
        read_only_fields = ['created', 'cooking_time']

    def get_my_rating(self, obj):
        request = self.context.get('request', None)
        if not request or not hasattr(request, 'user') or request.user.is_anonymous:
            return 0
        try:
            r = obj.ratings.get(user=request.user)
            return r.value
        except Rating.DoesNotExist:
            return 0

    def get_avg_rating(self, obj):
        agg = obj.ratings.aggregate(avg=Avg('value'))
        return agg['avg'] or 0

    def get_ratings_count(self, obj):
        return obj.ratings.count()

    def get_image(self, obj):
        if obj.image:
            return base64.b64encode(obj.image).decode('utf-8')
        return None

    def create(self, validated_data):
        image_data = validated_data.pop('image_upload', None)
        allergies = validated_data.pop('allergies', [])
        recipe = Recipe.objects.create(**validated_data)
        if image_data:
            recipe.image = decode_base64(image_data)
            recipe.save()
        if allergies:
            recipe.allergies.set(allergies)
        return recipe

    def update(self, instance, validated_data):
        image_data = validated_data.pop('image_upload', None)
        allergies = validated_data.pop('allergies', None)
        if image_data is not None:
            instance.image = decode_base64(image_data)
        if allergies is not None:
            instance.allergies.set(allergies)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class RatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all())

    class Meta:
        model = Rating
        fields = ['id', 'user', 'recipe', 'value']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        validated_data['user'] = user
        rating_obj, created = Rating.objects.update_or_create(
            user=user,
            recipe=validated_data['recipe'],
            defaults={'value': validated_data['value']}
        )
        recipe = rating_obj.recipe
        agg = recipe.ratings.aggregate(avg=Avg('value'), cnt=Count('id'))
        recipe.rating = agg['avg'] if agg['avg'] is not None else 0
        recipe.save()
        return rating_obj
    
class GalleryImageSerializer(serializers.ModelSerializer):
    recipe = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all())
    image = serializers.SerializerMethodField(read_only=True)
    image_upload = serializers.CharField(write_only=True, required=False)
    username = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = GalleryImage
        fields = ["id", "recipe", "username", "caption", "created", "image", "image_upload", "content_type"]

    def get_username(self, obj):
        u = getattr(obj, "user", None)
        return getattr(u, "username", None) if u else None
    
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
    
class IngredientSubstituteSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngredientSubstitute
        fields = ["id", "ingredient", "name", "ratio", "note", "replaces_allergy", "priority"]