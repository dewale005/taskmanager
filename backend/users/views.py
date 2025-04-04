from rest_framework.response import Response
from rest_framework.settings import api_settings
from .serializers import UserSerializer, RegisterSerializer
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model


class RegisterUser(APIView):
    """
    API view to register a new user.
    """
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES

    def post(self, request):
        """
        Handle POST requests to register a new user.

        This method validates the incoming user registration data using the
        `RegisterSerializer`. If the data is valid, a new user is created,
        and a pair of JWT tokens (refresh and access) is generated for the
        user.

        Returns:
            Response:
                - On success (HTTP 201): A JSON response containing the
                    serialized user data, refresh token, and access token.
                - On failure (HTTP 400): A JSON response containing the
                    validation errors.

        Args:
            request (Request): The HTTP request object containing user
                            registration data.
        """
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserList(generics.ListAPIView):
    """
    API view to retrieve a list of users.
    """
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Restrict the queryset based on the user's role.
        Superusers and staff can view all users, while regular users can
        only view their own user information.
        """
        user = self.request.user
        if user.is_superuser or user.is_staff:
            return get_user_model().objects.all()
        return get_user_model().objects.filter(id=user.id)
