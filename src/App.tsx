/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/navigation/Navbar';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { ImageModal } from './components/common/ImageModal';

// Modals
import { IncomeModal } from './components/income/IncomeModal';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { DailyRequirementModal } from './components/dailyRequirements/DailyRequirementModal';
import { MonthlyRequirementModal } from './components/monthlyRequirements/MonthlyRequirementModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { IncomeView } from './components/income/IncomeView';
import { ExpenseView } from './components/expenses/ExpenseView';
import { DailyRequirementsView } from './components/dailyRequirements/DailyRequirementsView';
import { MonthlyRequirementsView } from './components/monthlyRequirements/MonthlyRequirementsView';
import { TransactionsLedgerView } from './components/transactions/TransactionsLedgerView';
import { BudgetView } from './components/budget/BudgetView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

import { Income, Expense, DailyRequirement, MonthlyRequirement } from './types';

const MainContent: React.FC = () => {
  const { activeTab, loading } = useApp();

  // Modal open states
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDailyReqModalOpen, setIsDailyReqModalOpen] = useState(false);
  const [isMonthlyReqModalOpen, setIsMonthlyReqModalOpen] = useState(false);

  // Edit targets
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [dailyReqToEdit, setDailyReqToEdit] = useState<DailyRequirement | null>(null);
  const [monthlyReqToEdit, setMonthlyReqToEdit] = useState<MonthlyRequirement | null>(null);

  // Handlers for Add
  const handleOpenAddIncome = () => {
    setIncomeToEdit(null);
    setIsIncomeModalOpen(true);
  };

  const handleOpenAddExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenAddDailyReq = () => {
    setDailyReqToEdit(null);
    setIsDailyReqModalOpen(true);
  };

  const handleOpenAddMonthlyReq = () => {
    setMonthlyReqToEdit(null);
    setIsMonthlyReqModalOpen(true);
  };

  // Handlers for Edit
  const handleEditIncome = (income: Income) => {
    setIncomeToEdit(income);
    setIsIncomeModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handleEditDailyReq = (req: DailyRequirement) => {
    setDailyReqToEdit(req);
    setIsDailyReqModalOpen(true);
  };

  const handleEditMonthlyReq = (req: MonthlyRequirement) => {
    setMonthlyReqToEdit(req);
    setIsMonthlyReqModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-700">جاري تحميل بيانات مدير مصروفاتي...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-8">
      {/* Top Header & Navbar */}
      <Navbar
        onOpenIncomeModal={handleOpenAddIncome}
        onOpenExpenseModal={handleOpenAddExpense}
        onOpenDailyReqModal={handleOpenAddDailyReq}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenIncomeModal={handleOpenAddIncome}
            onOpenExpenseModal={handleOpenAddExpense}
            onOpenDailyReqModal={handleOpenAddDailyReq}
            onEditIncome={handleEditIncome}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'income' && (
          <IncomeView
            onOpenIncomeModal={handleOpenAddIncome}
            onEditIncome={handleEditIncome}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseView
            onOpenExpenseModal={handleOpenAddExpense}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'daily-req' && (
          <DailyRequirementsView
            onOpenModal={handleOpenAddDailyReq}
            onEdit={handleEditDailyReq}
          />
        )}

        {activeTab === 'monthly-req' && (
          <MonthlyRequirementsView
            onOpenModal={handleOpenAddMonthlyReq}
            onEdit={handleEditMonthlyReq}
          />
        )}

        {activeTab === 'ledger' && (
          <TransactionsLedgerView
            onEditIncome={handleEditIncome}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'budget' && <BudgetView />}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white/80 backdrop-blur-xs text-center text-xs text-slate-600 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span>تصميم وتنفيذ</span>
            <span className="text-slate-900 font-bold">أحمد همام</span>
            <span>:</span>
            <a
              href="tel:01205132328"
              className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
              dir="ltr"
            >
              01205132328
            </a>
          </div>

          <span className="hidden sm:inline text-slate-300 font-bold">|</span>

          <div className="flex items-center gap-1.5">
            <a
              href="https://www.facebook.com/profile.php?id=61582844093225"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors inline-flex items-center gap-1"
              title="زيارة صفحة فكرة للتطبيقات على فيسبوك"
            >
              <span>فكرة للتطبيقات</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Modals */}
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false);
          setIncomeToEdit(null);
        }}
        incomeToEdit={incomeToEdit}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
      />

      <DailyRequirementModal
        isOpen={isDailyReqModalOpen}
        onClose={() => {
          setIsDailyReqModalOpen(false);
          setDailyReqToEdit(null);
        }}
        reqToEdit={dailyReqToEdit}
      />

      <MonthlyRequirementModal
        isOpen={isMonthlyReqModalOpen}
        onClose={() => {
          setIsMonthlyReqModalOpen(false);
          setMonthlyReqToEdit(null);
        }}
        reqToEdit={monthlyReqToEdit}
      />

      {/* Full screen zoomable image/receipt viewer */}
      <ImageModal />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
