from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    LANDLORD = "LANDLORD", "Landlord"
    TENANT = "TENANT", "Tenant"
    ADMIN = "ADMIN", "Admin"


class User(AbstractUser):
    """Custom user with role + profile fields."""

    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.TENANT,
    )

    # Profile fields (Week 1.5+)
    phone = models.CharField(max_length=32, blank=True, default="")
    timezone = models.CharField(max_length=64, blank=True, default="")
    bio = models.TextField(blank=True, default="")

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"
