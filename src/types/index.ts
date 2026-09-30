export type PaymentMethod = 'نقدي' | 'محفظة إلكترونية' | 'تحويل بنكي' | 'بطاقة بنكية' | 'أخرى' | string;

export type RequirementPriority = 'عالية' | 'متوسطة' | 'منخفضة';

export type DailyRequirementStatus = 'مطلوب' | 'تم الشراء' | 'تم التأجيل' | 'تم الإلغاء';

export type MonthlyRequirementStatus = 'مطلوب' | 'تم الدفع' | 'تم الشراء' | 'متأجل' | 'ملغي';

export interface Income {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amount: number;
  source: string;
  type: string;
  description: string;
  paymentMethod: PaymentMethod;
  receiptImage?: string; // Base64 data URL
  receiptImageName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amount: number;
  title: string;
  category: string;
  description: string;
  paymentMethod: PaymentMethod;
  receiptImage?: string; // Base64 data URL
  receiptImageName?: string;
  linkedRequirementId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DailyRequirement {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  quantity: number;
  expectedPrice: number;
  actualPrice?: number;
  totalCost: number;
  priority: RequirementPriority;
  status: DailyRequirementStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MonthlyRequirement {
  id: string;
  name: string;
  month: string; // YYYY-MM
  expectedAmount: number;
  actualAmount?: number;
  dueDate: string; // YYYY-MM-DD
  priority: RequirementPriority;
  status: MonthlyRequirementStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface Budget {
  month: string; // YYYY-MM
  expectedIncome: number;
  maxTotalExpense: number;
  categoryBudgets: Record<string, number>;
}

export interface AppSettings {
  userName: string;
  currency: string;
  currencyCode: string;
  monthStartDay: number;
  hasLoadedSampleData: boolean;
}

export interface AlertNotification {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  actionTab?: string;
  date?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'daily-req'
  | 'monthly-req'
  | 'ledger'
  | 'budget'
  | 'reports'
  | 'settings';
