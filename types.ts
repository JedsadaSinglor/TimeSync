
export enum UserRole {
  ADMIN = 'ADMIN',
  GROUP_LEADER = 'GROUP_LEADER',
  TEAM_LEADER = 'TEAM_LEADER',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  position?: string;
  avatar?: string;
  role: UserRole;
  teamIds: string[];
  teamRoles?: Record<string, UserRole>; // Map teamId -> role
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  joinCode: string;
}

export interface SubCategory {
  id: string;
  name: string;
  minutes?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  subCategories: SubCategory[];
  teamId?: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  date: string; 
  startTime: string; 
  endTime: string; 
  categoryId: string;
  subCategoryId: string;
  durationMinutes: number;
  count?: number; 
  notes: string;
}

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface RecurringTask {
  id: string;
  userId: string;
  categoryId: string;
  subCategoryId: string; // 'general' or specific ID
  frequency: RecurrenceFrequency;
  weekDays?: number[]; // 0-6 for Sunday-Saturday (used for WEEKLY)
  dayOfMonth?: number; // 1-31 (used for MONTHLY)
  durationMinutes: number;
  count?: number;
  notes: string;
}

export interface AppState {
  currentUser: User;
  categories: Category[];
  logs: TimeLog[];
  recurringTasks: RecurringTask[];
  teams: Team[];
}
