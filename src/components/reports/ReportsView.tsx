import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Printer,
  FileSpreadsheet,
  Calendar,
  Filter,
} from 'lucide-react';
import { openPrintableReport, exportTransactionsToCsv } from '../../services/export';

export const ReportsView: React.FC = () => {
  const {
    incomes,
    expenses,
    dailyRequirements,
    monthlyRequirements,
    selectedMonth,
    setSelectedMonth,
    formatCurrency,
    settings,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'categories' | 'methods' | 'daily_trend'>('overview');

  // Filtered by selectedMonth
  const monthIncomes = useMemo(() => {
    return incomes.filter((i) => i.date.startsWith(selectedMonth));
  }, [incomes, selectedMonth]);

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const totalIncome = useMemo(() => monthIncomes.reduce((s, i) => s + i.amount, 0), [monthIncomes]);
  const totalExpense = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses]);
  const netIncome = totalIncome - totalExpense;

  // Expenses grouped by category
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of monthExpenses) {
      map[exp.category] = (map[exp.category] || 0) + exp.amount;
    }
    const list = Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }));
    return list.sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, totalExpense]);

  // Expenses grouped by payment method
  const methodStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of monthExpenses) {
      map[exp.paymentMethod] = (map[exp.paymentMethod] || 0) + exp.amount;
    }
    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, totalExpense]);

  // Daily distribution throughout the month (day 1 to 31)
  const dailyDistribution = useMemo(() => {
    const daysInMonth = 31;
    const days: Array<{ day: number; expense: number; income: number }> = [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const totalDays = new Date(year, month, 0).getDate() || 30;

    for (let d = 1; d <= totalDays; d++) {
      const dayStr = `${selectedMonth}-${d.toString().padStart(2, '0')}`;
      const dayExp = monthExpenses
        .filter((e) => e.date === dayStr)
        .reduce((s, e) => s + e.amount, 0);
      const dayInc = monthIncomes
        .filter((i) => i.date === dayStr)
        .reduce((s, i) => s + i.amount, 0);
      days.push({ day: d, expense: dayExp, income: dayInc });
    }
    return days;
  }, [monthExpenses, monthIncomes, selectedMonth]);

  const maxDailyExpense = Math.max(...dailyDistribution.map((d) => d.expense), 100);

  // Palettes for categories chart
  const COLOR_PALETTE = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#14b8a6', '#64748b', '#f97316'
  ];

  // Printable Report Generation
  const handlePrintMonthlyReport = () => {
    openPrintableReport({
      title: `التقرير المالي الشهري المفصل`,
      subtitle: `عن شهر ${selectedMonth}`,
      currency: settings.currency,
      stats: [
        { label: 'إجمالي الدخل الشهري', value: totalIncome.toLocaleString('ar-EG'), color: '#059669' },
        { label: 'إجمالي المصروفات الشهرية', value: totalExpense.toLocaleString('ar-EG'), color: '#e11d48' },
        { label: 'صافي الفائض المالي', value: netIncome.toLocaleString('ar-EG'), color: netIncome >= 0 ? '#059669' : '#e11d48' },
        { label: 'إجمالي العمليات', value: monthIncomes.length + monthExpenses.length },
      ],
      tables: [
        {
          title: 'توزيع المصروفات حسب التصنيف',
          headers: ['التصنيف', 'المبلغ الإجمالي', 'النسبة المئوية'],
          rows: categoryStats.map((c) => [c.name, `${c.amount.toLocaleString('ar-EG')} ${settings.currency}`, `${c.percentage}%`]),
        },
        {
          title: 'توزيع المصروفات حسب طريقة الدفع',
          headers: ['طريقة الدفع', 'المبلغ الإجمالي', 'النسبة المئوية'],
          rows: methodStats.map((m) => [m.name, `${m.amount.toLocaleString('ar-EG')} ${settings.currency}`, `${m.percentage}%`]),
        },
      ],
    });
  };

  const handleExportMonthCsv = () => {
    const combined = [
      ...monthIncomes.map((i) => ({
        date: i.date,
        type: 'دخل' as const,
        title: i.source,
        categoryOrSource: i.type || 'دخل',
        amount: i.amount,
        paymentMethod: i.paymentMethod,
        description: i.description || '',
        hasReceipt: !!i.receiptImage,
      })),
      ...monthExpenses.map((e) => ({
        date: e.date,
        type: 'مصروف' as const,
        title: e.title,
        categoryOrSource: e.category,
        amount: e.amount,
        paymentMethod: e.paymentMethod,
        description: e.description || '',
        hasReceipt: !!e.receiptImage,
      })),
    ];
    exportTransactionsToCsv(combined, `monthly-report-${selectedMonth}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Month Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">التقارير المالية والرسوم البيانية</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                تحليلات بصرية للمصروفات، الإيرادات، وتوزيع الميزانية
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
            onClick={handleExportMonthCsv}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel/CSV</span>
          </button>

          <button
            onClick={handlePrintMonthlyReport}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-600" />
            <span>طباعة تقرير PDF</span>
          </button>
        </div>
      </div>

      {/* Primary Month Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي دخل الشهر ({selectedMonth})</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(totalIncome)}
          </div>
          <span className="text-[11px] text-slate-400">{monthIncomes.length} حركة دخل</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي مصروفات الشهر</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(totalExpense)}
          </div>
          <span className="text-[11px] text-slate-400">{monthExpenses.length} حركة صرف</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">صافي الفائض / العجز المالي</span>
          <div
            className={`text-xl font-black mt-1 ${
              netIncome >= 0 ? 'text-teal-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netIncome)}
          </div>
          <span className="text-[11px] text-slate-400">
            {netIncome >= 0 ? 'فائض مالي جيد' : 'عجز في الميزانية'}
          </span>
        </div>
      </div>

      {/* Reports Segmented Sub-Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('overview')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeReportTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          مقارنة الدخل والمصروف
        </button>
        <button
          onClick={() => setActiveReportTab('categories')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeReportTab === 'categories'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          المصروفات حسب التصنيف
        </button>
        <button
          onClick={() => setActiveReportTab('daily_trend')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeReportTab === 'daily_trend'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          توزيع المصروفات اليومية
        </button>
        <button
          onClick={() => setActiveReportTab('methods')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            activeReportTab === 'methods'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          حسب طرق الدفع
        </button>
      </div>

      {/* Tab 1: Income vs Expenses Comparison Visual */}
      {activeReportTab === 'overview' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              مقارنة الدخل الإجمالي بالمصروفات لشهر {selectedMonth}
            </h3>
            <p className="text-xs text-slate-500">تمثيل بياني مقارن للتدفقات النقدية الداخلة والخارجة</p>
          </div>

          {/* Bar comparison container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              {/* Income Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>إجمالي الدخل</span>
                  </span>
                  <span className="text-emerald-700">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        totalIncome + totalExpense > 0
                          ? Math.round((totalIncome / (totalIncome + totalExpense)) * 100)
                          : 50
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Expense Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-rose-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>إجمالي المصروفات</span>
                  </span>
                  <span className="text-rose-700">{formatCurrency(totalExpense)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        totalIncome + totalExpense > 0
                          ? Math.round((totalExpense / (totalIncome + totalExpense)) * 100)
                          : 50
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Savings Ratio Indicator */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-600 font-medium">معدل الادخار من إجمالي الدخل:</span>
                <span
                  className={`font-black ${
                    totalIncome > 0 && netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {totalIncome > 0 ? `${Math.round((netIncome / totalIncome) * 100)}%` : '0%'}
                </span>
              </div>
            </div>

            {/* SVG Visual Comparison Gauge */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
              <svg width="220" height="220" viewBox="0 0 220 220" className="rotate-[-90deg]">
                <circle
                  cx="110"
                  cy="110"
                  r="85"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="24"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="85"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="24"
                  strokeDasharray="534"
                  strokeDashoffset={
                    534 -
                    (534 *
                      Math.max(
                        0,
                        totalIncome + totalExpense > 0
                          ? (totalIncome / (totalIncome + totalExpense))
                          : 0.5
                      ))
                  }
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="mt-[-135px] mb-8 text-center">
                <span className="text-xs text-slate-400 font-medium block">صافي الفائض</span>
                <span
                  className={`text-base font-black ${
                    netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {formatCurrency(netIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Expenses by Category with Visual Donut & Table */}
      {activeReportTab === 'categories' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              توزيع المصروفات حسب التصنيف لشهر {selectedMonth}
            </h3>
            <p className="text-xs text-slate-500">
              نسبة استهلاك كل بند من إجمالي المصروفات ({formatCurrency(totalExpense)})
            </p>
          </div>

          {categoryStats.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              لا توجد مصروفات مسجلة لهذا الشهر.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Progress list */}
              <div className="space-y-3">
                {categoryStats.map((cat, idx) => {
                  const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span>{cat.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-semibold">{cat.percentage}%</span>
                          <span className="font-bold text-slate-900">
                            {formatCurrency(cat.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Category Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">التصنيف</th>
                      <th className="py-2.5 px-3">المبلغ</th>
                      <th className="py-2.5 px-3 text-center">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categoryStats.map((cat) => (
                      <tr key={cat.name} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 font-bold text-slate-800">{cat.name}</td>
                        <td className="py-2 px-3 font-semibold text-rose-600">
                          {formatCurrency(cat.amount)}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-600">
                          {cat.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Daily Trend Throughout Month */}
      {activeReportTab === 'daily_trend' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              المصروفات اليومية خلال أيام شهر {selectedMonth}
            </h3>
            <p className="text-xs text-slate-500">مخطط بياني يوضح ذروة الإنفاق اليومي على مدار أيام الشهر</p>
          </div>

          <div className="pt-4 overflow-x-auto">
            <div className="min-w-[600px] h-48 flex items-end gap-1.5 pb-6 border-b border-slate-200 px-2">
              {dailyDistribution.map((item) => {
                const heightPercent = maxDailyExpense > 0 ? (item.expense / maxDailyExpense) * 100 : 0;
                return (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md shadow-lg z-20 pointer-events-none whitespace-nowrap">
                      <span>يوم {item.day}</span>
                      <span className="font-bold text-rose-300">{formatCurrency(item.expense)}</span>
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${Math.max(heightPercent, item.expense > 0 ? 8 : 2)}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        item.expense > 0
                          ? 'bg-rose-500 group-hover:bg-rose-600'
                          : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                    />

                    {/* Day label */}
                    <span className="absolute top-full mt-1 text-[10px] text-slate-400 font-medium">
                      {item.day % 2 === 1 ? item.day : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-3 px-2">
              <span>أيام الشهر (1 إلى 31)</span>
              <span>أعلى صرف يومي: {formatCurrency(maxDailyExpense)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Expenses by Payment Method */}
      {activeReportTab === 'methods' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              توزيع المصروفات حسب طرق الدفع لشهر {selectedMonth}
            </h3>
            <p className="text-xs text-slate-500">
              المبالغ المدفوعة نقداً، تحويل بنكي، محفظة إلكترونية، أو بطاقة بنكية
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {methodStats.map((item) => (
              <div
                key={item.name}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-800">{item.name}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {item.percentage}%
                  </span>
                </div>
                <div className="text-base font-black text-rose-600">
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
