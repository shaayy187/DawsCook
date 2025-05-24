from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from ..services import step_service

class StepDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, id):
        updated_step = step_service.update_step(id, request.data)
        return Response(updated_step, status=status.HTTP_200_OK)
