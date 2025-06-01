from django.core.exceptions import ObjectDoesNotExist, PermissionDenied
from ..models import Allergy
from ..repositories.user_allergy_info_repository import (
    get_all_by_user,
    get_by_id_and_user,
    create as repo_create,
    update as repo_update,
    delete as repo_delete
)

def list_user_allergy_info(user):
    return get_all_by_user(user)

def create_user_allergy_info(user, allergy_id, power, symptoms, treatment):
    try:
        allergy = Allergy.objects.get(pk=allergy_id)
    except Allergy.DoesNotExist:
        raise ObjectDoesNotExist(f"Allergy with id={allergy_id} does not exist.")

    instance = repo_create(
        user=user,
         allergy=allergy,
         power=power,
         symptoms=symptoms,
        treatment=treatment
    )

    user.allergies.add(allergy)

    return instance

def update_user_allergy_info(user, pk, data):
    instance = get_by_id_and_user(pk, user)
    if not instance:
        raise PermissionDenied("Either you do not own this entry or it does not exist.")

    return repo_update(instance, **data)


def delete_user_allergy_info(user, pk):
    instance = get_by_id_and_user(pk, user)
    if not instance:
        raise PermissionDenied("Either you do not own this entry or it does not exist.")

    user.allergies.remove(instance.allergy)

    repo_delete(instance)
