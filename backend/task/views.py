from rest_framework import generics, permissions
from .models import Task
from .serializers import TaskSerializer


class TaskListCreateView(generics.ListCreateAPIView):
    """
    API view to retrieve and create tasks.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Save the new task with the currently authenticated user as the creator.
        """
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        """
        Restrict the queryset based on the user's role.
        Superusers and staff can view all tasks, while regular users can
        only view tasks assigned to them.
        """
        user = self.request.user
        if user.is_superuser or user.is_staff:
            return Task.objects.all()
        return Task.objects.filter(assigned_to=user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view to retrieve, update, or delete a task.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
