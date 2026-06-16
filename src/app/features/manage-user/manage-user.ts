import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../shared/components/navbar/navbar';
import { environment } from '../../../environments/environment';
import { Role, ROLE_LABELS, TEACHER_ROLES, roleForGrade } from '../../core/auth/roles';

type AccountType = 'Admin' | 'Teacher';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  grade?: number;
}

interface UserFormModel {
  name: string;
  email: string;
  password: string;
  accountType: AccountType | '';
  grade: number | null;
}

@Component({
  selector: 'app-manage-user',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './manage-user.html',
  styleUrl: './manage-user.css',
})
export class ManageUser implements OnInit {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  readonly roleLabels = ROLE_LABELS;
  readonly teacherRoles = TEACHER_ROLES;
  readonly allGrades = Array.from({ length: 12 }, (_, i) => i + 1);

  users: User[] = [];

  // Modal & form state
  showModal = false;
  isEdit = false;
  editingId: number | null = null;

  // UI state for dashboard enhancements
  searchTerm = '';
  selectedRole = '';
  cardView = false;

  // Model bound to the form in the modal
  formModel: UserFormModel = this.emptyModel();

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<User[]>(this.apiUrl).subscribe(users => (this.users = users));
  }

  // Utility to create an empty model
  emptyModel(): UserFormModel {
    return { name: '', email: '', password: '', accountType: '', grade: null };
  }

  // Role derived automatically from the chosen grade (grade 1-6 -> SD, 7-9 -> SMP, 10-12 -> SMA)
  get derivedRole(): Role | null {
    if (this.formModel.accountType === 'Admin') return 'Admin';
    if (this.formModel.accountType === 'Teacher' && this.formModel.grade) {
      return roleForGrade(this.formModel.grade);
    }
    return null;
  }

  // Open modal in Add mode
  openAddModal(): void {
    this.isEdit = false;
    this.editingId = null;
    this.formModel = this.emptyModel();
    this.showModal = true;
  }

  // Open modal in Edit mode, prefill formModel
  openEditModal(user: User): void {
    this.isEdit = true;
    this.editingId = user.id;
    this.formModel = {
      name: user.name,
      email: user.email,
      password: user.password,
      accountType: user.role === 'Admin' ? 'Admin' : 'Teacher',
      grade: user.grade ?? null,
    };
    this.showModal = true;
  }

  // Close modal and reset
  closeModal(): void {
    this.showModal = false;
    this.isEdit = false;
    this.editingId = null;
    this.formModel = this.emptyModel();
  }

  // Called when the modal form is submitted; persists via json-server
  onSubmit(form: NgForm): void {
    if (form.invalid || !this.derivedRole) return;

    const payload: Omit<User, 'id'> = {
      name: this.formModel.name.trim(),
      email: this.formModel.email.trim(),
      password: this.formModel.password,
      role: this.derivedRole,
      ...(this.formModel.accountType === 'Teacher' ? { grade: this.formModel.grade! } : {}),
    };

    if (this.isEdit && this.editingId !== null) {
      this.http.put<User>(`${this.apiUrl}/${this.editingId}`, payload).subscribe(updated => {
        this.users = this.users.map(u => (u.id === updated.id ? updated : u));
        this.closeModal();
      });
    } else {
      this.http.post<User>(this.apiUrl, payload).subscribe(created => {
        this.users = [...this.users, created];
        this.closeModal();
      });
    }
  }

  // Confirm before deleting, then remove from json-server
  confirmDelete(user: User): void {
    const confirmed = window.confirm(`Hapus user "${user.name}"? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmed) return;

    this.http.delete(`${this.apiUrl}/${user.id}`).subscribe(() => {
      this.users = this.users.filter(u => u.id !== user.id);
    });
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
  get totalTeachers(): number { return this.users.filter(u => u.role !== 'Admin').length; }

  roleLabel(role: Role): string {
    return this.roleLabels[role];
  }

  // Small helper to return initials for avatar
  initials(name?: string): string {
    if (!name) return '';
    return name.split(' ').map(s => s[0] || '').slice(0,2).join('').toUpperCase();
  }
}
