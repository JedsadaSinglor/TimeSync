
import { Category, TimeLog, User, Team, UserRole } from './types';

export const INITIAL_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'My Workspace', 
    email: 'me@timesync.com', 
    avatar: 'https://ui-avatars.com/api/?name=Me&background=0ea5e9&color=fff', 
    position: 'Owner',
    role: UserRole.ADMIN,
    teamIds: []
  }
];

export const INITIAL_TEAMS: Team[] = [];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'c_meeting',
    name: 'Meeting',
    color: '#ef4444', // Red-ish
    subCategories: [
      { id: 'sc_m_1', name: 'Daily Standup', minutes: 30 },
      { id: 'sc_m_2', name: 'Client Call', minutes: 30 },
    ]
  },
  {
    id: 'c_work',
    name: 'Deep Work',
    color: '#f97316', // Orange-ish
    subCategories: [
      { id: 'sc_w_1', name: 'Coding', minutes: 60 },
      { id: 'sc_w_2', name: 'Design', minutes: 60 },
      { id: 'sc_w_3', name: 'Research', minutes: 30 },
    ]
  },
  {
    id: 'c_admin',
    name: 'Admin',
    color: '#3b82f6', // Blue-ish
    subCategories: [
      { id: 'sc_a_1', name: 'Emails', minutes: 15 },
      { id: 'sc_a_2', name: 'Planning', minutes: 15 },
    ]
  }
];

export const MOCK_LOGS: TimeLog[] = [
  {
    id: 'l1',
    userId: 'u1',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    categoryId: 'c_work',
    subCategoryId: 'sc_w_1',
    durationMinutes: 60,
    notes: 'Project Alpha development'
  },
  {
    id: 'l2',
    userId: 'u1',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:30',
    categoryId: 'c_meeting',
    subCategoryId: 'sc_m_1',
    durationMinutes: 30,
    notes: 'Sync'
  }
];
