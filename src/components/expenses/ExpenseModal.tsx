import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, PaymentMethod } from '../../types';
import { compressImage } from '../../services/imageUtils';
import { X, Upload, Trash2, DollarSign, Plus } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

const PAYMENT_METHODS: PaymentMethod[] = ['نقدي', 'محفظة إلكترونية', 'تحويل بنكي', 'بطاقة بنكية', 'أخرى'];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, expenseToEdit }) => {
  const { addExpense, updateExpense, categories, addCategory, showToast, settings } = useApp();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('طعام');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('نقدي');
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Inline new category state
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setDate(expenseToEdit.date);
      setTime(expenseToEdit.time);
      setTitle(expenseToEdit.title);
      setCategory(expenseToEdit.category || 'طعام');
      setPaymentMethod(expenseToEdit.paymentMethod || 'نقدي');
      setDescription(expenseToEdit.description || '');
      setReceiptImage(expenseToEdit.receiptImage);
    } else {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      setAmount('');
      setDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
      setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
      setTitle('');
      setCategory(categories[0]?.name || 'طعام');
      setPaymentMethod('نقدي');
      setDescription('');
      setReceiptImage(undefined);
    }
    setShowAddCat(false);
    setNewCatName('');
    setErrorMsg('');
  }, [expenseToEdit, isOpen, categories]);

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

  const handleCreateNewCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name === trimmed)) {
      setCategory(trimmed);
      setShowAddCat(false);
      return;
    }

    await addCategory({
      name: trimmed,
      color: '#3b82f6',
      icon: 'Tag',
    });
    setCategory(trimmed);
    setNewCatName('');
    setShowAddCat(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('يرجى كتابة بند المصروف (مثال: بنزين، مشتريات خضار...)');
      return;
    }

    if (!date) {
      setErrorMsg('يرجى تحديد تاريخ المصروف');
      return;
    }

    try {
      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, {
          amount: numAmount,
          date,
          time: time || '12:00',
          title: title.trim(),
          category,
          paymentMethod,
          description,
          receiptImage,
        });
      } else {
        await addExpense({
          amount: numAmount,
          date,
          time: time || '12:00',
          title: title.trim(),
          category,
          paymentMethod,
          description,
          receiptImage,
        });
      }
      onClose();
    } catch {
      setErrorMsg('فشل حفظ المصروف، يرجى المحاولة مرة أخرى');
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/60">
          <div>
            <h3 className="text-base font-extrabold text-rose-950">
              {expenseToEdit ? 'تعديل تسجيل المصروف' : 'تسجيل مصروف جديد'}
            </h3>
            <p className="text-xs text-rose-700/80 mt-0.5">سجل مدفوعاتك اليومية والفواتير والمشتريات</p>
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
              المبلغ المدفوع ({settings.currency}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="مثال: 250"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg('');
                }}
                required
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-base font-bold text-slate-900 transition-all outline-hidden text-right"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              بند المصروف <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: شراء طلبات السوبرماركت، بنزين، غداء عمل..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrorMsg('');
              }}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-rose-500 outline-hidden"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التاريخ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-rose-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الوقت</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-rose-500 outline-hidden"
              />
            </div>
          </div>

          {/* Category Selector + Add Category Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">التصنيف</label>
              <button
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تصنيف جديد</span>
              </button>
            </div>

            {showAddCat && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="text"
                  placeholder="اسم التصنيف الجديد..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-right"
                />
                <button
                  type="button"
                  onClick={handleCreateNewCategory}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                >
                  إضافة
                </button>
              </div>
            )}

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-rose-500 outline-hidden bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  type="button"
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    paymentMethod === pm
                      ? 'border-rose-600 bg-rose-50 text-rose-800 font-bold'
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
              placeholder="تفاصيل إضافية عن الفاتورة أو المشتريات..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-rose-500 outline-hidden"
            />
          </div>

          {/* Receipt Image Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              إرفاق صورة الفاتورة أو الإيصال أو إثبات الدفع
            </label>

            {receiptImage ? (
              <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptImage}
                    alt="معاينة الفاتورة"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">تم إرفاق صورة الفاتورة</span>
                    <p className="text-[11px] text-rose-600">محفوظة ومربوطة بالعملية</p>
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
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-rose-500 rounded-xl p-4 cursor-pointer bg-slate-50/50 hover:bg-rose-50/20 transition-all">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700">اضغط لرفع صورة فاتورة أو إيصال</span>
                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP, SVG</span>
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
              <span className="text-[11px] text-slate-500 mt-1 block">جاري ضغط ومعالجة الصورة...</span>
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              {expenseToEdit ? 'حفظ التعديلات' : 'تسجيل المصروف'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
