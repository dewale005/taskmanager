from .models import Task
from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model


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
        model = get_user_model()
        fields = ['id', 'username', 'email']
        read_only_fields = ['id', 'username', 'email']


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.
    This serializer converts Task model instances into JSON format and
    validates incoming data for creating or updating Task instances.
    Attributes:
        Meta (class): Defines metadata for the serializer, including the model
            it is based on and the fields to include in the serialized output.
    Fields:
        id (int): The unique identifier for the task.
        title (str): The title of the task.
        description (str): The description of the task.
        status (str): The status of the task.
        created_by (UserSerializer): The user who created the task.
        assigned_to (UserSerializer): The user to whom the task is assigned.
        created_at (datetime): The timestamp when the task was created.
        updated_at (datetime): The timestamp when the task was last updated.
    """
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        source='assigned_to',
        required=False
    )
    ordering = serializers.IntegerField(required=False)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority', 'due_date',
            'ordering', 'created_by', 'assigned_to', 'assigned_to_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        """
        Creates a new Task instance with the provided validated data.

        This method assigns an ordering value to the new Task instance 
        based on the current maximum ordering value within the same 
        status group. If no tasks exist in the specified status group, 
        the ordering value starts at 1.

        Args:
            validated_data (dict): The validated data for creating the 
            Task instance.

        Returns:
            Task: The newly created Task instance with the assigned 
            ordering value.
      """
        status = validated_data.get('status')

        # Get the current max order in that status group
        max_order = Task.objects.filter(status=status).aggregate(
            max_order=serializers.models.Max('ordering')
        )['max_order'] or 0

        validated_data['ordering'] = max_order + 1
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Updates the given instance with the provided validated data, ensuring
        that the order and status changes are handled correctly.

        If the `status` or `order` fields are updated, the method adjusts the
        positions of other tasks to accommodate the changes and maintains the
        correct ordering within the target column.

        Args:
            instance (Model): The instance to be updated.
            validated_data (dict): A dictionary containing the new data for the
                    instance.

        Returns:
            Model: The updated instance.

        Raises:
            Exception: If any database operation within the atomic transaction
                    fails.
        """
        old_status = instance.status
        old_order = instance.ordering

        new_status = validated_data.get('status', old_status)
        new_order = validated_data.get('ordering', old_order)

        with transaction.atomic():
            # 🧠 First: shift other tasks if order and status are changing
            if old_status != new_status or old_order != new_order:
                self.shift_others_for_insert(instance, new_status, new_order)

            # Update the instance after space is made
            instance = super().update(instance, validated_data)

            # Normalize the order in the target column
            self.reorder_column(new_status)

        return instance

    def shift_others_for_insert(self, task, target_status, target_order):
        """
        Ensures no other task has the same (status, order).
        If a conflict exists, shift existing tasks at or after the new
        position.
        """
        with transaction.atomic():
            # Step 1: Normalize all tasks in the target status
            tasks = (
                Task.objects
                .filter(status=target_status)
                .exclude(id=task.id)
                .order_by('ordering')
            )

            reordered_tasks = []
            for new_order, t in enumerate(tasks):
                if t.ordering != new_order:
                    t.ordering = new_order
                    reordered_tasks.append(t)

            if reordered_tasks:
                Task.objects.bulk_update(reordered_tasks, ['ordering'])

            # Step 2: Shift all tasks with order >= target_order
            # Must re-fetch tasks in case normalization changed them
            tasks_to_shift = (
                Task.objects
                .filter(status=target_status, ordering__gte=target_order)
                .exclude(id=task.id)
                .order_by('-ordering')  # reverse to avoid collision
            )

            for t in tasks_to_shift:
                t.ordering += 1

            if tasks_to_shift:
                Task.objects.bulk_update(tasks_to_shift, ['ordering'])

    def reorder_column(self, status):
        """
        Normalizes the order field for all tasks in the given status to avoid
        gaps.
        """
        tasks = Task.objects.filter(status=status).order_by('ordering')
        for index, task in enumerate(tasks):
            if task.ordering != index:
                task.ordering = index
        Task.objects.bulk_update(tasks, ['ordering'])
