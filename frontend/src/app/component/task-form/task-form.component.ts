import { Component, inject, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { FormBuilder, Validators } from '@angular/forms';
import { ITask, TaskService } from '../../core/task.service';
import { IUser } from '../../interface/users';

interface ITaskPriority {
  value: ITask['priority'];
  label: string;
}

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent {
  private _bottomSheetRef =
    inject<MatBottomSheetRef<TaskFormComponent>>(MatBottomSheetRef);

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);

  priority: ITaskPriority[] = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
  ];

  title = this.data.task ? 'Edit Task' : 'Create Task';

  taskForm = this.fb.group({
    title: [this.data.task?.title, Validators.required],
    description: [this.data.task?.description, Validators.required],
    priority: [this.data.task?.priority || 'normal'],
    due_date: [this.data.task?.due_date],
    status: [this.data.status || 'todo'],
    assigned_to_id: [this.data.task?.assigned_to_id, Validators.required],
  });

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: { task: ITask; users: IUser[]; status: ITask['status'] },
    private snackBar: MatSnackBar
    
  ) {}

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  get userList(): IUser[] {
    return this.data.users || [];
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    if (this.data.task) {
      this.taskService
        .updateTask(this.data.task.id, this.taskForm.value as Partial<ITask>)
        .subscribe({
          next: () => {
            this.snackBar.open('Task updated successfully', 'Close', {
              duration: 2000,
          })},
          error: (error) => {
            this.snackBar.open('Error updating task', 'Close', {
              duration: 2000,
            });
          },
        });
    } else {
      this.taskService
        .createTask(this.taskForm.value as Partial<ITask>)
        .subscribe({
          next: () => {
            this.snackBar.open('Task created successfully', 'Close', {
              duration: 2000,
            });
          },
          error: (error) => {
            this.snackBar.open('Error creating task', 'Close', {
              duration: 2000,
            });
          },
        });
    }
    this._bottomSheetRef.dismiss();
  }
}
