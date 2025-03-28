from rest_framework import serializers
from . models import *
import base64



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
        image_upload = validated_data.pop('image_upload', None)
        if image_upload:
            validated_data['image'] = base64.b64decode(image_upload)
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer do odczytu danych użytkownika systemowego.
    """
    password = serializers.CharField(write_only=True)
    class Meta:
        model = SystemUser
        fields = ['id', 'username', 'email', 'password'] 

    def create(self, validated_data):
        user = SystemUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
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
    
class RecipeSerializer(serializers.ModelSerializer):
    allergies = AllergySerializer(many=True, read_only=True)
    allergy_ids = serializers.PrimaryKeyRelatedField(
        queryset=Allergy.objects.all(),
        source='allergies',
        many=True,
        write_only=True
    )
    rating = serializers.FloatField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'recipe', 'difficulty', 'allergies', 'allergy_ids', 'rating', 'comments']