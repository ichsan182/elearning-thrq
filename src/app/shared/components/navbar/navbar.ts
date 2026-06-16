import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  get username(): string {
    return this.auth.session()?.name ?? 'User';
  }

  get isAdmin(): boolean {
    return this.auth.session()?.role === 'Admin';
  }

  // Logout action: clear session and navigate to login
  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
