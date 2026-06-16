import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Navbar } from '../../shared/components/navbar/navbar';

type Role = 'Admin' | string;

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
}

@Component({
  selector: 'app-manage-user',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './manage-user.html',
  styleUrl: './manage-user.css',
})
export class ManageUser {
  readonly username = 'Admin';

  // In-memory users list. Replace with API calls later.
  users: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', password: 'secret', role: 'Admin' },
    { id: 2, name: 'Teacher One', email: 'teacher1@example.com', password: 'secret', role: 'Teacher Grade 1' },
  ];

  // Roles: Admin + Teacher Grade 1..12
  teacherRoles = Array.from({ length: 12 }, (_, i) => `Teacher Grade ${i + 1}`);

  // Modal & form state
  showModal = false;
  isEdit = false;
  editIndex: number | null = null;

  // UI state for dashboard enhancements
  searchTerm = '';
  selectedRole = '';
  cardView = false;

  // Model bound to the form in the modal
  formModel: Partial<User> = this.emptyModel();

  // Utility to create an empty model
  emptyModel(): Partial<User> {
    return { name: '', email: '', password: '', role: '' };
  }

  // CRUD: Read users (returns a copy)
  readUsers(): User[] {
    return [...this.users];
  }

  // CRUD: Add a new user
  addUser(payload: Partial<User>): void {
    // Basic validation: ensure required fields exist (form already validates)
    const id = this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id,
      name: String(payload.name).trim(),
      email: String(payload.email).trim(),
      password: String(payload.password),
      role: String(payload.role) as Role,
    };
    this.users = [...this.users, newUser];
  }

  // CRUD: Update an existing user by index
  updateUser(index: number, payload: Partial<User>): void {
    const existing = this.users[index];
    if (!existing) return;
    const updated: User = {
      ...existing,
      name: String(payload.name).trim(),
      email: String(payload.email).trim(),
      password: String(payload.password),
      role: String(payload.role) as Role,
    };
    const copy = [...this.users];
    copy[index] = updated;
    this.users = copy;
  }

  // CRUD: Delete a user by index
  deleteUser(index: number): void {
    this.users = this.users.filter((_, i) => i !== index);
  }

  // Open modal in Add mode
  openAddModal(): void {
    this.isEdit = false;
    this.editIndex = null;
    this.formModel = this.emptyModel();
    this.showModal = true;
  }

  // Open modal in Edit mode, prefill formModel
  openEditModal(index: number): void {
    const u = this.users[index];
    if (!u) return;
    this.isEdit = true;
    this.editIndex = index;
    this.formModel = { ...u };
    this.showModal = true;
  }

  // Close modal and reset
  closeModal(): void {
    this.showModal = false;
    this.isEdit = false;
    this.editIndex = null;
    this.formModel = this.emptyModel();
  }

  // Called when the modal form is submitted
  onSubmit(form: NgForm): void {
    if (form.invalid) return; // form-level guard

    if (this.isEdit && this.editIndex !== null) {
      // Update existing user
      this.updateUser(this.editIndex, this.formModel);
    } else {
      // Add new user
      this.addUser(this.formModel);
    }

    this.closeModal();
  }

  // Confirm before deleting
  confirmDelete(index: number): void {
    const u = this.users[index];
    if (!u) return;
    const confirmed = window.confirm(`Hapus user "${u.name}"? Tindakan ini tidak dapat dibatalkan.`);
    if (confirmed) this.deleteUser(index);
  }

  // Computed: filtered users based on search and role
  get filteredUsers(): User[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.users.filter(u => {
      const matchRole = this.selectedRole ? u.role === this.selectedRole : true;
      const matchQuery = q ? (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : true;
      return matchRole && matchQuery;
    });
  }

  // Summary stats for dashboard cards
  get totalUsers(): number { return this.users.length; }
  get totalAdmins(): number { return this.users.filter(u => u.role === 'Admin').length; }
  get totalTeachers(): number { return this.users.filter(u => u.role.startsWith('Teacher')).length; }

  // Small helper to return initials for avatar
  initials(name?: string): string {
    if (!name) return '';
    return name.split(' ').map(s => s[0] || '').slice(0,2).join('').toUpperCase();
  }
}
