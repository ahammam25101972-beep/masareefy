import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MonthlyRequirement, MonthlyRequirementStatus, RequirementPriority } from '../../types';
import { X, CalendarDays } from 'lucide-react';

interface MonthlyRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  reqToEdit?: MonthlyRequirement | null;
}

const COMMON_MONTHLY_NAMES = [
  'إيجار الشقة السكني',
  'فاتورة الكهرباء',
  'فاتورة المياه والغاز',
  'اشتراك الإنترنت المنزلي',
  'باقة وفاتورة الهاتف المحمول',
  'أقساط بنكية أو أجهزة',
  'مصاريف مدارس أو دروس',
  'مشتريات تموينية شهرية',
  'جمعية أو ادخار دوري',
  'صيانة دورية للمنزل أو السيارة',
  'أخرى',
];

const PRIORITIES: RequirementPriority[] = ['عالية', 'متوسطة', 'منخفضة'];
const STATUSES: MonthlyRequirementStatus[] = ['مطلوب', 'تم الدفع', 'تم الشراء', 'متأجل', 'ملغي'];

export const MonthlyRequirementModal: React.FC<MonthlyRequirementModalProps> = ({
  isOpen,
  onClose,
  reqToEdit,
}) => {
  const { addMonthlyRequirement, updateMonthlyRequirement, selectedMonth, settings } = useApp();

  const [name, setName] = useState('إيجار الشقة السكني');
  const [customName, setCustomName] = useState('');
  const [month, setMonth] = useState(selectedMonth);
  const [expectedAmount, setExpectedAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<RequirementPriority>('عالية');
  const [status, setStatus] = useState<MonthlyRequirementStatus>('مطلوب');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (reqToEdit) {
      if (COMMON_MONTHLY_NAMES.includes(reqToEdit.name)) {
        setName(reqToEdit.name);
        setCustomName('');
      } else {
        setName('أخرى');
        setCustomName(reqToEdit.name);
      }
      setMonth(reqToEdit.month);
      setExpectedAmount(reqToEdit.expectedAmount.toString());
      setActualAmount(reqToEdit.actualAmount ? reqToEdit.actualAmount.toString() : '');
      setDueDate(reqToEdit.dueDate || '');
      setPriority(reqToEdit.priority);
      setStatus(reqToEdit.status);
      setNotes(reqToEdit.notes || '');
    } else {
      setName('إيجار الشقة السكني');
      setCustomName('');
      setMonth(selectedMonth);
      setExpectedAmount('');
      setActualAmount('');
      setDueDate(`${selectedMonth}-05`);
      setPriority('عالية');
      setStatus('مطلوب');
      setNotes('');
    }
    setErrorMsg('');
  }, [reqToEdit, isOpen, selectedMonth]);

  if (!isOpen) return null;

  const finalName = name === 'أخرى' && customName.trim() ? customName.trim() : name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalName.trim()) {
      setErrorMsg('يرجى تحديد أو إدخال اسم المتطلب الشهري');
      return;
    }

    const expAmt = parseFloat(expectedAmount);
    if (isNaN(expAmt) || expAmt <= 0) {
      setErrorMsg('يرجى إدخال مبلغ متوقع صحيح أكبر من الصفر');
      return;
    }

    const actAmt = actualAmount ? parseFloat(actualAmount) : 0;

    try {
      if (reqToEdit) {
        await updateMonthlyRequirement(reqToEdit.id, {
          name: finalName,
          month,
          expectedAmount: expAmt,
          actualAmount: actAmt,
          dueDate: dueDate || `${month}-01`,
          priority,
          status,
          notes,
        });
      } else {
        await addMonthlyRequirement({
          name: finalName,
          month,
          expectedAmount: expAmt,
          actualAmount: actAmt,
          dueDate: dueDate || `${month}-01`,
          priority,
          status,
          notes,
        });
      }
      onClose();
    } catch {
      setErrorMsg('حدث خطأ أثناء حفظ المتطلب الشهري');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-sky-950">
                {reqToEdit ? 'تعديل المتطلب الشهري' : 'إضافة متطلب شهري جديد'}
              </h3>
              <p className="text-xs text-sky-700/80">الفواتير، الإيجارات، والأقساط الشهرية الثابتة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-right">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Name & Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم المتطلب / الالتزام الشهري <span className="text-rose-500">*</span>
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-sky-500 outline-hidden bg-white mb-2"
            >
              {COMMON_MONTHLY_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            {name === 'أخرى' && (
              <input
                type="text"
                placeholder="اكتب اسم المتطلب الشهري..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-sky-500 outline-hidden"
              />
            )}
          </div>

          {/* Month & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الشهر المستحق <span className="text-rose-500">*</span>
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-sky-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-sky-500 outline-hidden"
              />
            </div>
          </div>

          {/* Expected & Actual Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المبلغ المتوقع ({settings.currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="مثال: 1500"
                value={expectedAmount}
                onChange={(e) => setExpectedAmount(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:border-sky-500 outline-hidden text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المبلغ الفعلي (عند السداد)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="المسدد فعلياً"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:border-sky-500 outline-hidden text-right"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الأولوية</label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    priority === p
                      ? p === 'عالية'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : p === 'متوسطة'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-slate-500 bg-slate-100 text-slate-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">حالة المتطلب</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {STATUSES.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    status === st
                      ? 'border-sky-600 bg-sky-50 text-sky-800'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
            <textarea
              rows={2}
              placeholder="رقم الفاتورة، تفاصيل الحساب البنكي، جهة السداد..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-sky-500 outline-hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-98 rounded-xl shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              {reqToEdit ? 'حفظ التعديلات' : 'إضافة المتطلب الشهري'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
