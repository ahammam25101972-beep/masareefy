import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Income, Expense } from '../../types';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Printer,
  Calendar,
} from 'lucide-react';
import { exportTransactionsToCsv, openPrintableReport } from '../../services/export';
import { ConfirmModal } from '../common/ConfirmModal';

interface TransactionsLedgerViewProps {
  onEditIncome: (income: Income) => void;
  onEditExpense: (expense: Expense) => void;
}

export const TransactionsLedgerView: React.FC<TransactionsLedgerViewProps> = ({
  onEditIncome,
  onEditExpense,
}) => {
  const {
    incomes,
    expenses,
    categories,
    deleteIncome,
    deleteExpense,
    openImageModal,
    formatCurrency,
    selectedMonth,
    settings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterMonth, setFilterMonth] = useState(selectedMonth);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: 'income' | 'expense';
    title: string;
    amount: number;
  } | null>(null);

  // Combine transactions
  const allTransactions = useMemo(() => {
    const incList = incomes.map((i) => ({
      ...i,
      txType: 'income' as const,
      displayTitle: i.source,
      displayCategory: i.type || 'دخل',
      rawItem: i,
    }));
    const expList = expenses.map((e) => ({
      ...e,
      txType: 'expense' as const,
      displayTitle: e.title,
      displayCategory: e.category,
      rawItem: e,
    }));

    return [...incList, ...expList].sort((a, b) => b.createdAt - a.createdAt);
  }, [incomes, expenses]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Type
      if (filterType !== 'all' && tx.txType !== filterType) return false;
      // Month
      if (filterMonth && !tx.date.startsWith(filterMonth)) return false;
      // Category (for expenses or income types)
      if (filterCategory !== 'all' && tx.displayCategory !== filterCategory) return false;
      // Method
      if (filterMethod !== 'all' && tx.paymentMethod !== filterMethod) return false;
      // Min/Max amount
      if (minAmount && tx.amount < parseFloat(minAmount)) return false;
      if (maxAmount && tx.amount > parseFloat(maxAmount)) return false;
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tx.displayTitle.toLowerCase().includes(q);
        const matchesCategory = tx.displayCategory.toLowerCase().includes(q);
        const matchesDesc = (tx.description || '').toLowerCase().includes(q);
        const matchesDate = tx.date.includes(q);
        const matchesAmount = tx.amount.toString().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesDesc && !matchesDate && !matchesAmount) {
          return false;
        }
      }
      return true;
    });
  }, [allTransactions, filterType, filterMonth, filterCategory, filterMethod, minAmount, maxAmount, searchQuery]);

  // Aggregated totals of the filtered list
  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.txType === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalExpense = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.txType === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const netBalance = totalIncome - totalExpense;

  const handleExportCsv = () => {
    const formatted = filteredTransactions.map((t) => ({
      date: t.date,
      type: (t.txType === 'income' ? 'دخل' : 'مصروف') as 'دخل' | 'مصروف',
      title: t.displayTitle,
      categoryOrSource: t.displayCategory,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      description: t.description || '',
      hasReceipt: !!t.receiptImage,
    }));
    exportTransactionsToCsv(formatted, `transactions-ledger-${filterMonth || 'all'}.csv`);
  };

  const handlePrintReport = () => {
    openPrintableReport({
      title: 'سجل العمليات المالية الشامل',
      subtitle: filterMonth ? `عن شهر ${filterMonth}` : 'جميع الحركات المالية المسجلة',
      currency: settings.currency,
      stats: [
        { label: 'إجمالي الدخل المفلتر', value: totalIncome.toLocaleString('ar-EG'), color: '#059669' },
        { label: 'إجمالي المصروفات المفلترة', value: totalExpense.toLocaleString('ar-EG'), color: '#e11d48' },
        { label: 'صافي الفائض / العجز', value: netBalance.toLocaleString('ar-EG'), color: netBalance >= 0 ? '#059669' : '#e11d48' },
        { label: 'عدد العمليات', value: filteredTransactions.length },
      ],
      tables: [
        {
          title: 'كشف العمليات بالتفصيل',
          headers: ['التاريخ', 'النوع', 'البيان', 'التصنيف', 'المبلغ', 'طريقة الدفع', 'الملاحظات'],
          rows: filteredTransactions.map((t) => [
            t.date,
            t.txType === 'income' ? 'دخل' : 'مصروف',
            t.displayTitle,
            t.displayCategory,
            `${t.txType === 'income' ? '+' : '-'}${t.amount.toLocaleString('ar-EG')} ${settings.currency}`,
            t.paymentMethod,
            t.description || '-',
          ]),
        },
      ],
    });
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'income') {
      await deleteIncome(itemToDelete.id);
    } else {
      await deleteExpense(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Header and Export Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900">سجل العمليات المالية الشامل</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            عرض وبحث وتصفية جميع حركات الدخل والمصروفات في مكان واحد
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleExportCsv}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel/CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-600" />
            <span>طباعة / حفظ كـ PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي الإيرادات</span>
          <div className="text-lg font-black text-emerald-600 mt-1">
            +{formatCurrency(totalIncome)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي المصروفات</span>
          <div className="text-lg font-black text-rose-600 mt-1">
            -{formatCurrency(totalExpense)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">الصافي المالي</span>
          <div
            className={`text-lg font-black mt-1 ${
              netBalance >= 0 ? 'text-teal-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netBalance)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">عدد العمليات المطابقة</span>
          <div className="text-lg font-black text-slate-800 mt-1">
            {filteredTransactions.length} عملية
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Universal Search */}
          <div className="flex-1 min-w-[220px] relative">
            <input
              type="text"
              placeholder="بحث بالبيان، الوصف، المبلغ، التاريخ، التصنيف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden bg-slate-50/50"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              دخل فقط
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              مصروف فقط
            </button>
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
        </div>

        {/* Second Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Category */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-500">التصنيف:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="all">الكل</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-500">طريقة الدفع:</span>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="all">الكل</option>
              <option value="نقدي">نقدي</option>
              <option value="محفظة إلكترونية">محفظة إلكترونية</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
              <option value="بطاقة بنكية">بطاقة بنكية</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          {/* Amount range */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
            <span className="text-slate-500">المبلغ من:</span>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-16 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-bold"
            />
            <span className="text-slate-500">إلى:</span>
            <input
              type="number"
              placeholder="∞"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-16 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-bold"
            />
          </div>

          {(searchQuery || filterCategory !== 'all' || filterMethod !== 'all' || minAmount || maxAmount) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setFilterMethod('all');
                setMinAmount('');
                setMaxAmount('');
              }}
              className="text-slate-500 hover:text-rose-600 font-bold text-xs underline cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            لا توجد عمليات مالية مسجلة تطابق هذه الفلاتر.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">التاريخ والوقت</th>
                  <th className="py-3 px-4">النوع</th>
                  <th className="py-3 px-4">البيان / الوصف</th>
                  <th className="py-3 px-4">التصنيف</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                  <th className="py-3 px-4">المستند المالي</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.txType === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        <div>{tx.date}</div>
                        <span className="text-[10px] text-slate-400">{tx.time}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isIncome ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3" />
                              <span>دخل</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3" />
                              <span>مصروف</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tx.displayTitle}</div>
                        {tx.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {tx.description}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {tx.displayCategory}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-sm whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>

                      <td className="py-3.5 px-4">
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
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>عرض الإثبات</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">لا يوجد</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              isIncome
                                ? onEditIncome(tx.rawItem as Income)
                                : onEditExpense(tx.rawItem as Expense)
                            }
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                                amount: tx.amount,
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="تأكيد حذف العملية المالية"
        message={`هل أنت متأكد من حذف ${
          itemToDelete?.type === 'income' ? 'دخل' : 'مصروف'
        } "${itemToDelete?.title || ''}" بقيمة ${
          itemToDelete ? formatCurrency(itemToDelete.amount) : ''
        }؟`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
