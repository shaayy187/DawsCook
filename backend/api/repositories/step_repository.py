from ..models import Step

def get_step_by_id(step_id):
    return Step.objects.filter(id=step_id).first()

def update_step(step, validated_data):
    for attr, value in validated_data.items():
        setattr(step, attr, value)
    step.save()
    return step
