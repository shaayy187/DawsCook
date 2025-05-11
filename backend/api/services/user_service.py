from ..serializer import UserSerializer
from ..messaging.publish import send_user_registered

def register_user(data):
    serializer = UserSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    send_user_registered(serializer.validated_data.get("username"), serializer.validated_data.get("email"))
    return {
        "success": True,
        "message": "User registered successfully"
    }

def get_user_profile(user):
    serializer = UserSerializer(user)
    return serializer.data

def update_user_profile(user, data):
    serializer = UserSerializer(user, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return UserSerializer(user).data