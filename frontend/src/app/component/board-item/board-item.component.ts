import { Component, inject, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ITask, TaskService } from '../../core/task.service';
import { UsersService } from '../../core/users.service';
import { IUser } from '../../interface/users';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-board-item',
  templateUrl: './board-item.component.html',
  styleUrls: ['./board-item.component.scss'],
})
export class BoardItemComponent implements OnInit {
  private _bottomSheet = inject(MatBottomSheet);
  private tasksService = inject(TaskService);
  private userService = inject(UsersService);
  statuses: { key: ITask['status']; label: string }[] = [
    { key: 'todo', label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ];

  users: IUser[] = [];

  tasks: any = {
    todo: [],
    inprogress: [],
    done: [],
  };

  connectedDropLists: string[] = ['todo', 'in_progress', 'done'];

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
    // Fetch tasks after users are fetched
    this.tasksService.tasks$.subscribe({
      next: (data) => {
        for (const task of this.statuses) {
          this.tasks[task.key] = data
            .filter((t) => t.status === task.key)
            .sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0));
        }
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
      },
    });
    this.tasksService.refreshTasks();
  }

  drop(event: CdkDragDrop<ITask[]>, newStatus: ITask['status']): void {
    const draggedItem = event.previousContainer.data[event.previousIndex];
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    console.log('Dragged item:', event.currentIndex, 'New status:', newStatus);
    this.tasksService
      .updatePatchTask(draggedItem.id, {
        ...draggedItem,
        status: newStatus,
        ordering: event.currentIndex,
      })
      .subscribe();
  }

  openTaskForm(status: ITask['status']) {
    this._bottomSheet.open(TaskFormComponent, {
      data: {
        status: status,
        users: this.users,
      },
    });
  }
}
