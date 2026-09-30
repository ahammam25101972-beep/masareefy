import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget } from '../../types';
import {
  PieChart,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Plus,
  Save,
  X,
} from 'lucide-react';

export const BudgetView: React.FC = () => {
  const {
    currentBudget,
    saveBudget,
    selectedMonth,
    setSelectedMonth,
    monthlyExpense,
    monthlyIncome,
    expenses,
    categories,
    formatCurrency,
    settings,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [expectedIncome, setExpectedIncome] = useState('');
  const [maxTotalExpense, setMaxTotalExpense] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});

  useEffect(() => {
    if (currentBudget) {
      setExpectedIncome(currentBudget.expectedIncome ? currentBudget.expectedIncome.toString() : '');
      setMaxTotalExpense(currentBudget.maxTotalExpense ? currentBudget.maxTotalExpense.toString() : '');
      setCategoryBudgets(currentBudget.categoryBudgets || {});
    } else {
      // Default suggested budget based on this month's income
      setExpectedIncome(monthlyIncome > 0 ? monthlyIncome.toString() : '20000');
      setMaxTotalExpense(monthlyIncome > 0 ? (monthlyIncome * 0.75).toString() : '15000');
      setCategoryBudgets({
        'طعام': 4000,
        'فواتير': 2000,
        'منزل': 3500,
        'مواصلات': 1500,
        'صحة': 1000,
        'أقساط': 1500,
        'مشتريات': 1000,
      });
    }
  }, [currentBudget, monthlyIncome, selectedMonth]);

  // Actual expenses per category for selected month
  const actualByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of expenses) {
      if (exp.date.startsWith(selectedMonth)) {
        map[exp.category] = (map[exp.category] || 0) + exp.amount;
      }
    }
    return map;
  }, [expenses, selectedMonth]);

  const totalMax = currentBudget?.maxTotalExpense || parseFloat(maxTotalExpense) || 0;
  const totalRatio = totalMax > 0 ? Math.round((monthlyExpense / totalMax) * 100) : 0;
  const isOverallExceeded = totalMax > 0 && monthlyExpense > totalMax;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget: Budget = {
      month: selectedMonth,
      expectedIncome: parseFloat(expectedIncome) || 0,
      maxTotalExpense: parseFloat(maxTotalExpense) || 0,
      categoryBudgets,
    };
    await saveBudget(newBudget);
    setIsEditing(false);
  };

  const handleCategoryBudgetChange = (catName: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCategoryBudgets((prev) => ({
      ...prev,
      [catName]: num,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">الميزانية الشهرية والتحكم في النفقات</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديد السقف المالي ومراقبة استهلاك النفقات حسب كل تصنيف
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector & Edit Button */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs">
            <span className="text-slate-500 font-medium">الشهر:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800 font-bold text-xs"
            />
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 cursor-pointer active:scale-98 transition-all"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                <span>إلغاء التعديل</span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                <span>تعديل الميزانية</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Budget Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              ملخص الميزانية الإجمالية لشهر {selectedMonth}
            </h2>
            <p className="text-xs text-slate-500">
              مقارنة الحد الأقصى المخطط للمصروفات مع ما تم صرفه فعلياً
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isOverallExceeded
                  ? 'bg-rose-100 text-rose-800'
                  : totalRatio >= 80
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isOverallExceeded ? '⚠️ تم تجاوز الميزانية!' : `استهلكت ${totalRatio}% من الميزانية`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">
              المصروف الفعلي: {formatCurrency(monthlyExpense)}
            </span>
            <span className="text-slate-600">
              الحد الأقصى: {formatCurrency(totalMax)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isOverallExceeded
                  ? 'bg-rose-600'
                  : totalRatio >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(totalRatio, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0 {settings.currency}</span>
            <span className={totalMax - monthlyExpense < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
              {totalMax - monthlyExpense < 0
                ? `عجز: ${formatCurrency(Math.abs(totalMax - monthlyExpense))}`
                : `المتبقي للصرف: ${formatCurrency(totalMax - monthlyExpense)}`}
            </span>
            <span>{formatCurrency(totalMax)}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-semibold">الدخل المتوقع للشهر</span>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              {formatCurrency(currentBudget?.expectedIncome || parseFloat(expectedIncome) || 0)}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-semibold">الحد الأقصى للمصروفات</span>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              {formatCurrency(totalMax)}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-xs text-slate-500 font-semibold">الادخار المخطط للشهر</span>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">
              {formatCurrency(
                Math.max(
                  0,
                  (currentBudget?.expectedIncome || parseFloat(expectedIncome) || 0) - totalMax
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editing Form (collapsible) */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl p-6 border-2 border-purple-300 shadow-md space-y-4 animate-in fade-in text-right"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-sm text-purple-900">
              تحديد وضبط أرقام ميزانية شهر {selectedMonth}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الدخل المتوقع للشهر ({settings.currency})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={expectedIncome}
                onChange={(e) => setExpectedIncome(e.target.value)}
                placeholder="مثال: 25000"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:border-purple-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الحد الأقصى الإجمالي للمصروفات ({settings.currency})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={maxTotalExpense}
                onChange={(e) => setMaxTotalExpense(e.target.value)}
                placeholder="مثال: 18000"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:border-purple-500 outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              تحديد ميزانية مخصصة لكل تصنيف:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {c.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={categoryBudgets[c.name] || ''}
                    onChange={(e) => handleCategoryBudgetChange(c.name, e.target.value)}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-white rounded-lg border border-slate-300 text-xs font-bold text-slate-800 outline-hidden text-right"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الميزانية</span>
            </button>
          </div>
        </form>
      )}

      {/* Category Budgets Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800">
          استهلاك الميزانية حسب التصنيفات المختلفة
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const planned = (currentBudget?.categoryBudgets && currentBudget.categoryBudgets[cat.name]) || 0;
            const actual = actualByCategory[cat.name] || 0;
            const ratio = planned > 0 ? Math.round((actual / planned) * 100) : 0;
            const isExceeded = planned > 0 && actual > planned;

            return (
              <div
                key={cat.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-2 text-right ${
                  isExceeded
                    ? 'border-rose-300 bg-rose-50/10'
                    : ratio >= 80
                    ? 'border-amber-300 bg-amber-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">{cat.name}</span>
                  {planned > 0 ? (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isExceeded
                          ? 'bg-rose-100 text-rose-800'
                          : ratio >= 80
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ratio}%
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">غير محدد</span>
                  )}
                </div>

                {planned > 0 ? (
                  <>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isExceeded ? 'bg-rose-600' : ratio >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        صرفت: <strong className="text-slate-800">{formatCurrency(actual)}</strong>
                      </span>
                      <span className="text-slate-500">
                        المخطط: <strong className="text-slate-800">{formatCurrency(planned)}</strong>
                      </span>
                    </div>
                    <div className="text-[11px] pt-1 border-t border-slate-100 flex justify-between">
                      <span className="text-slate-400">المتبقي:</span>
                      <span
                        className={`font-bold ${
                          planned - actual < 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {planned - actual < 0
                          ? `تجاوز بـ ${formatCurrency(Math.abs(planned - actual))}`
                          : formatCurrency(planned - actual)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400 pt-2 flex items-center justify-between">
                    <span>صرفت: {formatCurrency(actual)}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-purple-600 font-bold hover:underline"
                    >
                      حدد سقفاً +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
