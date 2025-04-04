from django.urls import path
from .views import TaskDetailView, TaskListCreateView

urlpatterns = [
    path('task', TaskListCreateView.as_view(), name='task-list-create'),
    path('task/<int:id>', TaskDetailView.as_view(), name='task-detail'),
]
