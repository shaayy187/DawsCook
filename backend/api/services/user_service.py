from ..serializer import UserSerializer

def register_user(data):
    serializer = UserSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
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