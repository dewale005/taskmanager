from django.urls import path
from .views import RegisterUser, UserList 

urlpatterns = [
    path('register', RegisterUser.as_view(), name='register_user'),
    path('users', UserList.as_view(), name='user_list'),
]
