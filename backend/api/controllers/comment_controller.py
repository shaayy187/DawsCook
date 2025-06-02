from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.exceptions import ValidationError
from ..services.comment_service import create_comment, update_comment, delete_comment
from ..serializer import CommentSerializer


class CommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Create a new comment under a recipe.  Requires authentication.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["recipe", "text"],
            properties={
                "recipe": openapi.Schema(
                    type=openapi.TYPE_INTEGER, description="ID of the recipe being commented on"
                ),
                "text": openapi.Schema(
                    type=openapi.TYPE_STRING, description="Comment text"
                ),
                "parent": openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="(Optional) ID of parent comment, if this is a reply"
                ),
            },
        ),
        responses={
            201: openapi.Response(
                description="Newly created comment",
                schema=CommentSerializer()
            ),
            400: "Validation error (e.g. missing fields or invalid IDs)",
            401: "Unauthorized (if not logged in)"
        }
    )
    def post(self, request):
        try:
            created = create_comment(request.data, user=request.user)
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)

        out_serializer = CommentSerializer(created, context={"request": request})
        return Response(out_serializer.data, status=status.HTTP_201_CREATED)


    @swagger_auto_schema(
        operation_description="Update an existing comment.  Only text and/or parent can be changed.",
        manual_parameters=[
            openapi.Parameter(
                'id', openapi.IN_PATH, description="Comment ID", type=openapi.TYPE_INTEGER
            )
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "text": openapi.Schema(
                    type=openapi.TYPE_STRING, description="New comment text"
                ),
                "parent": openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="(Optional) New parent comment ID (or null to remove reply)"
                ),
            },
        ),
        responses={
            200: openapi.Response(
                description="Updated comment object",
                schema=CommentSerializer()
            ),
            400: "Validation error (e.g. blank text, invalid parent ID)",
            401: "Unauthorized (if not logged in)",
            404: "Not Found (if comment ID does not exist)"
        }
    )
    def patch(self, request, id):
        try:
            updated = update_comment(comment_id=id, data=request.data)
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)

        if updated is None:
            return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

        out_serializer = CommentSerializer(updated, context={"request": request})
        return Response(out_serializer.data, status=status.HTTP_200_OK)


    @swagger_auto_schema(
        operation_description="Delete an existing comment.",
        manual_parameters=[
            openapi.Parameter(
                'id', openapi.IN_PATH, description="ID of the comment to delete", type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            204: "Comment deleted successfully",
            400: "Validation error (e.g. comment not found)",
            401: "Unauthorized (if not logged in)",
        }
    )
    def delete(self, request, id):
        try:
            delete_comment(comment_id=id)
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
