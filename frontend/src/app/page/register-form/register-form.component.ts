import { Component, inject } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';


@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  registerForm = this.fb.group({
    email: [null, Validators.required],
    username: [null, Validators.required],
    password: [null, Validators.required],
  });

  hide = true;
  isSubmitting = false;
  errorMsg = null;

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.isSubmitting = true;
    this.errorMsg = null;
    const email = this.registerForm.value.email ?? '';
    const username = this.registerForm.value.username ?? '';
    const password = this.registerForm.value.password ?? '';
    this.authService.registerUser({ email, username, password }).subscribe({
      next: () => {
        this.router.navigate(['/']); // Redirect on success
      }
      , error: (err) => {
        console.error('Registration error:', err); 
        this.errorMsg = err.message || 'Registration failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
