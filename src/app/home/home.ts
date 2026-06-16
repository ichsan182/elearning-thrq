import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../shared/components/navbar/navbar';
import { AuthService } from '../core/auth/auth.service';
import { gradesForRole } from '../core/auth/roles';

interface FileRecord {
  id: string;
  originalName: string;
  subject: string;
  grade: string;
  topics: string;
  formattedTitle: string;
  uploadDate: Date;
}

type GradeGroup = 'elementary' | 'middle' | 'high';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  form = { grade: '', subject: '', topics: '' };
  selectedFile: File | null = null;
  editingId: string | null = null;
  isDragOver = false;

  readonly todayStr = new Date().toISOString().split('T')[0];
  filterDate = this.todayStr;

  fileRecords: FileRecord[] = [];

  errors = { grade: '', subject: '', topics: '', file: '' };

  readonly subjectsByGroup: Record<GradeGroup, string[]> = {
    elementary: ['Bahasa Indonesia', 'Math', 'Science', 'IPS', 'PP (Pendidikan Pancasila)', 'Agama'],
    middle: ['Bahasa Indonesia', 'Math', 'Biology', 'Physics', 'IPS', 'PP (Pendidikan Pancasila)', 'Agama'],
    high: ['Bahasa Indonesia', 'Math', 'Biology', 'Physics', 'Chemistry', 'IPS', 'PP (Pendidikan Pancasila)', 'Agama', 'Economic', 'Business'],
  };

  constructor(private readonly auth: AuthService) {}

  get grades(): string[] {
    return gradesForRole(this.auth.session()?.role ?? 'Admin').map(n => `Grade-${n}`);
  }

  get gradeGroup(): GradeGroup | null {
    const n = parseInt(this.form.grade.replace('Grade-', ''));
    if (n >= 1 && n <= 6) return 'elementary';
    if (n >= 7 && n <= 9) return 'middle';
    if (n >= 10 && n <= 12) return 'high';
    return null;
  }

  get availableSubjects(): string[] {
    const g = this.gradeGroup;
    return g ? this.subjectsByGroup[g] : [];
  }

  get filteredRecords(): FileRecord[] {
    return this.fileRecords.filter(
      r => r.uploadDate.toISOString().split('T')[0] === this.filterDate,
    );
  }

  get isToday(): boolean {
    return this.filterDate === this.todayStr;
  }

  get isYesterday(): boolean {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return this.filterDate === d.toISOString().split('T')[0];
  }

  get gradeNumber(): string {
    return this.form.grade.replace('Grade-', '');
  }

  get isFormValid(): boolean {
    return (
      !!this.form.grade &&
      !!this.form.subject &&
      !!this.form.topics.trim() &&
      (!!this.selectedFile || !!this.editingId)
    );
  }

  onGradeChange(): void {
    this.form.subject = '';
    this.errors.grade = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.handleFile(input.files[0]);
    input.value = '';
  }

  handleFile(file: File): void {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext)) {
      this.selectedFile = file;
      this.errors.file = '';
    } else {
      this.errors.file = 'Hanya file PDF, Word (.doc/.docx), atau Excel (.xls/.xlsx) yang diizinkan.';
      this.selectedFile = null;
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.errors.file = '';
  }

  validate(): boolean {
    let ok = true;
    if (!this.form.grade) {
      this.errors.grade = 'Pilih grade terlebih dahulu.'; ok = false;
    } else {
      this.errors.grade = '';
    }
    if (!this.form.subject) {
      this.errors.subject = 'Pilih subject terlebih dahulu.'; ok = false;
    } else {
      this.errors.subject = '';
    }
    if (!this.form.topics.trim()) {
      this.errors.topics = 'Topics tidak boleh kosong.'; ok = false;
    } else {
      this.errors.topics = '';
    }
    if (!this.selectedFile && !this.editingId) {
      this.errors.file = 'Upload file terlebih dahulu.'; ok = false;
    } else {
      this.errors.file = '';
    }
    return ok;
  }

  onSubmit(): void {
    if (!this.validate()) return;

    const num = this.form.grade.replace('Grade-', '');
    const title = `G-${num} ${this.form.topics.trim()}`;

    if (this.editingId) {
      this.fileRecords = this.fileRecords.map(r =>
        r.id !== this.editingId ? r : {
          ...r,
          subject: this.form.subject,
          grade: this.form.grade,
          topics: this.form.topics.trim(),
          formattedTitle: title,
          originalName: this.selectedFile ? this.selectedFile.name : r.originalName,
        },
      );
    } else {
      this.fileRecords.unshift({
        id: Date.now().toString(),
        originalName: this.selectedFile!.name,
        subject: this.form.subject,
        grade: this.form.grade,
        topics: this.form.topics.trim(),
        formattedTitle: title,
        uploadDate: new Date(),
      });
      this.filterDate = this.todayStr;
    }

    this.resetForm();
  }

  editRecord(record: FileRecord): void {
    this.editingId = record.id;
    this.form.grade = record.grade;
    this.form.subject = record.subject;
    this.form.topics = record.topics;
    this.selectedFile = null;
    this.errors = { grade: '', subject: '', topics: '', file: '' };
  }

  deleteRecord(id: string): void {
    this.fileRecords = this.fileRecords.filter(r => r.id !== id);
    if (this.editingId === id) this.resetForm();
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.form = { grade: '', subject: '', topics: '' };
    this.selectedFile = null;
    this.editingId = null;
    this.errors = { grade: '', subject: '', topics: '', file: '' };
  }

  setFilterToday(): void {
    this.filterDate = this.todayStr;
  }

  setFilterYesterday(): void {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    this.filterDate = d.toISOString().split('T')[0];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  getFileExt(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() ?? 'file';
  }
}
