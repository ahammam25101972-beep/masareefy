import {
  Income,
  Expense,
  DailyRequirement,
  MonthlyRequirement,
  Category,
  Budget,
  AppSettings
} from '../types';

const DB_NAME = 'MudirMasroufatiDB';
const DB_VERSION = 1;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'طعام', color: '#f97316', icon: 'Utensils', isDefault: true },
  { id: 'cat-trans', name: 'مواصلات', color: '#0ea5e9', icon: 'Car', isDefault: true },
  { id: 'cat-home', name: 'منزل', color: '#8b5cf6', icon: 'Home', isDefault: true },
  { id: 'cat-bills', name: 'فواتير', color: '#ef4444', icon: 'Receipt', isDefault: true },
  { id: 'cat-edu', name: 'تعليم', color: '#10b981', icon: 'GraduationCap', isDefault: true },
  { id: 'cat-health', name: 'صحة', color: '#ec4899', icon: 'HeartPulse', isDefault: true },
  { id: 'cat-clothes', name: 'ملابس', color: '#6366f1', icon: 'Shirt', isDefault: true },
  { id: 'cat-shopping', name: 'مشتريات', color: '#f59e0b', icon: 'ShoppingBag', isDefault: true },
  { id: 'cat-work', name: 'عمل', color: '#64748b', icon: 'Briefcase', isDefault: true },
  { id: 'cat-fun', name: 'ترفيه', color: '#14b8a6', icon: 'Smile', isDefault: true },
  { id: 'cat-inst', name: 'أقساط', color: '#dc2626', icon: 'CreditCard', isDefault: true },
  { id: 'cat-debt', name: 'ديون', color: '#9333ea', icon: 'Banknote', isDefault: true },
  { id: 'cat-other', name: 'أخرى', color: '#6b7280', icon: 'FolderPlus', isDefault: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'المستخدم الكريم',
  currency: 'جنيه',
  currencyCode: 'EGP',
  monthStartDay: 1,
  hasLoadedSampleData: false,
};

// IndexedDB Helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB غير مدعوم في هذا المتصفح'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('incomes')) {
        db.createObjectStore('incomes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('expenses')) {
        db.createObjectStore('expenses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('daily_requirements')) {
        db.createObjectStore('daily_requirements', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('monthly_requirements')) {
        db.createObjectStore('monthly_requirements', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('budgets')) {
        db.createObjectStore('budgets', { keyPath: 'month' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback to localStorage
    const local = localStorage.getItem(`mudir_${storeName}`);
    return local ? JSON.parse(local) : [];
  }
}

async function putToStore<T>(storeName: string, item: T): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback
    const existing = await getAllFromStore<any>(storeName);
    const idKey = storeName === 'budgets' ? 'month' : (storeName === 'settings' ? 'key' : 'id');
    const index = existing.findIndex((e) => e[idKey] === (item as any)[idKey]);
    if (index >= 0) {
      existing[index] = item;
    } else {
      existing.push(item);
    }
    localStorage.setItem(`mudir_${storeName}`, JSON.stringify(existing));
  }
}

async function deleteFromStore(storeName: string, key: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const existing = await getAllFromStore<any>(storeName);
    const idKey = storeName === 'budgets' ? 'month' : (storeName === 'settings' ? 'key' : 'id');
    const filtered = existing.filter((e) => e[idKey] !== key);
    localStorage.setItem(`mudir_${storeName}`, JSON.stringify(filtered));
  }
}

async function clearStore(storeName: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.removeItem(`mudir_${storeName}`);
  }
}

export const dbService = {
  // Incomes
  async getIncomes(): Promise<Income[]> {
    return (await getAllFromStore<Income>('incomes')).sort((a, b) => b.createdAt - a.createdAt);
  },
  async saveIncome(income: Income): Promise<void> {
    await putToStore('incomes', income);
  },
  async deleteIncome(id: string): Promise<void> {
    await deleteFromStore('incomes', id);
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return (await getAllFromStore<Expense>('expenses')).sort((a, b) => b.createdAt - a.createdAt);
  },
  async saveExpense(expense: Expense): Promise<void> {
    await putToStore('expenses', expense);
  },
  async deleteExpense(id: string): Promise<void> {
    await deleteFromStore('expenses', id);
  },

  // Daily Requirements
  async getDailyRequirements(): Promise<DailyRequirement[]> {
    return (await getAllFromStore<DailyRequirement>('daily_requirements')).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  },
  async saveDailyRequirement(req: DailyRequirement): Promise<void> {
    await putToStore('daily_requirements', req);
  },
  async deleteDailyRequirement(id: string): Promise<void> {
    await deleteFromStore('daily_requirements', id);
  },

  // Monthly Requirements
  async getMonthlyRequirements(): Promise<MonthlyRequirement[]> {
    return (await getAllFromStore<MonthlyRequirement>('monthly_requirements')).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  },
  async saveMonthlyRequirement(req: MonthlyRequirement): Promise<void> {
    await putToStore('monthly_requirements', req);
  },
  async deleteMonthlyRequirement(id: string): Promise<void> {
    await deleteFromStore('monthly_requirements', id);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const list = await getAllFromStore<Category>('categories');
    if (list.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await putToStore('categories', cat);
      }
      return DEFAULT_CATEGORIES;
    }
    return list;
  },
  async saveCategory(cat: Category): Promise<void> {
    await putToStore('categories', cat);
  },
  async deleteCategory(id: string): Promise<void> {
    await deleteFromStore('categories', id);
  },

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return await getAllFromStore<Budget>('budgets');
  },
  async getBudgetForMonth(month: string): Promise<Budget | null> {
    const all = await this.getBudgets();
    return all.find((b) => b.month === month) || null;
  },
  async saveBudget(budget: Budget): Promise<void> {
    await putToStore('budgets', budget);
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const items = await getAllFromStore<{ key: string; value: any }>('settings');
      const found = items.find((i) => i.key === 'app_settings');
      if (found && found.value) {
        return { ...DEFAULT_SETTINGS, ...found.value };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  async saveSettings(settings: AppSettings): Promise<void> {
    await putToStore('settings', { key: 'app_settings', value: settings });
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    const stores = [
      'incomes',
      'expenses',
      'daily_requirements',
      'monthly_requirements',
      'budgets',
    ];
    for (const s of stores) {
      await clearStore(s);
    }
    // Reset categories to defaults
    await clearStore('categories');
    for (const cat of DEFAULT_CATEGORIES) {
      await putToStore('categories', cat);
    }
    const currentSettings = await this.getSettings();
    await this.saveSettings({ ...currentSettings, hasLoadedSampleData: false });
  },

  // Full backup data bundle
  async createBackup(): Promise<string> {
    const incomes = await this.getIncomes();
    const expenses = await this.getExpenses();
    const dailyRequirements = await this.getDailyRequirements();
    const monthlyRequirements = await this.getMonthlyRequirements();
    const categories = await this.getCategories();
    const budgets = await this.getBudgets();
    const settings = await this.getSettings();

    const data = {
      version: 1,
      appName: 'مدير مصروفاتي',
      exportedAt: new Date().toISOString(),
      incomes,
      expenses,
      dailyRequirements,
      monthlyRequirements,
      categories,
      budgets,
      settings,
    };

    return JSON.stringify(data, null, 2);
  },

  // Restore backup
  async restoreBackup(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;

      if (Array.isArray(data.incomes)) {
        await clearStore('incomes');
        for (const item of data.incomes) await putToStore('incomes', item);
      }
      if (Array.isArray(data.expenses)) {
        await clearStore('expenses');
        for (const item of data.expenses) await putToStore('expenses', item);
      }
      if (Array.isArray(data.dailyRequirements)) {
        await clearStore('daily_requirements');
        for (const item of data.dailyRequirements) await putToStore('daily_requirements', item);
      }
      if (Array.isArray(data.monthlyRequirements)) {
        await clearStore('monthly_requirements');
        for (const item of data.monthlyRequirements) await putToStore('monthly_requirements', item);
      }
      if (Array.isArray(data.categories)) {
        await clearStore('categories');
        for (const item of data.categories) await putToStore('categories', item);
      }
      if (Array.isArray(data.budgets)) {
        await clearStore('budgets');
        for (const item of data.budgets) await putToStore('budgets', item);
      }
      if (data.settings) {
        await this.saveSettings(data.settings);
      }

      return true;
    } catch (err) {
      console.error('Failed to restore backup:', err);
      return false;
    }
  },
};
