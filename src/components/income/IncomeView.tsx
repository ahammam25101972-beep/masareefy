import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Income, PaymentMethod } from '../../types';
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit2,
  Trash2,
  ArrowDownLeft,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { exportIncomesToCsv } from '../../services/export';
import { ConfirmModal } from '../common/ConfirmModal';

interface IncomeViewProps {
  onOpenIncomeModal: () => void;
  onEditIncome: (income: Income) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({ onOpenIncomeModal, onEditIncome }) => {
  const { incomes, deleteIncome, openImageModal, formatCurrency, selectedMonth } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState(selectedMonth);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<Income | null>(null);

  // Filtered incomes
  const filteredIncomes = useMemo(() => {
    return incomes.filter((inc) => {
      // Month
      if (filterMonth && !inc.date.startsWith(filterMonth)) return false;
      // Method
      if (filterMethod !== 'all' && inc.paymentMethod !== filterMethod) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSource = inc.source.toLowerCase().includes(q);
        const matchesType = (inc.type || '').toLowerCase().includes(q);
        const matchesDesc = (inc.description || '').toLowerCase().includes(q);
        const matchesAmount = inc.amount.toString().includes(q);
        const matchesDate = inc.date.includes(q);
        if (!matchesSource && !matchesType && !matchesDesc && !matchesAmount && !matchesDate) {
          return false;
        }
      }
      return true;
    });
  }, [incomes, filterMonth, filterMethod, searchQuery]);

  const totalFilteredIncome = useMemo(() => {
    return filteredIncomes.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredIncomes]);

  const handleExportCsv = () => {
    exportIncomesToCsv(filteredIncomes, `incomes-${filterMonth || 'all'}.csv`);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    await deleteIncome(itemToDelete.id);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Header and Summary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">سجل إيرادات الدخل</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة الرواتب والأرباح والتحويلات المالية الواردة
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
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel/CSV</span>
          </button>

          <button
            onClick={onOpenIncomeModal}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل دخل جديد</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي الدخل المفلتر</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(totalFilteredIncome)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">عدد العمليات المسجلة</span>
          <div className="text-xl font-black text-slate-800 mt-1">
            {filteredIncomes.length} عملية
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">متوسط قيمة العملية</span>
          <div className="text-xl font-black text-teal-600 mt-1">
            {formatCurrency(filteredIncomes.length > 0 ? totalFilteredIncome / filteredIncomes.length : 0)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="بحث بالمصدر، الوصف، المبلغ، التاريخ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden bg-slate-50/50"
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

        {/* Payment Method Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-transparent font-bold text-slate-800 focus:outline-hidden"
          >
            <option value="all">جميع طرق الاستلام</option>
            <option value="نقدي">نقدي</option>
            <option value="محفظة إلكترونية">محفظة إلكترونية</option>
            <option value="تحويل بنكي">تحويل بنكي</option>
            <option value="بطاقة بنكية">بطاقة بنكية</option>
            <option value="أخرى">أخرى</option>
          </select>
        </div>
      </div>

      {/* Incomes Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredIncomes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            لا توجد إيرادات مسجلة مطابقة للفلاتر المحددة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">التاريخ والوقت</th>
                  <th className="py-3 px-4">مصدر الدخل</th>
                  <th className="py-3 px-4">نوع الدخل</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4">طريقة الاستلام</th>
                  <th className="py-3 px-4">الإثبات</th>
                  <th className="py-3 px-4">ملاحظات</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncomes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      <div>{item.date}</div>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.source}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.type || '-'}</td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 text-sm whitespace-nowrap">
                      +{formatCurrency(item.amount)}
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
                              item.source,
                              item.date,
                              `+${formatCurrency(item.amount)}`
                            )
                          }
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-semibold text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض الإيصال</span>
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
                          onClick={() => onEditIncome(item)}
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
        title="تأكيد حذف تسجيل الدخل"
        message={`هل أنت متأكد من حذف دخل "${itemToDelete?.source || ''}" بمبلغ ${
          itemToDelete ? formatCurrency(itemToDelete.amount) : ''
        }؟`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
