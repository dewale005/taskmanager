# Generated by Django 5.2 on 2025-04-04 08:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('task', '0003_alter_task_due_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='ordering',
            field=models.IntegerField(default=0),
        ),
    ]
