from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from rest_framework.exceptions import ValidationError, NotFound, AuthenticationFailed, PermissionDenied


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        detail = response.data.get('detail', response.data)
        return Response({
            'error': detail,
            'status': response.status_code
        }, status=response.status_code)

    if isinstance(exc, Http404) or isinstance(exc, NotFound):
        return Response({'error': 'Not found', 'status': 404}, status=404)

    if isinstance(exc, ValidationError):
        return Response({'error': exc.detail, 'status': 400}, status=400)

    if isinstance(exc, AuthenticationFailed):
        return Response({'error': 'Authentication failed', 'status': 401}, status=401)

    if isinstance(exc, PermissionDenied):
        return Response({'error': 'Permission denied', 'status': 403}, status=403)

    return Response({'error': 'Internal server error', 'status': 500}, status=500)
