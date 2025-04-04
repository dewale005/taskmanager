import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { IUser } from '../interface/users';



export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

export interface ITask {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string; // ISO 8601 timestamp
  created_by: IUser;
  assigned_to: IUser;
  assigned_to_id: number;
  ordering: number;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'http://localhost:8080/api/task';
  private tasksSubject = new BehaviorSubject<ITask[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTasks(): Observable<ITask[]> {
    return this.http.get<ITask[]>(`${this.baseUrl}`).pipe(
      tap((tasks) => this.tasksSubject.next(tasks))
    );
  }

  refreshTasks(): void {
    this.getTasks().subscribe();
  }

  getTask(id: number): Observable<ITask> {
    return this.http.get<ITask>(`${this.baseUrl}/${id}`);
  }

  createTask(task: Partial<ITask>): Observable<ITask> {
    return this.http.post<ITask>(`${this.baseUrl}`, task).pipe(
      tap(() => this.refreshTasks())
    );
  }

  updateTask(id: number, task: Partial<ITask>): Observable<ITask> {
    return this.http.put<ITask>(`${this.baseUrl}/${id}`, task).pipe(
      tap(() => this.refreshTasks())
    );
  }

  updatePatchTask(id: number, task: Partial<ITask>): Observable<ITask> {
    return this.http.patch<ITask>(`${this.baseUrl}/${id}`, task).pipe(
      tap(() => this.refreshTasks())
    );
  }
}
