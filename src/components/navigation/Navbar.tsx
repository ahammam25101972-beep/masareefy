import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  Wallet,
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  Settings,
  Bell,
  Plus,
  Calendar,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenDailyReqModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenDailyReqModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    selectedDate,
    setSelectedDate,
    notifications,
    settings,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'income', label: 'الدخل', icon: ArrowDownLeft },
    { id: 'expenses', label: 'المصروفات', icon: ArrowUpRight },
    { id: 'daily-req', label: 'المتطلبات اليومية', icon: CalendarCheck },
    { id: 'monthly-req', label: 'المتطلبات الشهرية', icon: CalendarDays },
    { id: 'ledger', label: 'سجل العمليات', icon: FileSpreadsheet },
    { id: 'budget', label: 'الميزانية', icon: PieChart },
    { id: 'reports', label: 'التقارير', icon: BarChart3 },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">مدير مصروفاتي</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                  النسخة الذكية
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500">
                مرحباً، <span className="font-medium text-slate-700">{settings.userName}</span>
              </p>
            </div>
          </div>

          {/* Date & Month Global Filter Controls */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs">
            <div className="flex items-center gap-1 px-2 text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>الشهر:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-bold focus:outline-emerald-500"
              />
            </div>
            <div className="w-px h-4 bg-slate-300" />
            <div className="flex items-center gap-1 px-2 text-slate-600 font-medium">
              <span>اليوم:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-bold focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="flex items-center gap-2">
            {/* Quick Add Buttons on Desktop */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={onOpenIncomeModal}
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة دخل</span>
              </button>

              <button
                onClick={onOpenExpenseModal}
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مصروف</span>
              </button>

              <button
                onClick={onOpenDailyReqModal}
                className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة متطلب</span>
              </button>
            </div>

            {/* Mobile Quick Add Menu Button */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="p-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>

              {showQuickMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-right">
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenIncomeModal();
                    }}
                    className="w-full px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>تسجيل دخل جديد</span>
                    <ArrowDownLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenExpenseModal();
                    }}
                    className="w-full px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center justify-between"
                  >
                    <span>تسجيل مصروف جديد</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenDailyReqModal();
                    }}
                    className="w-full px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <span>تسجيل متطلب جديد</span>
                    <CalendarCheck className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="التنبيهات والإشعارات"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Flyout */}
              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-right animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="font-bold text-sm text-slate-900">التنبيهات والمستحقات ({notifications.length})</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      لا توجد تنبيهات حالياً. كل شيء تحت السيطرة!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border text-xs ${
                            notif.type === 'danger'
                              ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                              : notif.type === 'warning'
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                              : 'bg-sky-50/70 border-sky-200 text-sky-900'
                          }`}
                        >
                          <div className="font-bold mb-1">{notif.title}</div>
                          <p className="text-slate-600 leading-relaxed mb-2">{notif.message}</p>
                          {notif.actionTab && (
                            <button
                              onClick={() => {
                                setActiveTab(notif.actionTab as ActiveTab);
                                setShowNotifications(false);
                              }}
                              className="text-[11px] font-bold underline cursor-pointer text-slate-800 hover:text-emerald-700"
                            >
                              عرض التفاصيل والتسديد ←
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Tabs Horizontal Navigation */}
        <div className="hidden md:flex items-center gap-1 border-t border-slate-100 py-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
