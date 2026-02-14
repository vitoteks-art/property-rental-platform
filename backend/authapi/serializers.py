from django.contrib.auth import authenticate
from rest_framework import serializers

from users.models import User, UserRole


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    # Allow only tenant/landlord at registration
    role = serializers.ChoiceField(choices=[UserRole.TENANT, UserRole.LANDLORD], required=False)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "first_name", "last_name", "role")
        read_only_fields = ("id",)

    def create(self, validated_data):
        role = validated_data.pop("role", UserRole.TENANT)
        user = User(
            username=validated_data.get("username"),
            email=validated_data.get("email", ""),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=role,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs.get("username"), password=attrs.get("password"))
        if not user:
            raise serializers.ValidationError("Invalid username or password")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "timezone",
            "bio",
        )


class UserUpdateSerializer(serializers.ModelSerializer):
    """Editable profile fields."""

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "phone",
            "timezone",
            "bio",
        )
