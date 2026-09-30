import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyRequirement, DailyRequirementStatus } from '../../types';
import {
  Plus,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Ban,
  Calendar,
  Edit2,
  Trash2,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';
import confetti from 'canvas-confetti';

interface DailyRequirementsViewProps {
  onOpenModal: () => void;
  onEdit: (req: DailyRequirement) => void;
}

export const DailyRequirementsView: React.FC<DailyRequirementsViewProps> = ({
  onOpenModal,
  onEdit,
}) => {
  const {
    dailyRequirements,
    selectedDate,
    setSelectedDate,
    deleteDailyRequirement,
    changeDailyRequirementStatus,
    formatCurrency,
    settings,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemToDelete, setItemToDelete] = useState<DailyRequirement | null>(null);

  // Requirements for selected date
  const dateRequirements = useMemo(() => {
    return dailyRequirements.filter((r) => r.date === selectedDate);
  }, [dailyRequirements, selectedDate]);

  // Filtered by status
  const filteredRequirements = useMemo(() => {
    if (statusFilter === 'all') return dateRequirements;
    return dateRequirements.filter((r) => r.status === statusFilter);
  }, [dateRequirements, statusFilter]);

  // Calculations for current date
  const totalCostExpected = useMemo(() => {
    return dateRequirements.reduce((sum, r) => sum + r.totalCost, 0);
  }, [dateRequirements]);

  const totalPaid = useMemo(() => {
    return dateRequirements
      .filter((r) => r.status === 'تم الشراء')
      .reduce((sum, r) => sum + (r.actualPrice && r.actualPrice > 0 ? r.actualPrice : r.totalCost), 0);
  }, [dateRequirements]);

  const totalRemaining = useMemo(() => {
    return dateRequirements
      .filter((r) => r.status === 'مطلوب')
      .reduce((sum, r) => sum + r.totalCost, 0);
  }, [dateRequirements]);

  const handleStatusChange = async (id: string, newStatus: DailyRequirementStatus) => {
    if (newStatus === 'تم الشراء') {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {}
      // Automatically prompt or record as expense
      await changeDailyRequirementStatus(id, newStatus, true);
    } else {
      await changeDailyRequirementStatus(id, newStatus, false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    await deleteDailyRequirement(itemToDelete.id);
    setItemToDelete(null);
  };

  // Quick navigation: Today, Yesterday, Tomorrow
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const pad = (n: number) => n.toString().padStart(2, '0');
    setSelectedDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  return (
    <div className="space-y-5">
      {/* Header and Date Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">المتطلبات اليومية</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                قائمة الاحتياجات والمشتريات اليومية (طعام، دواء، مستلزمات منزلية...)
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Add Button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setQuickDate(-1)}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded-lg font-medium cursor-pointer"
            >
              أمس
            </button>
            <button
              onClick={() => setQuickDate(0)}
              className="px-2.5 py-1 bg-white text-slate-900 font-bold rounded-lg shadow-xs cursor-pointer"
            >
              اليوم
            </button>
            <button
              onClick={() => setQuickDate(1)}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded-lg font-medium cursor-pointer"
            >
              غداً
            </button>
            <div className="w-px h-4 bg-slate-300 mx-1" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-800 font-bold text-xs"
            />
          </div>

          <button
            onClick={onOpenModal}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة متطلب يومي</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">إجمالي تكلفة متطلبات اليوم</span>
          <div className="text-xl font-black text-indigo-600 mt-1">
            {formatCurrency(totalCostExpected)}
          </div>
          <span className="text-[11px] text-slate-400">إجمالي {dateRequirements.length} متطلب</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">تم الشراء والسداد</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(totalPaid)}
          </div>
          <span className="text-[11px] text-slate-400">
            {dateRequirements.filter((r) => r.status === 'تم الشراء').length} منجز
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">المتبقي للشراء</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(totalRemaining)}
          </div>
          <span className="text-[11px] text-slate-400">
            {dateRequirements.filter((r) => r.status === 'مطلوب').length} بانتظار الإنجاز
          </span>
        </div>
      </div>

      {/* Status Segmented Control */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الكل ({dateRequirements.length})
        </button>
        <button
          onClick={() => setStatusFilter('مطلوب')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'مطلوب'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          بانتظار الشراء ({dateRequirements.filter((r) => r.status === 'مطلوب').length})
        </button>
        <button
          onClick={() => setStatusFilter('تم الشراء')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'تم الشراء'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تم الشراء ({dateRequirements.filter((r) => r.status === 'تم الشراء').length})
        </button>
        <button
          onClick={() => setStatusFilter('تم التأجيل')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'تم التأجيل'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          مؤجل ({dateRequirements.filter((r) => r.status === 'تم التأجيل').length})
        </button>
        <button
          onClick={() => setStatusFilter('تم الإلغاء')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
            statusFilter === 'تم الإلغاء'
              ? 'bg-white text-rose-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ملغي ({dateRequirements.filter((r) => r.status === 'تم الإلغاء').length})
        </button>
      </div>

      {/* Requirements Items Grid / List */}
      {filteredRequirements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
          لا توجد متطلبات مسجلة لتاريخ {selectedDate}. اضغط "إضافة متطلب يومي" لإضافة احتياجاتك!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRequirements.map((req) => {
            const isCompleted = req.status === 'تم الشراء';
            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between gap-3 text-right ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : req.status === 'تم التأجيل'
                    ? 'border-amber-200 bg-amber-50/20'
                    : req.status === 'تم الإلغاء'
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Top Row: Title, Priority, Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {/* Checkbox status button */}
                    <button
                      onClick={() =>
                        handleStatusChange(
                          req.id,
                          isCompleted ? 'مطلوب' : 'تم الشراء'
                        )
                      }
                      title={isCompleted ? 'إعادة تعيين إلى مطلوب' : 'تحديد كـ "تم الشراء" وتسجيل كمصروف'}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'border-slate-300 hover:border-emerald-500 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </button>

                    <div>
                      <h3
                        className={`text-sm font-bold text-slate-900 ${
                          isCompleted ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {req.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>الكمية: {req.quantity}</span>
                        <span>·</span>
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

                {/* Bottom Row: Cost and Status Selector */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">التكلفة: </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {formatCurrency(req.totalCost)}
                    </span>
                    {req.actualPrice && req.actualPrice > 0 && req.actualPrice !== req.totalCost && (
                      <span className="text-[10px] text-emerald-600 mr-1.5">
                        (الفعلي: {formatCurrency(req.actualPrice)})
                      </span>
                    )}
                  </div>

                  {/* Status dropdown */}
                  <div className="flex items-center gap-1">
                    <select
                      value={req.status}
                      onChange={(e) =>
                        handleStatusChange(req.id, e.target.value as DailyRequirementStatus)
                      }
                      className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-hidden cursor-pointer ${
                        req.status === 'تم الشراء'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : req.status === 'تم التأجيل'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : req.status === 'تم الإلغاء'
                          ? 'bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      <option value="مطلوب">مطلوب</option>
                      <option value="تم الشراء">تم الشراء ✓</option>
                      <option value="تم التأجيل">تم التأجيل</option>
                      <option value="تم الإلغاء">تم الإلغاء</option>
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
        title="تأكيد حذف المتطلب اليومي"
        message={`هل أنت متأكد من حذف المتطلب "${itemToDelete?.name || ''}"؟`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
