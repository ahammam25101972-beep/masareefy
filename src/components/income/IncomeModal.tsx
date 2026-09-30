import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Income, PaymentMethod } from '../../types';
import { compressImage } from '../../services/imageUtils';
import { X, Upload, Image as ImageIcon, Trash2, Calendar, Clock, DollarSign } from 'lucide-react';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeToEdit?: Income | null;
}

const PAYMENT_METHODS: PaymentMethod[] = ['نقدي', 'محفظة إلكترونية', 'تحويل بنكي', 'بطاقة بنكية', 'أخرى'];

const COMMON_SOURCES = ['راتب شهري', 'عمل حر (Freelance)', 'استثمار', 'مكافأة إنجاز', 'مبيعات', 'تحويل عائلي', 'أخرى'];
const COMMON_TYPES = ['راتب أساسي', 'أرباح', 'عمولة', 'هدية', 'مكافأة', 'أخرى'];

export const IncomeModal: React.FC<IncomeModalProps> = ({ isOpen, onClose, incomeToEdit }) => {
  const { addIncome, updateIncome, showToast, settings } = useApp();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [source, setSource] = useState('راتب شهري');
  const [customSource, setCustomSource] = useState('');
  const [type, setType] = useState('راتب أساسي');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('تحويل بنكي');
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (incomeToEdit) {
      setAmount(incomeToEdit.amount.toString());
      setDate(incomeToEdit.date);
      setTime(incomeToEdit.time);
      if (COMMON_SOURCES.includes(incomeToEdit.source)) {
        setSource(incomeToEdit.source);
        setCustomSource('');
      } else {
        setSource('أخرى');
        setCustomSource(incomeToEdit.source);
      }
      setType(incomeToEdit.type || 'راتب أساسي');
      setPaymentMethod(incomeToEdit.paymentMethod || 'تحويل بنكي');
      setDescription(incomeToEdit.description || '');
      setReceiptImage(incomeToEdit.receiptImage);
    } else {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      setAmount('');
      setDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
      setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
      setSource('راتب شهري');
      setCustomSource('');
      setType('راتب أساسي');
      setPaymentMethod('تحويل بنكي');
      setDescription('');
      setReceiptImage(undefined);
    }
    setErrorMsg('');
  }, [incomeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file);
      setReceiptImage(compressed);
    } catch {
      showToast('تعذر معالجة ملف الصورة', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }

    const finalSource = source === 'أخرى' && customSource.trim() ? customSource.trim() : source;

    if (!finalSource.trim()) {
      setErrorMsg('يرجى تحديد أو إدخال مصدر الدخل');
      return;
    }

    if (!date) {
      setErrorMsg('يرجى تحديد تاريخ العملية');
      return;
    }

    try {
      if (incomeToEdit) {
        await updateIncome(incomeToEdit.id, {
          amount: numAmount,
          date,
          time: time || '12:00',
          source: finalSource,
          type,
          paymentMethod,
          description,
          receiptImage,
        });
      } else {
        await addIncome({
          amount: numAmount,
          date,
          time: time || '12:00',
          source: finalSource,
          type,
          paymentMethod,
          description,
          receiptImage,
        });
      }
      onClose();
    } catch {
      setErrorMsg('فشل حفظ العملية، حاول مرة أخرى');
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/60">
          <div>
            <h3 className="text-base font-extrabold text-emerald-950">
              {incomeToEdit ? 'تعديل تسجيل الدخل' : 'تسجيل دخل جديد'}
            </h3>
            <p className="text-xs text-emerald-700/80 mt-0.5">أدخل تفاصيل الإيراد المالي أو الراتب</p>
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

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              المبلغ المستلم ({settings.currency}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="مثال: 5000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg('');
                }}
                required
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-base font-bold text-slate-900 transition-all outline-hidden text-right"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التاريخ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الوقت</label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Source & Custom Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                مصدر الدخل <span className="text-rose-500">*</span>
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden bg-white"
              >
                {COMMON_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {source === 'أخرى' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أدخل المصدر مخصص</label>
                <input
                  type="text"
                  placeholder="مثال: بيع قطعة أرض"
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-emerald-500 outline-hidden"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع الدخل</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden bg-white"
                >
                  {COMMON_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Payment / Receipt Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الاستلام</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  type="button"
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    paymentMethod === pm
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وصف أو ملاحظات</label>
            <textarea
              rows={2}
              placeholder="اكتب ملاحظات إضافية عن العملية..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Receipt Image Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              إرفاق صورة إثبات الاستلام (إيصال، تحويل، محفظة...)
            </label>

            {receiptImage ? (
              <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptImage}
                    alt="معاينة الإثبات"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">تم إرفاق الإثبات المالي</span>
                    <p className="text-[11px] text-emerald-600">جاهز للحفظ مع العملية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="حذف الصورة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700">اضغط لرفع صورة إيصال أو مستند</span>
                <span className="text-[10px] text-slate-400 mt-0.5">يدعم JPG, PNG, WEBP, SVG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isCompressing}
                  className="hidden"
                />
              </label>
            )}
            {isCompressing && (
              <span className="text-[11px] text-slate-500 mt-1 block">جاري معالجة وضغط الصورة...</span>
            )}
          </div>

          {/* Form Actions */}
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
              disabled={isCompressing}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {incomeToEdit ? 'حفظ التعديلات' : 'تسجيل الدخل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
