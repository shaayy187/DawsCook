from ..models import UserAllergyInfo

def get_all_by_user(user):
    return UserAllergyInfo.objects.filter(user=user)

def get_by_id_and_user(pk, user):
    return UserAllergyInfo.objects.filter(pk=pk, user=user).first()

def delete(instance):
    instance.delete()
