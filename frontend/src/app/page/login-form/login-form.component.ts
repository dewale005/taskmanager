
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  loginForm = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required],
  });

  hide = true;
  isSubmitting = false;
  errorMsg = null;

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.errorMsg = null;

    const username = this.loginForm.value.username ?? '';
    const password = this.loginForm.value.password ?? '';

    this.authService.loginUser({ username, password }).subscribe({
      next: () => {
        this.router.navigate(['/']); // Redirect on success
      },
      error: (err) => {
        this.errorMsg = err.message || 'Login failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
