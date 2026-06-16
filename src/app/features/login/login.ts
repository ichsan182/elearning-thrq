import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

}

/*
  auth.js - Simple client-side auth for demo purposes
  - Provides handleLogin(username,password)
  - Persists session in sessionStorage under 'auth'
  - Provides checkAuth(requiredRole) for route guard
*/

const USERS = [
  { username: 'admin_edu', password: 'passwordAdmin123', role: 'Admin' },
  { username: 'teacher_grade7', password: 'passwordTeacher123', role: 'Teacher Grade 7' },
];

const AUTH_KEY = 'auth';

function handleLogin(username, password) {
  const errorEl = document.getElementById('errorMsg');
  if (errorEl) errorEl.textContent = '';

  if (!username || !password) {
    if (errorEl) errorEl.textContent = 'Username dan password wajib diisi!';
    return false;
  }

  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    if (errorEl) errorEl.textContent = 'Username atau password salah. Silakan coba lagi.';
    return false;
  }

  // Persist session (sessionStorage used so session ends when browser closed)
  const payload = { username: user.username, role: user.role, logged: true };
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(payload));

  // Redirect based on role — integrate with Angular SPA routes
  if (user.role === 'Admin') {
    // Send admin into the Angular dashboard route
    window.location.href = '/dashboard';
  } else if (user.role && user.role.startsWith('Teacher')) {
    // Send teacher to manage-storage SPA route
    window.location.href = '/manage-storage';
  } else {
    window.location.href = '/auth/login.html';
  }

  return true;
}

// Form submit helper used by login.html
function handleLoginForm(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  handleLogin(username, password);
}

function getAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Route guard: ensure user logged in and (optionally) has required role
function checkAuth(requiredRole) {
  const auth = getAuth();
  if (!auth || !auth.logged) {
    // Not logged in
    window.location.href = 'login.html';
    return false;
  }

  if (requiredRole) {
    if (requiredRole.startsWith('Teacher')) {
      // for teacher pages we may accept any Teacher role or exact match
      if (!auth.role || !auth.role.startsWith('Teacher')) {
        window.location.href = 'login.html';
        return false;
      }
    } else {
      if (auth.role !== requiredRole) {
        window.location.href = 'login.html';
        return false;
      }
    }
  }

  return true;
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

// Expose functions globally
window.handleLogin = handleLogin;
window.handleLoginForm = handleLoginForm;
window.checkAuth = checkAuth;
window.logout = logout;

