import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarCheck,
  Menu,
  X,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  Settings,
  CalendarDays,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as ActiveTab, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'income' as ActiveTab, label: 'الدخل', icon: ArrowDownLeft },
    { id: 'expenses' as ActiveTab, label: 'المصروف', icon: ArrowUpRight },
    { id: 'daily-req' as ActiveTab, label: 'اليومي', icon: CalendarCheck },
  ];

  const moreTabs = [
    { id: 'monthly-req' as ActiveTab, label: 'المتطلبات الشهرية', icon: CalendarDays },
    { id: 'ledger' as ActiveTab, label: 'سجل العمليات الشامل', icon: FileSpreadsheet },
    { id: 'budget' as ActiveTab, label: 'الميزانية الشهرية', icon: PieChart },
    { id: 'reports' as ActiveTab, label: 'التقارير والإحصائيات', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'الإعدادات والبيانات', icon: Settings },
  ];

  const isMoreActive = moreTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* "More" Drawer for Mobile */}
      {showMoreMenu && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-5 border-t border-slate-200 shadow-2xl space-y-2 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-extrabold text-slate-800 text-sm">أقسام إضافية</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav aria-label="شريط التنقل السفلي" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 md:hidden shadow-lg mobile-bottom-nav">
        <div className="flex items-center justify-around">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-emerald-100 text-emerald-700 scale-105' : 'hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              isMoreActive ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isMoreActive ? 'bg-emerald-100 text-emerald-700 scale-105' : 'hover:bg-slate-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5">المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
};
