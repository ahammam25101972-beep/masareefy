import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  CalendarCheck,
  CalendarDays,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Receipt,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

interface DashboardViewProps {
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenDailyReqModal: () => void;
  onEditIncome: (income: any) => void;
  onEditExpense: (expense: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenDailyReqModal,
  onEditIncome,
  onEditExpense,
}) => {
  const {
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
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
    incomes,
    expenses,
    deleteIncome,
    deleteExpense,
    openImageModal,
    formatCurrency,
    setActiveTab,
    notifications,
    currentBudget,
    settings,
  } = useApp();

  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'income' | 'expense'; title: string } | null>(null);

  // Combined recent transactions (last 8)
  const recentTransactions = React.useMemo(() => {
    const incList = incomes.map((i) => ({
      ...i,
      txType: 'income' as const,
      displayTitle: i.source,
      displayCategory: i.type || 'دخل',
    }));
    const expList = expenses.map((e) => ({
      ...e,
      txType: 'expense' as const,
      displayTitle: e.title,
      displayCategory: e.category,
    }));

    return [...incList, ...expList]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 8);
  }, [incomes, expenses]);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'income') {
      await deleteIncome(itemToDelete.id);
    } else {
      await deleteExpense(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  // Budget calculations
  const budgetRatio = currentBudget && currentBudget.maxTotalExpense > 0
    ? Math.min(Math.round((monthlyExpense / currentBudget.maxTotalExpense) * 100), 100)
    : 0;
  const isBudgetExceeded = currentBudget && currentBudget.maxTotalExpense > 0 && monthlyExpense > currentBudget.maxTotalExpense;

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">لوحة التحكم المالية</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              مباشر
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ملخص يومي وشهري دقيق لجميع حركات الدخل والمصروفات والمتطلبات
          </p>
        </div>

        {/* Date and Month Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">الشهر:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-slate-800 font-bold focus:outline-hidden text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">اليوم:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-slate-800 font-bold focus:outline-hidden text-xs"
            />
          </div>
        </div>
      </div>

      {/* Smart Alerts Banner if any */}
      {notifications.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">{notifications[0].title}</h4>
              <p className="text-xs text-amber-700 mt-0.5">{notifications[0].message}</p>
            </div>
          </div>
          {notifications[0].actionTab && (
            <button
              onClick={() => setActiveTab(notifications[0].actionTab as any)}
              className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer"
            >
              متابعة وتسوية
            </button>
          )}
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onOpenIncomeModal}
          className="flex items-center justify-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl shadow-sm shadow-emerald-600/20 font-bold text-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة دخل جديد</span>
        </button>

        <button
          onClick={onOpenExpenseModal}
          className="flex items-center justify-center gap-2 p-3.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-2xl shadow-sm shadow-rose-600/20 font-bold text-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مصروف جديد</span>
        </button>

        <button
          onClick={onOpenDailyReqModal}
          className="flex items-center justify-center gap-2 p-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-2xl shadow-sm shadow-indigo-600/20 font-bold text-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة متطلب يومي</span>
        </button>
      </div>

      {/* Daily Metrics Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>التقرير اليومي ({selectedDate})</span>
          </h2>
          <span className="text-xs text-slate-400">حركات اليوم المحدد</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Daily Income */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold">إجمالي الدخل اليومي</span>
              <div className="text-lg font-black text-emerald-600 mt-1">
                {formatCurrency(dailyIncome)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Daily Expense */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold">إجمالي المصروفات اليومية</span>
              <div className="text-lg font-black text-rose-600 mt-1">
                {formatCurrency(dailyExpense)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          {/* Daily Net */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold">صافي المبلغ اليومي</span>
              <div
                className={`text-lg font-black mt-1 ${
                  dailyNet >= 0 ? 'text-teal-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(dailyNet)}
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                dailyNet >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Metrics Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>التقرير الشهري ({selectedMonth})</span>
          </h2>
          <span className="text-xs text-slate-400">إجمالي هذا الشهر</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Monthly Income */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold">إجمالي الدخل الشهري</span>
              <div className="text-lg font-black text-emerald-600 mt-1">
                {formatCurrency(monthlyIncome)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Monthly Expense */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold">إجمالي المصروفات الشهرية</span>
              <div className="text-lg font-black text-rose-600 mt-1">
                {formatCurrency(monthlyExpense)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          {/* Monthly Net */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold">صافي الفائض / العجز الشهري</span>
              <div
                className={`text-lg font-black mt-1 ${
                  monthlyNet >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatCurrency(monthlyNet)}
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                monthlyNet >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <Scale className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Summary Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>ملخص المتطلبات والالتزامات المالية</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('daily-req')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              اليومية ←
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveTab('monthly-req')}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
            >
              الشهرية ←
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Daily Requirements Total */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <CalendarCheck className="w-4 h-4" />
              <span className="text-xs font-bold">متطلبات اليوم</span>
            </div>
            <div className="text-base font-black text-slate-800">
              {formatCurrency(dailyRequirementsTotal)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
              <span>مدفوع: {formatCurrency(dailyRequirementsPaid)}</span>
              <span className="text-rose-600">متبقي: {formatCurrency(dailyRequirementsRemaining)}</span>
            </div>
          </div>

          {/* Monthly Requirements Total */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-sky-600 mb-1">
              <CalendarDays className="w-4 h-4" />
              <span className="text-xs font-bold">متطلبات الشهر</span>
            </div>
            <div className="text-base font-black text-slate-800">
              {formatCurrency(monthlyRequirementsExpected)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>المبلغ المتوقع التقديري</span>
            </div>
          </div>

          {/* Paid for Requirements */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <span className="text-xs font-bold">المبالغ المدفوعة</span>
            </div>
            <div className="text-base font-black text-emerald-600">
              {formatCurrency(monthlyRequirementsPaid)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>تم سدادها بالفعل</span>
            </div>
          </div>

          {/* Remaining for Requirements */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <span className="text-xs font-bold">المبالغ المتبقية</span>
            </div>
            <div className="text-base font-black text-rose-600">
              {formatCurrency(monthlyRequirementsRemaining)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              <span>مطلوب سدادها لاحقاً</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Glance (if set) */}
      {currentBudget && currentBudget.maxTotalExpense > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">حالة استهلاك الميزانية لشهر {selectedMonth}</span>
            </div>
            <span
              className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                isBudgetExceeded
                  ? 'bg-rose-100 text-rose-800'
                  : budgetRatio >= 80
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              استهلكت {budgetRatio}% ({formatCurrency(monthlyExpense)} من {formatCurrency(currentBudget.maxTotalExpense)})
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBudgetExceeded ? 'bg-rose-600' : budgetRatio >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetRatio, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">آخر العمليات المالية المسجلة</h3>
          </div>
          <button
            onClick={() => setActiveTab('ledger')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            عرض سجل العمليات الشامل ({incomes.length + expenses.length}) ←
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            لا توجد أي عمليات مالية مسجلة بعد. استخدم الأزرار أعلاه لتسجيل أول دخل أو مصروف!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isIncome = tx.txType === 'income';
              return (
                <div
                  key={tx.id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-right"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon / Image thumbnail */}
                    {tx.receiptImage ? (
                      <button
                        onClick={() =>
                          openImageModal(
                            tx.receiptImage!,
                            tx.displayTitle,
                            tx.date,
                            `${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}`
                          )
                        }
                        title="عرض الإيصال المرفق"
                        className="relative group w-11 h-11 rounded-xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer"
                      >
                        <img
                          src={tx.receiptImage}
                          alt="إيصال"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                    )}

                    {/* Title & Metadata */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-800">
                          {tx.displayTitle}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tx.displayCategory}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{tx.date}</span>
                        <span>·</span>
                        <span>{tx.time}</span>
                        <span>·</span>
                        <span>{tx.paymentMethod}</span>
                        {tx.receiptImage && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-600 font-semibold">يوجد إيصال</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm sm:text-base font-extrabold ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => (isIncome ? onEditIncome(tx) : onEditExpense(tx))}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="تعديل"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setItemToDelete({
                            id: tx.id,
                            type: tx.txType,
                            title: tx.displayTitle,
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="تأكيد حذف العملية"
        message={`هل أنت متأكد من حذف عملية "${itemToDelete?.title || ''}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف"
        cancelText="إلغاء"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
