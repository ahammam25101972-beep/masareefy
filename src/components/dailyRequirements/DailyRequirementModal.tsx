import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyRequirement, DailyRequirementStatus, RequirementPriority } from '../../types';
import { X, CalendarCheck } from 'lucide-react';

interface DailyRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  reqToEdit?: DailyRequirement | null;
}

const PRIORITIES: RequirementPriority[] = ['عالية', 'متوسطة', 'منخفضة'];
const STATUSES: DailyRequirementStatus[] = ['مطلوب', 'تم الشراء', 'تم التأجيل', 'تم الإلغاء'];

export const DailyRequirementModal: React.FC<DailyRequirementModalProps> = ({
  isOpen,
  onClose,
  reqToEdit,
}) => {
  const { addDailyRequirement, updateDailyRequirement, settings } = useApp();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [priority, setPriority] = useState<RequirementPriority>('متوسطة');
  const [status, setStatus] = useState<DailyRequirementStatus>('مطلوب');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (reqToEdit) {
      setName(reqToEdit.name);
      setDate(reqToEdit.date);
      setQuantity(reqToEdit.quantity.toString());
      setExpectedPrice(reqToEdit.expectedPrice.toString());
      setActualPrice(reqToEdit.actualPrice ? reqToEdit.actualPrice.toString() : '');
      setPriority(reqToEdit.priority);
      setStatus(reqToEdit.status);
      setNotes(reqToEdit.notes || '');
    } else {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      setName('');
      setDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
      setQuantity('1');
      setExpectedPrice('');
      setActualPrice('');
      setPriority('متوسطة');
      setStatus('مطلوب');
      setNotes('');
    }
    setErrorMsg('');
  }, [reqToEdit, isOpen]);

  if (!isOpen) return null;

  const totalCalculated = (parseFloat(expectedPrice) || 0) * (parseFloat(quantity) || 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم المتطلب اليومي');
      return;
    }

    const expPriceNum = parseFloat(expectedPrice) || 0;
    const qtyNum = parseFloat(quantity) || 1;
    const actPriceNum = actualPrice ? parseFloat(actualPrice) : 0;

    if (expPriceNum < 0 || qtyNum <= 0) {
      setErrorMsg('يرجى التحقق من صحة السعر المتوقع والكمية');
      return;
    }

    try {
      if (reqToEdit) {
        await updateDailyRequirement(reqToEdit.id, {
          name: name.trim(),
          date,
          quantity: qtyNum,
          expectedPrice: expPriceNum,
          actualPrice: actPriceNum,
          totalCost: totalCalculated,
          priority,
          status,
          notes,
        });
      } else {
        await addDailyRequirement({
          name: name.trim(),
          date,
          quantity: qtyNum,
          expectedPrice: expPriceNum,
          actualPrice: actPriceNum,
          totalCost: totalCalculated,
          priority,
          status,
          notes,
        });
      }
      onClose();
    } catch {
      setErrorMsg('حدث خطأ أثناء حفظ المتطلب');
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-50/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-indigo-950">
                {reqToEdit ? 'تعديل المتطلب اليومي' : 'إضافة متطلب يومي جديد'}
              </h3>
              <p className="text-xs text-indigo-700/80">المشتريات والاحتياجات اليومية السريعة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-right">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم المتطلب <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: شراء خبز، شراء لبن، شراء دواء، مواصلات..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-indigo-500 outline-hidden"
            />
          </div>

          {/* Date & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الكمية / العدد</label>
              <input
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-indigo-500 outline-hidden text-right"
              />
            </div>
          </div>

          {/* Price Expected & Actual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                السعر المتوقع ({settings.currency})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="مثال: 50"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-hidden text-right"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                السعر الفعلي (عند الشراء)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="مثال: 55"
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-hidden text-right"
              />
            </div>
          </div>

          {/* Auto calculated total info box */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-indigo-900 font-semibold">إجمالي التكلفة المتوقعة:</span>
            <span className="font-extrabold text-indigo-700 text-sm">
              {totalCalculated.toLocaleString('ar-EG')} {settings.currency}
            </span>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {STATUSES.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    status === st
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
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
              placeholder="أي تفاصيل أو ملاحظات خاصة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 outline-hidden"
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {reqToEdit ? 'حفظ التعديلات' : 'إضافة المتطلب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
