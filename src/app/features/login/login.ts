import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Username dan password wajib diisi!';
      return;
    }

    this.isSubmitting = true;
    this.auth.login(this.username.trim(), this.password).subscribe(session => {
      this.isSubmitting = false;

      if (!session) {
        this.errorMessage = 'Username atau password salah. Silakan coba lagi.';
        return;
      }

      this.router.navigateByUrl('/dashboard');
    });
  }
}
