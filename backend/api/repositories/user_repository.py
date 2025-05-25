from ..models import SystemUser

def create_user(validated_data):
    return SystemUser.objects.create_user(**validated_data)

def update_password(user, new_password):
    user.set_password(new_password)
    user.save()