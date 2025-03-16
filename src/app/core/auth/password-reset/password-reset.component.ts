import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class PasswordResetComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  resetForm: FormGroup;
  showResetFields = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', []],
      newPassword: ['', []],
      confirmPassword: ['', []]
    });
  }

  get email() { return this.resetForm.get('email'); }
  get code() { return this.resetForm.get('code'); }
  get newPassword() { return this.resetForm.get('newPassword'); }
  get confirmPassword() { return this.resetForm.get('confirmPassword'); }

  onSubmit() {
    if (this.resetForm.valid) {
      if (!this.showResetFields()) {
        // パスワードリセットを要求
        this.loading.set(true);
        this.authService.requestPasswordReset({ email: this.email?.value }).subscribe({
          next: () => {
            this.showResetFields.set(true);
            this.updateValidators();
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'パスワードリセットの要求に失敗しました');
            this.loading.set(false);
          }
        });
      } else {
        // パスワードリセットを実行
        const { email, code, newPassword } = this.resetForm.value;
        this.loading.set(true);
        this.authService.confirmPasswordReset({
          email,
          code,
          newPassword,
        }).subscribe({
          next: () => {
            this.router.navigate(['/auth/login']);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'パスワードのリセットに失敗しました');
            this.loading.set(false);
          }
        });
      }
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  private updateValidators() {
    const passwordValidators = [Validators.required, Validators.minLength(6)];
    this.resetForm.get('code')?.setValidators([Validators.required]);
    this.resetForm.get('newPassword')?.setValidators(passwordValidators);
    this.resetForm.get('confirmPassword')?.setValidators([
      Validators.required,
      this.passwordMatchValidator.bind(this)
    ]);
    this.resetForm.updateValueAndValidity();
  }

  private passwordMatchValidator() {
    if (!this.resetForm) return null;
    
    const password = this.resetForm.get('newPassword')?.value;
    const confirmPassword = this.resetForm.get('confirmPassword')?.value;
    
    if (password === confirmPassword) {
      return null;
    }
    
    return { passwordMismatch: true };
  }
}