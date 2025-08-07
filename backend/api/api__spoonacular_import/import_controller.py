from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .import_recipes_api import import_spoonacular_recipes

@api_view(['POST'])
@permission_classes([AllowAny])
def import_recipes(request):
    try:
        import_spoonacular_recipes()
        return Response({"status": "ok"})
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
