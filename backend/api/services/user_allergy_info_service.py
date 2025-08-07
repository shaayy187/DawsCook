from django.core.exceptions import ObjectDoesNotExist, PermissionDenied
from ..serializer import UserAllergyInfoSerializer
from ..repositories import user_allergy_info_repository

def list_user_allergy_info(user):
    return user_allergy_info_repository.get_all_by_user(user)

def create_user_allergy_info(user, data):
    serializer = UserAllergyInfoSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    instance = serializer.save(user=user)
    return UserAllergyInfoSerializer(instance).data

def update_user_allergy_info(user, pk, data):
    instance = user_allergy_info_repository.get_by_id_and_user(pk, user)
    serializer = UserAllergyInfoSerializer(instance, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    updated = serializer.save()
    return UserAllergyInfoSerializer(updated).data

def delete_user_allergy_info(user, pk):
    instance = user_allergy_info_repository.get_by_id_and_user(pk, user)
    if not instance:
        raise PermissionDenied("Either you do not own this entry or it does not exist.")
    user.allergies.remove(instance.allergy)
    user_allergy_info_repository.delete(instance)
