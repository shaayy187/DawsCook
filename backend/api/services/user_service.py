from ..serializer import UserSerializer
from ..messaging.publish import send_user_registered
from ..repositories import user_repository

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

def change_password(user, data):
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not user.check_password(old_password):
        return {"success": False, "message": "Old password is incorrect."}

    user_repository.update_password(user, new_password)
    return {"success": True, "message": "Password updated successfully."}