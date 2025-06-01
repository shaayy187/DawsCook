from ..models import Step
from django.shortcuts import get_object_or_404

def get_step_by_id(step_id):
    return Step.objects.filter(id=step_id).first()

def update_step(step, validated_data):
    for attr, value in validated_data.items():
        setattr(step, attr, value)
    step.save()
    return step

def get_step(step_id):
    return get_object_or_404(Step, id=step_id)

def delete_step(step):
    step.delete()