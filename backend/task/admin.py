from django.contrib import admin
from .models import Task


class TaskAdmin(admin.ModelAdmin):
    """
    TaskAdmin is a Django ModelAdmin class for managing the Task model in the
    admin interface.
    Attributes:
        list_display (tuple): Specifies the fields to display in the list view
                        of the admin interface.
        search_fields (tuple): Defines the fields that can be searched using
                        the search bar in the admin interface.
        list_filter (tuple): Specifies the fields to filter by in the admin
                        interface.
        ordering (tuple): Determines the default ordering of the records in
                        the admin interface.
    """

    list_display = (
        'title', 'status', 'created_by', 'priority', 'due_date',
        'assigned_to', 'ordering', 'updated_at'
    )
    search_fields = ('title', 'description')
    list_filter = ('status', 'priority', 'assigned_to')
    ordering = ('-created_at',)


# Register your models here.
admin.site.site_header = "Task Management Admin"
admin.site.site_title = "Task Management Admin Portal"
admin.site.index_title = "Welcome to Task Management Admin"
admin.site.register(Task, TaskAdmin)
