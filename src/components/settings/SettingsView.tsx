import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dbService, DEFAULT_CATEGORIES } from '../../services/db';
import {
  Settings,
  User,
  Coins,
  Calendar,
  Tag,
  Download,
  Upload,
  Trash2,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Plus,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    categories,
    addCategory,
    deleteCategory,
    loadSampleData,
    clearAllData,
    showToast,
  } = useApp();

  const [userName, setUserName] = useState(settings.userName || '');
  const [currency, setCurrency] = useState(settings.currency || 'جنيه');
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode || 'EGP');
  const [monthStartDay, setMonthStartDay] = useState(settings.monthStartDay || 1);

  // New category
  const [newCatName, setNewCatName] = useState('');

  // Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      userName: userName.trim() || 'المستخدم',
      currency: currency.trim() || 'جنيه',
      currencyCode: currencyCode.trim() || 'EGP',
      monthStartDay: Number(monthStartDay) || 1,
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory({
      name: newCatName.trim(),
      color: '#6366f1',
      icon: 'Tag',
    });
    setNewCatName('');
  };

  // Full Backup Export
  const handleExportBackup = async () => {
    try {
      const json = await dbService.createBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mudir-masroufati-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('تم تصدير النسخة الاحتياطية بنجاح ✓', 'success');
    } catch {
      showToast('فشل تصدير النسخة الاحتياطية', 'error');
    }
  };

  // Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const success = await dbService.restoreBackup(text);
        if (success) {
          showToast('تم استعادة النسخة الاحتياطية بنجاح! يتم تحديث الصفحة...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          showToast('الملف غير صالح أو تالف', 'error');
        }
      } catch {
        showToast('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">إعدادات التطبيق وإدارة البيانات</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                تخصيص العملة، الملف الشخصي، التصنيفات، والنسخ الاحتياطي
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFirebaseGuide(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Flame className="w-4 h-4 text-amber-600" />
          <span>دليل ربط Firebase والنشر</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile & Currency Form */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-right">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>بيانات المستخدم والعملة الافتراضية</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="اسمك أو لقبك"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم العملة بالعربية</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="مثال: جنيه، ريال، درهم..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رمز العملة الدولي</label>
                <input
                  type="text"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  placeholder="مثال: EGP, SAR, USD..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                بداية الشهر المالي (يوم في الشهر)
              </label>
              <input
                type="number"
                min="1"
                max="28"
                value={monthStartDay}
                onChange={(e) => setMonthStartDay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-emerald-500 outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                عادة يوم 1 من الشهر أو يوم 25 (تاريخ نزول الراتب)
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              حفظ الإعدادات
            </button>
          </form>
        </div>

        {/* Categories Manager */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-right">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <span>إدارة وتخصيص تصنيفات المصروفات</span>
          </h2>

          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="أدخل اسم تصنيف جديد..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-indigo-500 outline-hidden"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </form>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-bold text-slate-800">{c.name}</span>
                <div className="flex items-center gap-2">
                  {c.isDefault ? (
                    <span className="text-[10px] text-slate-400">افتراضي</span>
                  ) : (
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="حذف هذا التصنيف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backup and Data Management Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 text-right">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">إدارة قاعدة البيانات والنسخ الاحتياطي</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            بياناتك محفوظة بشكل دائم داخل متصفحك (IndexedDB)، يمكنك حفظ نسخة احتياطية أو تفريغ البيانات
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Export JSON */}
          <button
            onClick={handleExportBackup}
            className="flex flex-col items-start p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 transition-all text-right cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mb-2">
              <Download className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-900">تصدير نسخة احتياطية</span>
            <span className="text-[11px] text-slate-500 mt-0.5">تحميل ملف JSON كامل بكل البيانات</span>
          </button>

          {/* Import JSON */}
          <label className="flex flex-col items-start p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 transition-all text-right cursor-pointer">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700 mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-900">استيراد نسخة احتياطية</span>
            <span className="text-[11px] text-slate-500 mt-0.5">استعادة البيانات من ملف JSON</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          {/* Load Sample Data */}
          <button
            onClick={loadSampleData}
            className="flex flex-col items-start p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 transition-all text-right cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 mb-2">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-slate-900">إعادة تحميل بيانات تجريبية</span>
            <span className="text-[11px] text-slate-500 mt-0.5">إضافة نماذج رواتب ومصروفات للتجربة</span>
          </button>

          {/* Clear All Data */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex flex-col items-start p-4 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50 transition-all text-right cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 mb-2">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-xs text-rose-900">تفريغ وحذف جميع البيانات</span>
            <span className="text-[11px] text-rose-600 mt-0.5">مسح السجلات وتصفير الحسابات</span>
          </button>
        </div>
      </div>

      {/* Firebase & Cloud Deployment Guide Modal */}
      {showFirebaseGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in"
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900">
                  دليل ربط Firebase ونشر التطبيق على الإنترنت
                </h3>
              </div>
              <button
                onClick={() => setShowFirebaseGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <strong>الحالة الحالية:</strong> يعمل التطبيق حالياً بنظام قاعدة البيانات المحلية الآمنة فائقة السرعة (IndexedDB). بياناتك وصورك تحفظ في المتصفح ولا تزول أبداً بإعادة التحميل أو إغلاق الصفحة.
              </div>

              <h4 className="font-bold text-sm text-slate-900">1. كيفية ربط Firebase Firestore & Storage للمزامنة السحابية:</h4>
              <ol className="list-decimal list-inside space-y-2 pr-2">
                <li>
                  قم بإنشاء مشروع جديد على وحدة تحكم Firebase (
                  <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-sky-600 underline">
                    Firebase Console
                  </a>
                  ).
                </li>
                <li>قم بتفعيل خدمة <strong>Cloud Firestore</strong> في وضع الإنتاج أو الاختبار.</li>
                <li>قم بتفعيل خدمة <strong>Firebase Storage</strong> لحفظ الصور والإيصالات.</li>
                <li>
                  سجل تطبيق ويب (Web App) وانسخ إعدادات <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">firebaseConfig</code>:
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl mt-1 text-[11px] font-mono overflow-x-auto text-left" dir="ltr">
{`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};`}
                  </pre>
                </li>
              </ol>

              <h4 className="font-bold text-sm text-slate-900 pt-2">2. كيفية نشر التطبيق على الإنترنت (Hosting):</h4>
              <ul className="list-disc list-inside space-y-1.5 pr-2">
                <li>
                  <strong>عبر Vercel / Netlify:</strong> ارفع مجلد المشروع على GitHub ثم اربط المستودع في Vercel مع أمر البناء <code className="bg-slate-100 px-1 rounded">npm run build</code> ومجلد الإخراج <code className="bg-slate-100 px-1 rounded">dist</code>.
                </li>
                <li>
                  <strong>عبر Firebase Hosting:</strong> نفذ الأمر <code className="bg-slate-100 px-1 rounded font-mono">npm run build</code> ثم <code className="bg-slate-100 px-1 rounded font-mono">firebase deploy</code> ليصبح متاحاً فوراً برابط عالمي مجاني وسريع.
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowFirebaseGuide(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                فهمت، شكراً لك
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirm Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="تأكيد حذف وتفريغ جميع البيانات"
        message="هل أنت متأكد تماماً من رغبتك في حذف وتفريغ جميع سجلات الدخل، المصروفات، المتطلبات، والميزانيات؟ لا يمكن استرجاع البيانات بعد ذلك إلا إذا كان لديك ملف نسخة احتياطية."
        confirmText="نعم، احذف كل شيء"
        cancelText="إلغاء"
        danger={true}
        onConfirm={async () => {
          await clearAllData();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
