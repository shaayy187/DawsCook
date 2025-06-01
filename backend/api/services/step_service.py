from ..repositories import step_repository
from ..serializer import StepSerializer
from rest_framework.exceptions import NotFound

def update_step(step_id, data):
    step = step_repository.get_step_by_id(step_id)
    if not step:
        raise NotFound("Step not found")

    serializer = StepSerializer(step, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    updated_step = serializer.save()
    return StepSerializer(updated_step).data

def create_step(data):
    serializer = StepSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    step = serializer.save()
    return serializer.data

def delete_step(step_id):
    step = step_repository.get_step(step_id)
    step_repository.delete_step(step)