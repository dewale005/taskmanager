import { Component, inject, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ITask } from '../../core/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { IUser } from '../../interface/users';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
})
export class TaskItemComponent {
  private _bottomSheet = inject(MatBottomSheet);
  @Input() task!: ITask;
  @Input() users!: IUser[];


  openBottomSheet(): void {
    this._bottomSheet.open(TaskFormComponent, {
      data: {
        task: this.task,
        users: this.users,
        status: this.task.status,
      },
    });
  }
}
