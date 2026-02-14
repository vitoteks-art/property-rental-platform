from rest_framework.permissions import BasePermission


class IsSelf(BasePermission):
    """Allows access only to the authenticated user acting on their own profile."""

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and obj == request.user
