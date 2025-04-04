import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

type LoginPayload = {
  username: string;
  password: string;
}

type RegisterPayload =  LoginPayload & {
  email: string;}

type AuthResponse = {
  user?: {
    id: number;
    username: string;
    email: string;
  },
  refresh: string;
  access: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth'; // Replace with your real API URL
  private tokenKey = 'auth_token';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMsg = error.error?.detail 
      ? error.error.detail
      : error.error 
      ? Object.entries(error.error)
        .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
        .join('  ')
      : 'Authentication failed. Try again.';
    return throwError(() => new Error(errorMsg));
  }

   /** Save token and mark user as authenticated */
   private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.access);
    this.isAuthenticatedSubject.next(true);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return !!token;
  }

  loginUser(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login/`, payload).pipe(
      tap((response: AuthResponse) => this.handleAuthSuccess(response)),
      catchError(this.handleError));
   }

   registerUser(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap((response: AuthResponse) => this.handleAuthSuccess(response)),
      catchError(this.handleError));
   }

   logoutUser(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
  }
}
