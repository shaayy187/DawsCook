from ..models import SystemUser

def create_user(validated_data):
    return SystemUser.objects.create_user(**validated_data)
