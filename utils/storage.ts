
const timers: Record<string, ReturnType<typeof setTimeout>> = {};

export const saveToLocalStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
};

export const debouncedSave = <T,>(key: string, data: T, delay: number = 1000): void => {
  if (timers[key]) {
    clearTimeout(timers[key]);
  }
  timers[key] = setTimeout(() => {
    saveToLocalStorage(key, data);
    delete timers[key];
  }, delay);
};

export const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage', e);
    return defaultValue;
  }
};

export const getLocalDateStr = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
