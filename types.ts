
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
  order: number;
}

export interface TimeLog {
  id: string;
  userId: string;
  date: string; 
  startTime?: string; 
  endTime?: string; 
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
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  durationMinutes: number;
  count?: number;
  notes: string;
}

export type WorkLocation = 'WFO' | 'WFH' | 'SITE' | 'OTHER';

export interface DayConfig {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  workLocation?: WorkLocation;
  isHoliday?: boolean;
  holidayName?: string;
  isWorkingDay?: boolean; // Specifically for overriding weekends
}

export type WidgetType = 
  | 'STATS_HOURS' 
  | 'STATS_AVG' 
  | 'STATS_TOP' 
  | 'STATS_ACTIVE_DAYS'
  | 'LOCATION_STATS' 
  | 'SESSION_STATS' 
  | 'PEAK_HOURS' 
  | 'WEEKLY_RHYTHM' 
  | 'ACTIVITY_BREAKDOWN' 
  | 'DISTRIBUTION' 
  | 'RECENT_LOGS'
  | 'LOG_ACTIVITY_FORM';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  w: number;
  h: number;
  x: number;
  y: number;
}

export interface CategoryComboItem {
  categoryId: string;
  subCategoryId?: string;
  defaultCount?: number;
}

export interface CategoryCombo {
  id: string;
  userId: string;
  name: string;
  items: CategoryComboItem[];
  color?: string;
}

export interface AppState {
  currentUser: User;
  categories: Category[];
  logs: TimeLog[];
  recurringTasks: RecurringTask[];
  teams: Team[];
  dayConfigs: DayConfig[];
  categoryCombos: CategoryCombo[];
}
