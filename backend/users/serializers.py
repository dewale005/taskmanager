from typing import Any, Dict, Type
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

User = get_user_model()  # Avoid repeated function calls


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    This serializer converts User model instances into JSON format and 
    validates incoming data for creating or updating User instances.
    Attributes:
        Meta (class): Defines metadata for the serializer, including the model
            it is based on and the fields to include in the serialized output.
    Fields:
        id (int): The unique identifier for the user.
        username (str): The username of the user.
        email (str): The email address of the user.
    """

    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and validating a User instance.
    """

    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        read_only_fields = ('id',)

    def create(self, validated_data: Dict[str, Any]) -> User:  # type: ignore
        """
        Create and return a new user instance after setting the password
        properly.

        Args:
            validated_data (dict): Validated data from the serializer.

        Returns:
            User: The created user instance.
        """
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
