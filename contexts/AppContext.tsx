
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Category, TimeLog, User, RecurringTask, Team, UserRole, DayConfig, DashboardWidget, CategoryCombo } from '../types';
import { INITIAL_CATEGORIES, MOCK_LOGS, INITIAL_USERS, INITIAL_TEAMS, DEFAULT_WIDGETS } from '../constants';
import { loadFromLocalStorage, getLocalDateStr, debouncedSave } from '../utils/storage';

interface AppContextType {
  currentUser: User;
  users: User[];
  categories: Category[];
  logs: TimeLog[];
  logsByDate: Record<string, TimeLog[]>;
  recurringTasks: RecurringTask[];
  teams: Team[];
  dayConfigs: DayConfig[];
  dashboardWidgets: DashboardWidget[];
  categoryCombos: CategoryCombo[];
  setCurrentUser: (user: User) => void;
  updateUser: (user: User) => void;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  login: (email: string) => boolean;
  addLog: (log: TimeLog) => void;
  batchAddLogs: (logs: TimeLog[]) => void;
  updateLog: (log: TimeLog) => void;
  deleteLog: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addRecurringTask: (task: RecurringTask) => void;
  deleteRecurringTask: (id: string) => void;
  applyRecurringTasks: (startDate: Date, endDate: Date, specificTasks?: RecurringTask[]) => number;
  createTeam: (name: string) => void;
  joinTeam: (code: string) => boolean;
  deleteTeam: (id: string) => void;
  updateDayConfig: (config: DayConfig) => void;
  updateDashboardWidgets: (widgets: DashboardWidget[]) => void;
  addCategoryCombo: (combo: CategoryCombo) => void;
  updateCategoryCombo: (combo: CategoryCombo) => void;
  deleteCategoryCombo: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;
  resetData: () => void;
  resetTimesheet: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper hook for debounced effect
const useDebouncedEffect = (effect: () => void, deps: React.DependencyList, delay: number) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from local storage or fall back to constants
  const [users, setUsers] = useState<User[]>(() => {
    return loadFromLocalStorage('users', INITIAL_USERS);
  });

  // Always logged in as the first user in Personal Mode, or persistent user
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const loadedUsers = loadFromLocalStorage('users', INITIAL_USERS);
    return loadedUsers[0];
  });
  
  // Load initial state
  const [categories, setCategories] = useState<Category[]>(() => 
    loadFromLocalStorage('categories', INITIAL_CATEGORIES)
  );
  
  const [logs, setLogs] = useState<TimeLog[]>(() => 
    loadFromLocalStorage('logs', MOCK_LOGS)
  );

  const logsByDate = useMemo(() => {
    const map: Record<string, TimeLog[]> = {};
    logs.forEach(log => {
        if (!map[log.date]) map[log.date] = [];
        map[log.date].push(log);
    });
    return map;
  }, [logs]);

  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>(() => 
    loadFromLocalStorage('recurringTasks', [])
  );

  const [teams, setTeams] = useState<Team[]>(() => 
    loadFromLocalStorage('teams', INITIAL_TEAMS)
  );

  const [dayConfigs, setDayConfigs] = useState<DayConfig[]>(() => 
    loadFromLocalStorage('dayConfigs', [])
  );

  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(() => 
    loadFromLocalStorage('dashboardWidgets', DEFAULT_WIDGETS)
  );

  const [categoryCombos, setCategoryCombos] = useState<CategoryCombo[]>(() => 
    loadFromLocalStorage('categoryCombos', [])
  );

  // Debounce storage writes
  useEffect(() => {
    debouncedSave('users', users);
  }, [users]);

  // Sync currentUser with users array if updated
  useDebouncedEffect(() => {
    if (currentUser) {
        // Find if current user data in array is different
        const inArray = users.find(u => u.id === currentUser.id);
        if (inArray && JSON.stringify(inArray) !== JSON.stringify(currentUser)) {
             setUsers(prev => prev.map(u => u.id === currentUser.id ? currentUser : u));
        }
    }
  }, [currentUser], 500);

  useEffect(() => {
    debouncedSave('categories', categories);
  }, [categories]);

  useEffect(() => {
    debouncedSave('logs', logs);
  }, [logs]);

  useEffect(() => {
    debouncedSave('recurringTasks', recurringTasks);
  }, [recurringTasks]);

  useEffect(() => {
    debouncedSave('teams', teams);
  }, [teams]);

  useEffect(() => {
    debouncedSave('dayConfigs', dayConfigs);
  }, [dayConfigs]);

  useEffect(() => {
    debouncedSave('dashboardWidgets', dashboardWidgets);
  }, [dashboardWidgets]);

  useEffect(() => {
    debouncedSave('categoryCombos', categoryCombos);
  }, [categoryCombos]);


  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  }, [currentUser]);

  const addUser = useCallback((user: User) => {
    setUsers(prev => [...prev, user]);
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const login = useCallback((email: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        setCurrentUser(user);
        return true;
    }
    return false;
  }, [users]);

  // Log Management
  const addLog = useCallback((log: TimeLog) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const batchAddLogs = useCallback((newLogs: TimeLog[]) => {
    setLogs(prev => [...prev, ...newLogs]);
  }, []);

  const updateLog = useCallback((updatedLog: TimeLog) => {
    setLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  }, []);

  const deleteLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  // Category Management
  const addCategory = useCallback((category: Category) => {
    setCategories(prev => [...prev, { ...category, order: prev.length }]);
  }, []);

  const updateCategory = useCallback((updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setLogs(prev => prev.filter(l => l.categoryId !== id));
    setRecurringTasks(prev => prev.filter(t => t.categoryId !== id));
  }, []);

  // Recurring Task Implementation
  const addRecurringTask = useCallback((task: RecurringTask) => {
    setRecurringTasks(prev => [...prev, task]);
  }, []);

  const deleteRecurringTask = useCallback((id: string) => {
    setRecurringTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const applyRecurringTasks = useCallback((startDate: Date, endDate: Date, specificTasks?: RecurringTask[]): number => {
    const newLogs: TimeLog[] = [];
    // Use specific tasks if provided, otherwise filter from state
    const sourceTasks = specificTasks ? specificTasks : recurringTasks;
    const myTasks = sourceTasks.filter(t => t.userId === currentUser.id);
    
    if (myTasks.length === 0) return 0;

    const start = new Date(startDate); 
    const end = new Date(endDate); 
    
    // Normalize to start of day for loop control
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    const startStr = getLocalDateStr(start);
    const endStr = getLocalDateStr(end);

    // Pre-compute existing logs for O(1) lookup
    const existingLogKeys = new Set(
      logs
        .filter(l => l.userId === currentUser.id && l.date >= startStr && l.date <= endStr)
        .map(l => `${l.date}_${l.categoryId}_${l.subCategoryId || 'general'}`)
    );

    const loop = new Date(start);
    while (loop <= end) {
      const dateStr = getLocalDateStr(loop);
      const dayOfWeek = loop.getDay(); 
      const dayOfMonth = loop.getDate();

      myTasks.forEach(task => {
        // Date Range Check
        if (task.startDate && dateStr < task.startDate) return;
        if (task.endDate && dateStr > task.endDate) return;

        let shouldApply = false;

        if (task.frequency === 'DAILY') {
            if (dayOfWeek !== 0 && dayOfWeek !== 6) shouldApply = true;
        } else if (task.frequency === 'WEEKLY') {
            if (task.weekDays?.includes(dayOfWeek)) shouldApply = true;
        } else if (task.frequency === 'MONTHLY') {
            if (task.dayOfMonth === dayOfMonth) shouldApply = true;
        }

        if (shouldApply) {
          const lookupSubId = task.subCategoryId || 'general';
          const key = `${dateStr}_${task.categoryId}_${lookupSubId}`;

          if (!existingLogKeys.has(key)) {
              existingLogKeys.add(key); // Add to set to prevent duplicates in the same batch
              newLogs.push({
                id: `log_auto_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
                userId: currentUser.id,
                date: dateStr,
                categoryId: task.categoryId,
                subCategoryId: task.subCategoryId,
                startTime: task.startTime || '09:00', 
                endTime: task.endTime || '10:00', 
                durationMinutes: task.durationMinutes,
                count: task.count,
                notes: task.notes || 'Recurring Task'
              });
          }
        }
      });

      loop.setDate(loop.getDate() + 1);
    }
    
    if (newLogs.length > 0) {
       setLogs(prev => [...prev, ...newLogs]);
    }
    
    return newLogs.length;
  }, [currentUser, recurringTasks, logs]);

  // Day Config Management
  const updateDayConfig = useCallback((config: DayConfig) => {
    setDayConfigs(prev => {
        const existingIndex = prev.findIndex(d => d.date === config.date && d.userId === config.userId);
        if (existingIndex >= 0) {
            const newConfigs = [...prev];
            newConfigs[existingIndex] = { ...newConfigs[existingIndex], ...config };
            return newConfigs;
        } else {
            return [...prev, config];
        }
    });
  }, []);

  const updateDashboardWidgets = useCallback((widgets: DashboardWidget[]) => {
    setDashboardWidgets(widgets);
  }, []);

  // Category Combo Management
  const addCategoryCombo = useCallback((combo: CategoryCombo) => {
    setCategoryCombos(prev => [...prev, combo]);
  }, []);

  const updateCategoryCombo = useCallback((updatedCombo: CategoryCombo) => {
    setCategoryCombos(prev => prev.map(c => c.id === updatedCombo.id ? updatedCombo : c));
  }, []);

  const deleteCategoryCombo = useCallback((id: string) => {
    setCategoryCombos(prev => prev.filter(c => c.id !== id));
  }, []);

  const reorderCategories = useCallback((orderedIds: string[]) => {
    setCategories(prev => {
      const newCategories = [...prev];
      orderedIds.forEach((id, index) => {
        const categoryIndex = newCategories.findIndex(c => c.id === id);
        if (categoryIndex !== -1) {
          newCategories[categoryIndex] = { ...newCategories[categoryIndex], order: index };
        }
      });
      return newCategories.sort((a, b) => a.order - b.order);
    });
  }, []);

  // Team Management
  const createTeam = useCallback((name: string) => {
    const newTeam: Team = {
        id: `t_${Date.now()}`,
        name,
        ownerId: currentUser.id,
        joinCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };
    setTeams(prev => [...prev, newTeam]);
    
    // Update user to be part of team and make them Team Leader (Owner)
    const updatedUser: User = { 
        ...currentUser, 
        teamIds: [...(currentUser.teamIds || []), newTeam.id],
        teamRoles: { ...(currentUser.teamRoles || {}), [newTeam.id]: UserRole.TEAM_LEADER }
    };
    updateUser(updatedUser);
  }, [currentUser, updateUser]);

  const joinTeam = useCallback((code: string) => {
    const team = teams.find(t => t.joinCode === code);
    if (team) {
        if (!currentUser.teamIds.includes(team.id)) {
            const updatedUser: User = { 
                ...currentUser, 
                teamIds: [...(currentUser.teamIds || []), team.id],
                teamRoles: { ...(currentUser.teamRoles || {}), [team.id]: UserRole.MEMBER }
            };
            updateUser(updatedUser);
        }
        return true;
    }
    return false;
  }, [teams, currentUser, updateUser]);

  const deleteTeam = useCallback((id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    
    // Remove team from all users
    setUsers(prev => prev.map(u => ({
        ...u,
        teamIds: u.teamIds ? u.teamIds.filter(tid => tid !== id) : [],
        teamRoles: u.teamRoles ? Object.fromEntries(Object.entries(u.teamRoles).filter(([k]) => k !== id)) : {}
    })));

    // Update current user state if they were part of the deleted team
    if (currentUser.teamIds.includes(id)) {
         setCurrentUser(prev => ({
            ...prev,
            teamIds: prev.teamIds.filter(tid => tid !== id),
            teamRoles: prev.teamRoles ? Object.fromEntries(Object.entries(prev.teamRoles).filter(([k]) => k !== id)) : {}
         }));
    }
  }, [currentUser]);

  const resetData = useCallback(() => {
    // Clear data but preserve users
    setLogs([]);
    setCategories([]);
    setRecurringTasks([]);
    setTeams([]);
    setDayConfigs([]);
    
    // Clean up user team associations
    setUsers(prevUsers => prevUsers.map(u => ({
        ...u,
        teamIds: [],
        teamRoles: {}
    })));

    setCurrentUser(curr => ({
        ...curr,
        teamIds: [],
        teamRoles: {}
    }));
  }, []);

  const resetTimesheet = useCallback(() => {
    setLogs([]);
    setDayConfigs([]);
  }, []);

  const contextValue = useMemo(() => ({
    currentUser,
    users,
    categories,
    logs,
    logsByDate,
    teams,
    recurringTasks,
    dayConfigs,
    dashboardWidgets,
    categoryCombos,
    setCurrentUser,
    updateUser,
    addUser,
    deleteUser,
    login,
    addLog,
    batchAddLogs,
    updateLog,
    deleteLog,
    addCategory,
    updateCategory,
    deleteCategory,
    addRecurringTask,
    deleteRecurringTask,
    applyRecurringTasks,
    createTeam,
    joinTeam,
    deleteTeam,
    updateDayConfig,
    updateDashboardWidgets,
    addCategoryCombo,
    updateCategoryCombo,
    deleteCategoryCombo,
    reorderCategories,
    resetData,
    resetTimesheet
  }), [
    currentUser, users, categories, logs, logsByDate, recurringTasks, teams, dayConfigs, dashboardWidgets, categoryCombos,
    updateUser, addUser, deleteUser, login, addLog, batchAddLogs, updateLog, deleteLog,
    addCategory, updateCategory, deleteCategory,
    addRecurringTask, deleteRecurringTask, applyRecurringTasks,
    createTeam, joinTeam, deleteTeam, updateDayConfig, updateDashboardWidgets,
    addCategoryCombo, updateCategoryCombo, deleteCategoryCombo,
    reorderCategories,
    resetData, resetTimesheet
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
