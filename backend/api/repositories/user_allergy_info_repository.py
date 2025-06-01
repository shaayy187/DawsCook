from ..models import UserAllergyInfo

def get_all_by_user(user):
    return UserAllergyInfo.objects.filter(user=user)

def get_by_id_and_user(pk, user):
    return UserAllergyInfo.objects.filter(pk=pk, user=user).first()

def create(user, allergy, power="", symptoms="", treatment=""):
    return UserAllergyInfo.objects.create(
        user=user,
        allergy=allergy,
        power=power,
        symptoms=symptoms,
        treatment=treatment
    )

def update(instance, **kwargs):
    for field, val in kwargs.items():
        setattr(instance, field, val)
    instance.save()
    return instance

def delete(instance):
    instance.delete()
