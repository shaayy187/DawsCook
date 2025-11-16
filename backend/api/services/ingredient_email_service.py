from typing import List, Optional, Union
from rest_framework.exceptions import ValidationError
from api.repositories import recipe_repository as repo
from .email_service import EmailService

def _format_ingredients_text(recipe, portion: float) -> str:
    lines: List[str] = []
    lines.append(f"Recipe: {recipe.recipe}")
    if getattr(recipe, "description", None):
        lines.append(f"Description: {recipe.description}")
    lines.append("")
    lines.append(f"Ingredients (× {portion}):")

    for ing in recipe.ingredients.all():
        qty = getattr(ing, "amount", None)
        unit = (ing.unit or "").strip()

        scaled = None
        if qty is not None:
            try:
                scaled = round(float(qty) * float(portion), 2)
            except Exception:
                pass

        line = f"- {ing.name}"
        if scaled is not None:
            suffix = f"{scaled} {unit}".strip()
            if suffix:
                line += f": {suffix}"
        elif qty:
            suffix = f"{qty} {unit}".strip()
            if suffix:
                line += f": {suffix}"

        note = (getattr(ing, "note", "") or "").strip()
        if note:
            line += f" ({note})"

        lines.append(line)

    return "\n".join(lines)


class IngredientEmailService:
    def __init__(self, mailer: Optional[EmailService] = None):
        self.mailer = mailer or EmailService()

    def send_ingredients(self, recipe_id: int, user, portion: Union[float, int, str] = 1):
        recipe = repo.get_with_ingredients_or_404(recipe_id)

        user_email = (getattr(user, "email", "") or "").strip()
        if not user_email:
            raise ValidationError({"detail": "Your account has no email set."})

        try:
            p = float(portion or 1)
            if p <= 0:
                p = 1.0
        except Exception:
            p = 1.0

        body = _format_ingredients_text(recipe, portion=p)
        subject = f"Ingredients – {recipe.recipe}"
        self.mailer.send(subject=subject, body=body, to=[user_email])
        return {"status": "sent"}
