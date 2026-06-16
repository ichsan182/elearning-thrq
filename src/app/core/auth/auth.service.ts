import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from './roles';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  grade?: number;
}

export interface AuthSession {
  name: string;
  email: string;
  role: Role;
  grade?: number;
}

const AUTH_STORAGE_KEY = 'auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly sessionSignal = signal<AuthSession | null>(this.readSession());
  readonly session = this.sessionSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  isLoggedIn(): boolean {
    return this.sessionSignal() !== null;
  }

  hasRole(role: Role): boolean {
    return this.sessionSignal()?.role === role;
  }

  login(email: string, password: string): Observable<AuthSession | null> {
    return this.http.get<UserRecord[]>(this.apiUrl, { params: { email, password } }).pipe(
      map(users => users[0] ?? null),
      map(user =>
        user ? { name: user.name, email: user.email, role: user.role, grade: user.grade } : null,
      ),
      map(session => {
        if (session) this.persistSession(session);
        return session;
      }),
      catchError(() => of(null)),
    );
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    this.sessionSignal.set(null);
  }

  private persistSession(session: AuthSession): void {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  private readSession(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }
}
