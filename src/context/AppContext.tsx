import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Income,
  Expense,
  DailyRequirement,
  MonthlyRequirement,
  Category,
  Budget,
  AppSettings,
  ActiveTab,
  AlertNotification,
  DailyRequirementStatus,
  MonthlyRequirementStatus,
} from '../types';
import { dbService, DEFAULT_SETTINGS, DEFAULT_CATEGORIES } from '../services/db';
import {
  sampleIncomes,
  sampleExpenses,
  sampleDailyRequirements,
  sampleMonthlyRequirements,
  sampleBudget,
} from '../services/initialData';

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ImageModalState {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  date?: string;
  amount?: string;
}

interface AppContextType {
  // State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  incomes: Income[];
  expenses: Expense[];
  dailyRequirements: DailyRequirement[];
  monthlyRequirements: MonthlyRequirement[];
  categories: Category[];
  currentBudget: Budget | null;
  settings: AppSettings;
  loading: boolean;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  notifications: AlertNotification[];
  toasts: ToastItem[];
  imageModal: ImageModalState;

  // Calculators & Helpers
  formatCurrency: (amount: number) => string;
  dailyIncome: number;
  dailyExpense: number;
  dailyNet: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  dailyRequirementsTotal: number;
  dailyRequirementsPaid: number;
  dailyRequirementsRemaining: number;
  monthlyRequirementsExpected: number;
  monthlyRequirementsPaid: number;
  monthlyRequirementsRemaining: number;

  // Actions
  addIncome: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addDailyRequirement: (req: Omit<DailyRequirement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDailyRequirement: (id: string, req: Partial<DailyRequirement>) => Promise<void>;
  deleteDailyRequirement: (id: string) => Promise<void>;
  changeDailyRequirementStatus: (id: string, status: DailyRequirementStatus, createExpense?: boolean) => Promise<void>;

  addMonthlyRequirement: (req: Omit<MonthlyRequirement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMonthlyRequirement: (id: string, req: Partial<MonthlyRequirement>) => Promise<void>;
  deleteMonthlyRequirement: (id: string) => Promise<void>;
  changeMonthlyRequirementStatus: (id: string, status: MonthlyRequirementStatus, actualAmount?: number, createExpense?: boolean) => Promise<void>;

  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  saveBudget: (budget: Budget) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

  loadSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  openImageModal: (imageUrl: string, title: string, date?: string, amount?: string) => void;
  closeImageModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const pad = (n: number) => n.toString().padStart(2, '0');
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const getCurrentMonthString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dailyRequirements, setDailyRequirements] = useState<DailyRequirement[]>([]);
  const [monthlyRequirements, setMonthlyRequirements] = useState<MonthlyRequirement[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [imageModal, setImageModal] = useState<ImageModalState>({
    isOpen: false,
    imageUrl: '',
    title: '',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openImageModal = useCallback((imageUrl: string, title: string, date?: string, amount?: string) => {
    setImageModal({ isOpen: true, imageUrl, title, date, amount });
  }, []);

  const closeImageModal = useCallback(() => {
    setImageModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Initial Load
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [loadedSettings, loadedCats, loadedIncomes, loadedExpenses, loadedDReqs, loadedMReqs, loadedBudgets] =
          await Promise.all([
            dbService.getSettings(),
            dbService.getCategories(),
            dbService.getIncomes(),
            dbService.getExpenses(),
            dbService.getDailyRequirements(),
            dbService.getMonthlyRequirements(),
            dbService.getBudgets(),
          ]);

        if (!isMounted) return;

        // If first launch ever and completely empty, preload sample data for an effortless initial experience
        if (!loadedSettings.hasLoadedSampleData && loadedIncomes.length === 0 && loadedExpenses.length === 0) {
          // Preload sample data
          for (const inc of sampleIncomes) await dbService.saveIncome(inc);
          for (const exp of sampleExpenses) await dbService.saveExpense(exp);
          for (const dr of sampleDailyRequirements) await dbService.saveDailyRequirement(dr);
          for (const mr of sampleMonthlyRequirements) await dbService.saveMonthlyRequirement(mr);
          await dbService.saveBudget(sampleBudget);

          const updatedSettings = { ...loadedSettings, hasLoadedSampleData: true };
          await dbService.saveSettings(updatedSettings);

          setIncomes(sampleIncomes);
          setExpenses(sampleExpenses);
          setDailyRequirements(sampleDailyRequirements);
          setMonthlyRequirements(sampleMonthlyRequirements);
          setBudgets([sampleBudget]);
          setSettings(updatedSettings);
          setCategories(loadedCats.length > 0 ? loadedCats : DEFAULT_CATEGORIES);
        } else {
          setSettings(loadedSettings);
          setCategories(loadedCats.length > 0 ? loadedCats : DEFAULT_CATEGORIES);
          setIncomes(loadedIncomes);
          setExpenses(loadedExpenses);
          setDailyRequirements(loadedDReqs);
          setMonthlyRequirements(loadedMReqs);
          setBudgets(loadedBudgets);
        }
      } catch (err) {
        console.error('Failed to initialize database:', err);
        showToast('تعذر تحميل البيانات من قاعدة البيانات المحلية', 'error');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  // Current month budget
  const currentBudget = useMemo(() => {
    return budgets.find((b) => b.month === selectedMonth) || null;
  }, [budgets, selectedMonth]);

  // Formatter for currency
  const formatCurrency = useCallback(
    (amount: number) => {
      const formatted = new Intl.NumberFormat('ar-EG', {
        maximumFractionDigits: 2,
      }).format(amount || 0);
      return `${formatted} ${settings.currency || 'جنيه'}`;
    },
    [settings.currency]
  );

  // Calculations: Daily
  const dailyIncome = useMemo(() => {
    return incomes
      .filter((i) => i.date === selectedDate)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [incomes, selectedDate]);

  const dailyExpense = useMemo(() => {
    return expenses
      .filter((e) => e.date === selectedDate)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses, selectedDate]);

  const dailyNet = useMemo(() => dailyIncome - dailyExpense, [dailyIncome, dailyExpense]);

  // Calculations: Monthly
  const monthlyIncome = useMemo(() => {
    return incomes
      .filter((i) => i.date.startsWith(selectedMonth))
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [incomes, selectedMonth]);

  const monthlyExpense = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(selectedMonth))
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses, selectedMonth]);

  const monthlyNet = useMemo(() => monthlyIncome - monthlyExpense, [monthlyIncome, monthlyExpense]);

  // Calculations: Daily Requirements
  const dailyRequirementsForDate = useMemo(() => {
    return dailyRequirements.filter((r) => r.date === selectedDate);
  }, [dailyRequirements, selectedDate]);

  const dailyRequirementsTotal = useMemo(() => {
    return dailyRequirementsForDate.reduce((sum, r) => sum + (r.totalCost || r.expectedPrice * r.quantity || 0), 0);
  }, [dailyRequirementsForDate]);

  const dailyRequirementsPaid = useMemo(() => {
    return dailyRequirementsForDate
      .filter((r) => r.status === 'تم الشراء')
      .reduce((sum, r) => sum + (r.actualPrice || r.totalCost || r.expectedPrice * r.quantity || 0), 0);
  }, [dailyRequirementsForDate]);

  const dailyRequirementsRemaining = useMemo(() => {
    return dailyRequirementsForDate
      .filter((r) => r.status === 'مطلوب')
      .reduce((sum, r) => sum + (r.totalCost || r.expectedPrice * r.quantity || 0), 0);
  }, [dailyRequirementsForDate]);

  // Calculations: Monthly Requirements
  const monthlyRequirementsForMonth = useMemo(() => {
    return monthlyRequirements.filter((r) => r.month === selectedMonth);
  }, [monthlyRequirements, selectedMonth]);

  const monthlyRequirementsExpected = useMemo(() => {
    return monthlyRequirementsForMonth.reduce((sum, r) => sum + (Number(r.expectedAmount) || 0), 0);
  }, [monthlyRequirementsForMonth]);

  const monthlyRequirementsPaid = useMemo(() => {
    return monthlyRequirementsForMonth
      .filter((r) => r.status === 'تم الدفع' || r.status === 'تم الشراء')
      .reduce((sum, r) => sum + (Number(r.actualAmount) || Number(r.expectedAmount) || 0), 0);
  }, [monthlyRequirementsForMonth]);

  const monthlyRequirementsRemaining = useMemo(() => {
    return monthlyRequirementsForMonth
      .filter((r) => r.status === 'مطلوب')
      .reduce((sum, r) => sum + (Number(r.expectedAmount) || 0), 0);
  }, [monthlyRequirementsForMonth]);

  // Notifications and Alerts system
  const notifications = useMemo(() => {
    const list: AlertNotification[] = [];
    const today = getTodayString();

    // 1. Pending daily requirements for today
    const pendingDaily = dailyRequirements.filter((r) => r.date === today && r.status === 'مطلوب');
    if (pendingDaily.length > 0) {
      list.push({
        id: 'notif-pending-daily',
        type: 'info',
        title: 'متطلبات يومية بانتظار الإنجاز',
        message: `لديك ${pendingDaily.length} متطلب يومي غير منجز لتاريخ اليوم (${pendingDaily.map((p) => p.name).slice(0, 2).join('، ')}${pendingDaily.length > 2 ? '...' : ''}).`,
        actionTab: 'daily-req',
      });
    }

    // 2. Unpaid monthly requirements due soon or overdue
    const unpaidMonthly = monthlyRequirements.filter(
      (m) => m.month === selectedMonth && m.status === 'مطلوب'
    );
    if (unpaidMonthly.length > 0) {
      // Check if any due in 3 days or already overdue
      const overdueOrSoon = unpaidMonthly.filter((m) => {
        if (!m.dueDate) return true;
        const diffDays = Math.ceil((new Date(m.dueDate).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24));
        return diffDays <= 3;
      });

      if (overdueOrSoon.length > 0) {
        list.push({
          id: 'notif-due-monthly',
          type: 'danger',
          title: 'متطلبات شهرية مستحقة الدفع',
          message: `يوجد ${overdueOrSoon.length} التزام شهري اقترب موعد استحقاقه أو تأخر سداده بقيمة إجمالية ${overdueOrSoon.reduce((s, i) => s + i.expectedAmount, 0).toLocaleString()} ${settings.currency}.`,
          actionTab: 'monthly-req',
        });
      }
    }

    // 3. Budget threshold warnings
    if (currentBudget && currentBudget.maxTotalExpense > 0) {
      const ratio = monthlyExpense / currentBudget.maxTotalExpense;
      if (ratio > 1) {
        list.push({
          id: 'notif-budget-exceeded',
          type: 'danger',
          title: 'تجاوز الحد الأقصى للميزانية الشهرية',
          message: `المصروفات الفعلية لهذا الشهر (${formatCurrency(monthlyExpense)}) تجاوزت سقف الميزانية المحدد (${formatCurrency(currentBudget.maxTotalExpense)}) بنسبة ${Math.round(ratio * 100)}%!`,
          actionTab: 'budget',
        });
      } else if (ratio >= 0.85) {
        list.push({
          id: 'notif-budget-warning',
          type: 'warning',
          title: 'اقتراب استهلاك الميزانية الشهرية',
          message: `تم استهلاك ${Math.round(ratio * 100)}% من الميزانية المحددة لهذا الشهر. المتبقي: ${formatCurrency(currentBudget.maxTotalExpense - monthlyExpense)}.`,
          actionTab: 'budget',
        });
      }
    }

    return list;
  }, [dailyRequirements, monthlyRequirements, selectedMonth, monthlyExpense, currentBudget, formatCurrency, settings.currency]);

  // Income Actions
  const addIncome = async (data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newIncome: Income = {
        ...data,
        id: 'inc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        amount: Number(data.amount),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await dbService.saveIncome(newIncome);
      setIncomes((prev) => [newIncome, ...prev]);
      showToast('تم تسجيل الدخل بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء حفظ الدخل', 'error');
    }
  };

  const updateIncome = async (id: string, data: Partial<Income>) => {
    try {
      const existing = incomes.find((i) => i.id === id);
      if (!existing) return;
      const updated: Income = {
        ...existing,
        ...data,
        amount: data.amount !== undefined ? Number(data.amount) : existing.amount,
        updatedAt: Date.now(),
      };
      await dbService.saveIncome(updated);
      setIncomes((prev) => prev.map((i) => (i.id === id ? updated : i)));
      showToast('تم تعديل الدخل بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء تعديل الدخل', 'error');
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      await dbService.deleteIncome(id);
      setIncomes((prev) => prev.filter((i) => i.id !== id));
      showToast('تم حذف الدخل بنجاح', 'info');
    } catch {
      showToast('حدث خطأ أثناء حذف الدخل', 'error');
    }
  };

  // Expense Actions
  const addExpense = async (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newExpense: Expense = {
        ...data,
        id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        amount: Number(data.amount),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await dbService.saveExpense(newExpense);
      setExpenses((prev) => [newExpense, ...prev]);
      showToast('تم تسجيل المصروف بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء حفظ المصروف', 'error');
    }
  };

  const updateExpense = async (id: string, data: Partial<Expense>) => {
    try {
      const existing = expenses.find((e) => e.id === id);
      if (!existing) return;
      const updated: Expense = {
        ...existing,
        ...data,
        amount: data.amount !== undefined ? Number(data.amount) : existing.amount,
        updatedAt: Date.now(),
      };
      await dbService.saveExpense(updated);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      showToast('تم تعديل المصروف بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء تعديل المصروف', 'error');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await dbService.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast('تم حذف المصروف بنجاح', 'info');
    } catch {
      showToast('حدث خطأ أثناء حذف المصروف', 'error');
    }
  };

  // Daily Requirements Actions
  const addDailyRequirement = async (data: Omit<DailyRequirement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const totalCost = Number(data.totalCost) || Number(data.expectedPrice) * Number(data.quantity || 1);
      const newReq: DailyRequirement = {
        ...data,
        id: 'dreq-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        quantity: Number(data.quantity) || 1,
        expectedPrice: Number(data.expectedPrice) || 0,
        actualPrice: Number(data.actualPrice) || 0,
        totalCost,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await dbService.saveDailyRequirement(newReq);
      setDailyRequirements((prev) => [newReq, ...prev]);
      showToast('تم حفظ المتطلب اليومي بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء حفظ المتطلب اليومي', 'error');
    }
  };

  const updateDailyRequirement = async (id: string, data: Partial<DailyRequirement>) => {
    try {
      const existing = dailyRequirements.find((r) => r.id === id);
      if (!existing) return;
      const qty = data.quantity !== undefined ? Number(data.quantity) : existing.quantity;
      const expPrice = data.expectedPrice !== undefined ? Number(data.expectedPrice) : existing.expectedPrice;
      const totalCost = data.totalCost !== undefined ? Number(data.totalCost) : expPrice * qty;

      const updated: DailyRequirement = {
        ...existing,
        ...data,
        quantity: qty,
        expectedPrice: expPrice,
        actualPrice: data.actualPrice !== undefined ? Number(data.actualPrice) : existing.actualPrice,
        totalCost,
        updatedAt: Date.now(),
      };
      await dbService.saveDailyRequirement(updated);
      setDailyRequirements((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast('تم تعديل المتطلب بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء تعديل المتطلب', 'error');
    }
  };

  const deleteDailyRequirement = async (id: string) => {
    try {
      await dbService.deleteDailyRequirement(id);
      setDailyRequirements((prev) => prev.filter((r) => r.id !== id));
      showToast('تم حذف المتطلب بنجاح', 'info');
    } catch {
      showToast('حدث خطأ أثناء حذف المتطلب', 'error');
    }
  };

  const changeDailyRequirementStatus = async (
    id: string,
    status: DailyRequirementStatus,
    createExpense = false
  ) => {
    try {
      const req = dailyRequirements.find((r) => r.id === id);
      if (!req) return;
      const finalCost = req.actualPrice && req.actualPrice > 0 ? req.actualPrice : req.totalCost;

      await updateDailyRequirement(id, {
        status,
        actualPrice: status === 'تم الشراء' && (!req.actualPrice || req.actualPrice === 0) ? req.totalCost : req.actualPrice,
      });

      // Optionally record as expense automatically
      if (status === 'تم الشراء' && createExpense) {
        await addExpense({
          date: req.date || getTodayString(),
          time: new Date().toTimeString().slice(0, 5),
          amount: finalCost,
          title: `متطلب يومي: ${req.name}`,
          category: 'طعام', // sensible default or prompt
          description: `سداد متطلب يومي تلقائياً (${req.name})`,
          paymentMethod: 'نقدي',
          linkedRequirementId: id,
        });
      }
    } catch {
      showToast('حدث خطأ أثناء تغيير حالة المتطلب', 'error');
    }
  };

  // Monthly Requirements Actions
  const addMonthlyRequirement = async (data: Omit<MonthlyRequirement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReq: MonthlyRequirement = {
        ...data,
        id: 'mreq-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        expectedAmount: Number(data.expectedAmount) || 0,
        actualAmount: Number(data.actualAmount) || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await dbService.saveMonthlyRequirement(newReq);
      setMonthlyRequirements((prev) => [newReq, ...prev]);
      showToast('تم حفظ المتطلب الشهري بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء حفظ المتطلب الشهري', 'error');
    }
  };

  const updateMonthlyRequirement = async (id: string, data: Partial<MonthlyRequirement>) => {
    try {
      const existing = monthlyRequirements.find((r) => r.id === id);
      if (!existing) return;
      const updated: MonthlyRequirement = {
        ...existing,
        ...data,
        expectedAmount: data.expectedAmount !== undefined ? Number(data.expectedAmount) : existing.expectedAmount,
        actualAmount: data.actualAmount !== undefined ? Number(data.actualAmount) : existing.actualAmount,
        updatedAt: Date.now(),
      };
      await dbService.saveMonthlyRequirement(updated);
      setMonthlyRequirements((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast('تم تعديل المتطلب الشهري بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء تعديل المتطلب الشهري', 'error');
    }
  };

  const deleteMonthlyRequirement = async (id: string) => {
    try {
      await dbService.deleteMonthlyRequirement(id);
      setMonthlyRequirements((prev) => prev.filter((r) => r.id !== id));
      showToast('تم حذف المتطلب الشهري بنجاح', 'info');
    } catch {
      showToast('حدث خطأ أثناء حذف المتطلب الشهري', 'error');
    }
  };

  const changeMonthlyRequirementStatus = async (
    id: string,
    status: MonthlyRequirementStatus,
    actualAmount?: number,
    createExpense = false
  ) => {
    try {
      const req = monthlyRequirements.find((r) => r.id === id);
      if (!req) return;
      const paidAmt = actualAmount !== undefined ? actualAmount : (req.actualAmount || req.expectedAmount);

      await updateMonthlyRequirement(id, {
        status,
        actualAmount: paidAmt,
      });

      if ((status === 'تم الدفع' || status === 'تم الشراء') && createExpense) {
        await addExpense({
          date: req.dueDate || getTodayString(),
          time: new Date().toTimeString().slice(0, 5),
          amount: paidAmt,
          title: `متطلب شهري: ${req.name}`,
          category: 'فواتير',
          description: `سداد متطلب شهري (${req.name}) لشهر ${req.month}`,
          paymentMethod: 'تحويل بنكي',
          linkedRequirementId: id,
        });
      }
    } catch {
      showToast('حدث خطأ أثناء تحديث حالة المتطلب', 'error');
    }
  };

  // Categories Actions
  const addCategory = async (cat: Omit<Category, 'id'>) => {
    try {
      const newCat: Category = {
        ...cat,
        id: 'cat-' + Date.now(),
        isDefault: false,
      };
      await dbService.saveCategory(newCat);
      setCategories((prev) => [...prev, newCat]);
      showToast(`تمت إضافة التصنيف "${newCat.name}" بنجاح ✓`, 'success');
    } catch {
      showToast('حدث خطأ أثناء إضافة التصنيف', 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await dbService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('تم حذف التصنيف بنجاح', 'info');
    } catch {
      showToast('حدث خطأ أثناء حذف التصنيف', 'error');
    }
  };

  // Budget Actions
  const saveBudget = async (budget: Budget) => {
    try {
      await dbService.saveBudget(budget);
      setBudgets((prev) => {
        const idx = prev.findIndex((b) => b.month === budget.month);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = budget;
          return next;
        }
        return [...prev, budget];
      });
      showToast('تم حفظ الميزانية الشهرية بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء حفظ الميزانية', 'error');
    }
  };

  // Settings Actions
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await dbService.saveSettings(updated);
      setSettings(updated);
      showToast('تم تحديث الإعدادات بنجاح ✓', 'success');
    } catch {
      showToast('حدث خطأ أثناء حفظ الإعدادات', 'error');
    }
  };

  // Load sample data
  const loadSampleData = async () => {
    try {
      for (const inc of sampleIncomes) await dbService.saveIncome(inc);
      for (const exp of sampleExpenses) await dbService.saveExpense(exp);
      for (const dr of sampleDailyRequirements) await dbService.saveDailyRequirement(dr);
      for (const mr of sampleMonthlyRequirements) await dbService.saveMonthlyRequirement(mr);
      await dbService.saveBudget(sampleBudget);

      const updatedSettings = { ...settings, hasLoadedSampleData: true };
      await dbService.saveSettings(updatedSettings);

      setIncomes(await dbService.getIncomes());
      setExpenses(await dbService.getExpenses());
      setDailyRequirements(await dbService.getDailyRequirements());
      setMonthlyRequirements(await dbService.getMonthlyRequirements());
      setBudgets(await dbService.getBudgets());
      setSettings(updatedSettings);

      showToast('تم تحميل البيانات التجريبية بنجاح ✓', 'success');
    } catch {
      showToast('فشل تحميل البيانات التجريبية', 'error');
    }
  };

  // Clear all data
  const clearAllData = async () => {
    try {
      await dbService.clearAllData();
      setIncomes([]);
      setExpenses([]);
      setDailyRequirements([]);
      setMonthlyRequirements([]);
      setBudgets([]);
      setCategories(DEFAULT_CATEGORIES);
      setSettings((prev) => ({ ...prev, hasLoadedSampleData: false }));
      showToast('تم تفريغ وحذف جميع البيانات بنجاح', 'info');
    } catch {
      showToast('حدث خطأ أثناء حذف البيانات', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        incomes,
        expenses,
        dailyRequirements,
        monthlyRequirements,
        categories,
        currentBudget,
        settings,
        loading,
        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,
        notifications,
        toasts,
        imageModal,
        formatCurrency,
        dailyIncome,
        dailyExpense,
        dailyNet,
        monthlyIncome,
        monthlyExpense,
        monthlyNet,
        dailyRequirementsTotal,
        dailyRequirementsPaid,
        dailyRequirementsRemaining,
        monthlyRequirementsExpected,
        monthlyRequirementsPaid,
        monthlyRequirementsRemaining,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addDailyRequirement,
        updateDailyRequirement,
        deleteDailyRequirement,
        changeDailyRequirementStatus,
        addMonthlyRequirement,
        updateMonthlyRequirement,
        deleteMonthlyRequirement,
        changeMonthlyRequirementStatus,
        addCategory,
        deleteCategory,
        saveBudget,
        updateSettings,
        loadSampleData,
        clearAllData,
        showToast,
        dismissToast,
        openImageModal,
        closeImageModal,
      }}
    >
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
