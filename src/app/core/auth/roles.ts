export type TeacherRole = 'teacher-sd' | 'teacher-smp' | 'teacher-sma';
export type Role = 'Admin' | TeacherRole;

export const TEACHER_ROLES: TeacherRole[] = ['teacher-sd', 'teacher-smp', 'teacher-sma'];

export const ROLE_LABELS: Record<Role, string> = {
  Admin: 'Admin',
  'teacher-sd': 'Teacher SD',
  'teacher-smp': 'Teacher SMP',
  'teacher-sma': 'Teacher SMA',
};

export function isTeacherRole(role: string): role is TeacherRole {
  return (TEACHER_ROLES as string[]).includes(role);
}

export function roleForGrade(grade: number): TeacherRole {
  if (grade <= 6) return 'teacher-sd';
  if (grade <= 9) return 'teacher-smp';
  return 'teacher-sma';
}

export function gradesForRole(role: Role): number[] {
  if (role === 'teacher-sd') return [1, 2, 3, 4, 5, 6];
  if (role === 'teacher-smp') return [7, 8, 9];
  if (role === 'teacher-sma') return [10, 11, 12];
  return Array.from({ length: 12 }, (_, i) => i + 1);
}
