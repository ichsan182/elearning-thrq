import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Navbar } from '../../shared/components/navbar/navbar';

type Level = 'Year' | 'Jenjang' | 'Grade' | 'Files';

interface FileItem {
  id: number;
  originalName: string; // original uploaded filename
  subject: string;
  gradeNumber: number; // number only, e.g., 7
  titleFormatted: string; // e.g., G-7 Algebra
  dateUploaded: string; // ISO date
}

@Component({
  selector: 'app-manage-storage',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './manage-storage.html',
  styleUrl: './manage-storage.css',
})
export class ManageStorage {
  // --- Navigation state ---
  years = ['Tahun Ajaran 2024 - 2025', 'Tahun Ajaran 2025 - 2026'];
  jenjang = ['SD', 'SMP', 'SMA'];
  sdGrades = Array.from({ length: 6 }, (_, i) => i + 1); // 1..6
  smpGrades = [7, 8, 9];
  smaGrades = [10, 11, 12];

  // breadcrumb / selection
  selectedYear: string | null = null;
  selectedJenjang: string | null = null;
  selectedGrade: number | null = null;

  // UI helpers
  get currentLevel(): Level {
    if (!this.selectedYear) return 'Year';
    if (!this.selectedJenjang) return 'Jenjang';
    if (!this.selectedGrade) return 'Grade';
    return 'Files';
  }

  // Simple in-memory file storage keyed by path: `${year}|${jenjang}|${grade}`
  filesMap: Record<string, FileItem[]> = {};

  // Upload form model
  uploadModel: Partial<FileItem & { topic?: string }> = { originalName: '', subject: '', gradeNumber: 0, titleFormatted: '' };
  uploadFileName = '';
  editIndex: number | null = null; // editing file index when in Files level

  subjects = ['Mathematics', 'Bahasa Indonesia', 'Science', 'English', 'Social Studies'];

  // --- Navigation methods ---
  openYear(year: string) {
    this.selectedYear = year;
    this.selectedJenjang = null;
    this.selectedGrade = null;
  }

  openJenjang(j: string) {
    this.selectedJenjang = j;
    this.selectedGrade = null;
  }

  openGrade(g: number) {
    this.selectedGrade = g;
    // prepare files map key if not exists
    const key = this.mapKey();
    if (!this.filesMap[key]) this.filesMap[key] = [];
  }

  back() {
    if (this.currentLevel === 'Files') {
      this.selectedGrade = null;
      return;
    }
    if (this.currentLevel === 'Grade') {
      this.selectedJenjang = null;
      return;
    }
    if (this.currentLevel === 'Jenjang') {
      this.selectedYear = null;
      return;
    }
  }

  breadcrumb(): string[] {
    const bc = ['Home'];
    if (this.selectedYear) bc.push(this.selectedYear);
    if (this.selectedJenjang) bc.push(this.selectedJenjang);
    if (this.selectedGrade) bc.push(`Grade ${this.selectedGrade}`);
    return bc;
  }

  // map key for filesMap
  mapKey(): string {
    return `${this.selectedYear ?? ''}|${this.selectedJenjang ?? ''}|${this.selectedGrade ?? ''}`;
  }

  // --- File CRUD ---
  readFiles(): FileItem[] {
    return this.filesMap[this.mapKey()] ?? [];
  }

  addFile(): void {
    // validate required fields
    const model = this.uploadModel;
    if (!model.originalName || !model.subject || !this.selectedGrade || !model.topic) return;
    const list = this.readFiles();
    const id = list.length ? Math.max(...list.map(f => f.id)) + 1 : 1;
    const title = `G-${this.selectedGrade} ${model.topic}`;
    const item: FileItem = {
      id,
      originalName: model.originalName,
      subject: model.subject,
      gradeNumber: this.selectedGrade!,
      titleFormatted: title,
      dateUploaded: new Date().toISOString().split('T')[0],
    };
    const key = this.mapKey();
    this.filesMap[key] = [...(this.filesMap[key] || []), item];
    this.resetUploadForm();
  }

  updateFile(idx: number): void {
    const list = this.readFiles();
    const model = this.uploadModel;
    if (!list[idx]) return;
    const updated: FileItem = {
      ...list[idx],
      originalName: model.originalName ?? list[idx].originalName,
      subject: model.subject ?? list[idx].subject,
      titleFormatted: `G-${list[idx].gradeNumber} ${model.topic ?? list[idx].titleFormatted.replace(/^G-\d+\s*/, '')}`,
      dateUploaded: list[idx].dateUploaded,
    };
    const key = this.mapKey();
    const copy = [...this.filesMap[key]];
    copy[idx] = updated;
    this.filesMap[key] = copy;
    this.resetUploadForm();
    this.editIndex = null;
  }

  deleteFile(idx: number): void {
    const key = this.mapKey();
    const list = this.filesMap[key] || [];
    const item = list[idx];
    if (!item) return;
    if (!confirm(`Hapus file "${item.originalName}" ?`)) return;
    this.filesMap[key] = list.filter((_, i) => i !== idx);
  }

  // Edit flow: populate uploadModel with file data
  editFile(idx: number): void {
    const list = this.readFiles();
    const item = list[idx];
    if (!item) return;
    this.uploadModel = { ...item, topic: item.titleFormatted.replace(/^G-\d+\s*/, '') };
    this.uploadFileName = item.originalName;
    this.editIndex = idx;
  }

  resetUploadForm(): void {
    this.uploadModel = { originalName: '', subject: '', gradeNumber: 0, titleFormatted: '' };
    this.uploadFileName = '';
  }

  // Handle file input change (simulate upload)
  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files && input.files[0];
    if (f) {
      this.uploadFileName = f.name;
      this.uploadModel.originalName = f.name;
    }
  }

  // Form submit handler
  onSubmit(form: NgForm) {
    if (form.invalid) return;
    if (this.editIndex !== null) this.updateFile(this.editIndex);
    else this.addFile();
  }

  // Helper to provide current date string for template (avoid using `new` in templates)
  get currentDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
