import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  ArrowUpRight,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { exportExpensesToCsv } from '../../services/export';
import { ConfirmModal } from '../common/ConfirmModal';

interface ExpenseViewProps {
  onOpenExpenseModal: () => void;
  onEditExpense: (expense: Expense) => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({ onOpenExpenseModal, onEditExpense }) => {
  const { expenses, categories, deleteExpense, openImageModal, formatCurrency, selectedMonth } =
    useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState(selectedMonth);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<Expense | null>(null);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Month
      if (filterMonth && !exp.date.startsWith(filterMonth)) return false;
      // Category
      if (filterCategory !== 'all' && exp.category !== filterCategory) return false;
      // Method
      if (filterMethod !== 'all' && exp.paymentMethod !== filterMethod) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesCat = (exp.category || '').toLowerCase().includes(q);
        const matchesDesc = (exp.description || '').toLowerCase().includes(q);
        const matchesAmount = exp.amount.toString().includes(q);
        const matchesDate = exp.date.includes(q);
        if (!matchesTitle && !matchesCat && !matchesDesc && !matchesAmount && !matchesDate) {
          return false;
        }
      }
      return true;
    });
  }, [expenses, filterMonth, filterCategory, filterMethod, searchQuery]);

  const totalFilteredExpense = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  // Top category
  const topCategory = useMemo(() => {
    if (filteredExpenses.length === 0) return '-';
    const catMap: Record<string, number> = {};
    for (const e of filteredExpenses) {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    }
    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${sorted[0][0]} (${formatCurrency(sorted[0][1])})` : '-';
  }, [filteredExpenses, formatCurrency]);

  const handleExportCsv = () => {
    exportExpensesToCsv(filteredExpenses, `expenses-${filterMonth || 'all'}.csv`);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    await deleteExpense(itemToDelete.id);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Header and Summary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">سجل المصروفات والنفقات</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة دقيقة لجميع الفواتير والمشتريات والمدفوعات اليومية
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleExportCsv}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-rose-600" />
            <span>تصدير Excel/CSV</span>
          </button>

          <button
            onClick={onOpenExpenseModal}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي المصروفات المفلترة</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(totalFilteredExpense)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">عدد فواتير ومصروفات السجل</span>
          <div className="text-xl font-black text-slate-800 mt-1">
            {filteredExpenses.length} مصروف
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">أعلى تصنيف استهلاكاً</span>
          <div className="text-sm font-black text-slate-800 mt-1 truncate" title={topCategory}>
            {topCategory}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="بحث بالبند، التصنيف، الوصف، المبلغ، التاريخ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-rose-500 outline-hidden bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500">الشهر:</span>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
          />
          {filterMonth && (
            <button
              onClick={() => setFilterMonth('')}
              className="text-slate-400 hover:text-slate-600 text-[10px] mr-1"
            >
              الكل
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
          >
            <option value="all">جميع التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
          >
            <option value="all">جميع طرق الدفع</option>
            <option value="نقدي">نقدي</option>
            <option value="محفظة إلكترونية">محفظة إلكترونية</option>
            <option value="تحويل بنكي">تحويل بنكي</option>
            <option value="بطاقة بنكية">بطاقة بنكية</option>
            <option value="أخرى">أخرى</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            لا توجد مصروفات مسجلة مطابقة للفلاتر المحددة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">التاريخ والوقت</th>
                  <th className="py-3 px-4">بند المصروف</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                  <th className="py-3 px-4">الفاتورة / الإيصال</th>
                  <th className="py-3 px-4">ملاحظات</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      <div>{item.date}</div>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-rose-600 text-sm whitespace-nowrap">
                      -{formatCurrency(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.receiptImage ? (
                        <button
                          onClick={() =>
                            openImageModal(
                              item.receiptImage!,
                              item.title,
                              item.date,
                              `-${formatCurrency(item.amount)}`
                            )
                          }
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors font-semibold text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض الفاتورة</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">لا يوجد</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {item.description || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditExpense(item)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="تأكيد حذف المصروف"
        message={`هل أنت متأكد من حذف مصروف "${itemToDelete?.title || ''}" بقيمة ${
          itemToDelete ? formatCurrency(itemToDelete.amount) : ''
        }؟`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
