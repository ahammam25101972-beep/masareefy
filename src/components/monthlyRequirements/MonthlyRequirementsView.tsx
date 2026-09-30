import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MonthlyRequirement, MonthlyRequirementStatus } from '../../types';
import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';
import confetti from 'canvas-confetti';

interface MonthlyRequirementsViewProps {
  onOpenModal: () => void;
  onEdit: (req: MonthlyRequirement) => void;
}

export const MonthlyRequirementsView: React.FC<MonthlyRequirementsViewProps> = ({
  onOpenModal,
  onEdit,
}) => {
  const {
    monthlyRequirements,
    selectedMonth,
    setSelectedMonth,
    deleteMonthlyRequirement,
    changeMonthlyRequirementStatus,
    formatCurrency,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<MonthlyRequirement | null>(null);

  // Requirements for selected month
  const monthRequirements = useMemo(() => {
    return monthlyRequirements.filter((r) => r.month === selectedMonth);
  }, [monthlyRequirements, selectedMonth]);

  // Filtered by status
  const filteredRequirements = useMemo(() => {
    if (statusFilter === 'all') return monthRequirements;
    return monthRequirements.filter((r) => r.status === statusFilter);
  }, [monthRequirements, statusFilter]);

  // Calculations
  const expectedTotal = useMemo(() => {
    return monthRequirements.reduce((sum, r) => sum + r.expectedAmount, 0);
  }, [monthRequirements]);

  const paidTotal = useMemo(() => {
    return monthRequirements
      .filter((r) => r.status === 'تم الدفع' || r.status === 'تم الشراء')
      .reduce((sum, r) => sum + (r.actualAmount && r.actualAmount > 0 ? r.actualAmount : r.expectedAmount), 0);
  }, [monthRequirements]);

  const remainingTotal = useMemo(() => {
    return monthRequirements
      .filter((r) => r.status === 'مطلوب')
      .reduce((sum, r) => sum + r.expectedAmount, 0);
  }, [monthRequirements]);

  const progressPercentage = expectedTotal > 0 ? Math.round((paidTotal / expectedTotal) * 100) : 0;

  const handleStatusChange = async (id: string, newStatus: MonthlyRequirementStatus) => {
    const isPaying = newStatus === 'تم الدفع' || newStatus === 'تم الشراء';
    if (isPaying) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch {}
      await changeMonthlyRequirementStatus(id, newStatus, undefined, true);
    } else {
      await changeMonthlyRequirementStatus(id, newStatus, undefined, false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    await deleteMonthlyRequirement(itemToDelete.id);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Header and Month Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">المتطلبات والالتزامات الشهرية</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة الفواتير الثابتة، الإيجارات، الأقساط الشهرية، والمستلزمات
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector & Add Button */}
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
            onClick={onOpenModal}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة متطلب شهري</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي المتوقع سداده</span>
          <div className="text-xl font-black text-sky-600 mt-1">
            {formatCurrency(expectedTotal)}
          </div>
          <span className="text-[11px] text-slate-400">إجمالي {monthRequirements.length} التزام</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">المبالغ المدفوعة</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(paidTotal)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {progressPercentage}% نسبة الإنجاز
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">المبالغ المتبقية</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(remainingTotal)}
          </div>
          <span className="text-[11px] text-slate-400">
            {monthRequirements.filter((r) => r.status === 'مطلوب').length} التزام بانتظار السداد
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-semibold">معدل سداد الالتزامات</span>
          <div className="w-full bg-slate-100 rounded-full h-2.5 my-2 overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            تم سداد {paidTotal > 0 ? formatCurrency(paidTotal) : '0'} من {formatCurrency(expectedTotal)}
          </span>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الكل ({monthRequirements.length})
        </button>
        <button
          onClick={() => setStatusFilter('مطلوب')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'مطلوب'
              ? 'bg-white text-rose-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          مطلوب سداده ({monthRequirements.filter((r) => r.status === 'مطلوب').length})
        </button>
        <button
          onClick={() => setStatusFilter('تم الدفع')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'تم الدفع'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تم الدفع ({monthRequirements.filter((r) => r.status === 'تم الدفع').length})
        </button>
        <button
          onClick={() => setStatusFilter('تم الشراء')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'تم الشراء'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تم الشراء ({monthRequirements.filter((r) => r.status === 'تم الشراء').length})
        </button>
        <button
          onClick={() => setStatusFilter('متأجل')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'متأجل'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          متأجل ({monthRequirements.filter((r) => r.status === 'متأجل').length})
        </button>
      </div>

      {/* Requirements Grid */}
      {filteredRequirements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
          لا توجد التزامات شهرية مسجلة لشهر {selectedMonth}. اضغط "إضافة متطلب شهري" لإضافة الفواتير والإيجارات!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRequirements.map((req) => {
            const isPaid = req.status === 'تم الدفع' || req.status === 'تم الشراء';
            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between gap-3 text-right ${
                  isPaid
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : req.status === 'متأجل'
                    ? 'border-amber-200 bg-amber-50/20'
                    : req.status === 'ملغي'
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                {/* Top: Name, Due Date, Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>

                    <div>
                      <h3
                        className={`text-sm font-bold text-slate-900 ${
                          isPaid ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {req.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {req.dueDate && (
                          <>
                            <span className="font-semibold text-slate-700">الاستحقاق: {req.dueDate}</span>
                            <span>·</span>
                          </>
                        )}
                        <span
                          className={`font-semibold ${
                            req.priority === 'عالية'
                              ? 'text-rose-600'
                              : req.priority === 'متوسطة'
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          أولوية {req.priority}
                        </span>
                        {req.notes && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[120px]">{req.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(req)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(req)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom: Amounts & Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">المتوقع: </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {formatCurrency(req.expectedAmount)}
                    </span>
                    {req.actualAmount && req.actualAmount > 0 && req.actualAmount !== req.expectedAmount && (
                      <span className="text-[10px] text-emerald-600 mr-1.5">
                        (المسدد: {formatCurrency(req.actualAmount)})
                      </span>
                    )}
                  </div>

                  {/* Pay button or status select */}
                  <div className="flex items-center gap-1.5">
                    {!isPaid && (
                      <button
                        onClick={() => handleStatusChange(req.id, 'تم الدفع')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        سدد الآن
                      </button>
                    )}

                    <select
                      value={req.status}
                      onChange={(e) =>
                        handleStatusChange(req.id, e.target.value as MonthlyRequirementStatus)
                      }
                      className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-hidden cursor-pointer ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : req.status === 'متأجل'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : req.status === 'ملغي'
                          ? 'bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      <option value="مطلوب">مطلوب</option>
                      <option value="تم الدفع">تم الدفع ✓</option>
                      <option value="تم الشراء">تم الشراء</option>
                      <option value="متأجل">متأجل</option>
                      <option value="ملغي">ملغي</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="تأكيد حذف المتطلب الشهري"
        message={`هل أنت متأكد من حذف المتطلب "${itemToDelete?.name || ''}" بقيمة ${
          itemToDelete ? formatCurrency(itemToDelete.expectedAmount) : ''
        }؟`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
