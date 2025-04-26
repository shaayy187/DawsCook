from ..serializer import UserSerializer

def register_user(data):
    serializer = UserSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return {
        "success": True,
        "message": "User registered successfully"
    }
