import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('auth_token');
    const isAuthRequest = request.url.includes('/auth/login') || request.url.includes('/auth/register');

    if (token && !isAuthRequest) {
      // Clone the request and add the Authorization header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('Unauthorized - redirecting to login...');
          localStorage.removeItem('auth_token'); // Optional logout
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}
