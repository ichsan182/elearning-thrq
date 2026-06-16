import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

interface DbUser {
  username: string;
  password: string;
  role: string;
}

interface Db {
  users: DbUser[];
}

export interface AuthSession {
  username: string;
  role: string;
}

const AUTH_STORAGE_KEY = 'auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<AuthSession | null>(this.readSession());
  readonly session = this.sessionSignal.asReadonly();

  constructor(private readonly http: HttpClient) {}

  isLoggedIn(): boolean {
    return this.sessionSignal() !== null;
  }

  hasRole(role: string): boolean {
    const current = this.sessionSignal();
    if (!current) return false;
    return role.startsWith('Teacher') ? current.role.startsWith('Teacher') : current.role === role;
  }

  login(username: string, password: string): Observable<AuthSession | null> {
    return this.http.get<Db>('/db.json').pipe(
      map(db => db.users.find(u => u.username === username && u.password === password)),
      map(user => (user ? { username: user.username, role: user.role } : null)),
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
