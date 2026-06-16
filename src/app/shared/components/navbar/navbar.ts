import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Input() username = 'Admin';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  // Logout action: clear session and navigate to login
  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
