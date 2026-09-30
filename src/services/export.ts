import { Income, Expense, DailyRequirement, MonthlyRequirement } from '../types';

/**
 * Download a string as a file in the browser
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV field to handle quotes, commas, and newlines
 */
function escapeCsv(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Financial Transactions to CSV (Opens smoothly in Excel with Arabic UTF-8 BOM)
 */
export function exportTransactionsToCsv(
  items: Array<{
    date: string;
    type: 'دخل' | 'مصروف';
    title: string;
    categoryOrSource: string;
    amount: number;
    paymentMethod: string;
    description: string;
    hasReceipt: boolean;
  }>,
  filename = 'financial-transactions.csv'
) {
  // UTF-8 BOM is required for Excel to read Arabic correctly
  const BOM = '\uFEFF';
  const headers = ['التاريخ', 'النوع', 'البيان', 'التصنيف / المصدر', 'المبلغ', 'طريقة الدفع / الاستلام', 'الملاحظات', 'يوجد إثبات'];
  
  const rows = items.map((i) => [
    escapeCsv(i.date),
    escapeCsv(i.type),
    escapeCsv(i.title),
    escapeCsv(i.categoryOrSource),
    escapeCsv(i.amount),
    escapeCsv(i.paymentMethod),
    escapeCsv(i.description),
    escapeCsv(i.hasReceipt ? 'نعم' : 'لا'),
  ].join(','));

  const csvContent = BOM + [headers.join(','), ...rows].join('\r\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export Incomes to CSV
 */
export function exportIncomesToCsv(incomes: Income[], filename = 'incomes.csv') {
  const items = incomes.map((inc) => ({
    date: inc.date,
    type: 'دخل' as const,
    title: inc.source,
    categoryOrSource: inc.type,
    amount: inc.amount,
    paymentMethod: inc.paymentMethod,
    description: inc.description,
    hasReceipt: !!inc.receiptImage,
  }));
  exportTransactionsToCsv(items, filename);
}

/**
 * Export Expenses to CSV
 */
export function exportExpensesToCsv(expenses: Expense[], filename = 'expenses.csv') {
  const items = expenses.map((exp) => ({
    date: exp.date,
    type: 'مصروف' as const,
    title: exp.title,
    categoryOrSource: exp.category,
    amount: exp.amount,
    paymentMethod: exp.paymentMethod,
    description: exp.description,
    hasReceipt: !!exp.receiptImage,
  }));
  exportTransactionsToCsv(items, filename);
}

/**
 * Export Requirements to CSV
 */
export function exportRequirementsToCsv(
  daily: DailyRequirement[],
  monthly: MonthlyRequirement[],
  filename = 'requirements.csv'
) {
  const BOM = '\uFEFF';
  const headers = ['النوع', 'اسم المتطلب', 'التاريخ / الشهر', 'المبلغ المتوقع', 'المبلغ الفعلي', 'الأولوية', 'الحالة', 'ملاحظات'];
  
  const dailyRows = daily.map((d) => [
    escapeCsv('متطلب يومي'),
    escapeCsv(d.name),
    escapeCsv(d.date),
    escapeCsv(d.expectedPrice * d.quantity),
    escapeCsv(d.actualPrice || 0),
    escapeCsv(d.priority),
    escapeCsv(d.status),
    escapeCsv(d.notes || ''),
  ].join(','));

  const monthlyRows = monthly.map((m) => [
    escapeCsv('متطلب شهري'),
    escapeCsv(m.name),
    escapeCsv(m.dueDate || m.month),
    escapeCsv(m.expectedAmount),
    escapeCsv(m.actualAmount || 0),
    escapeCsv(m.priority),
    escapeCsv(m.status),
    escapeCsv(m.notes || ''),
  ].join(','));

  const csvContent = BOM + [headers.join(','), ...dailyRows, ...monthlyRows].join('\r\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Generate a printable HTML document ready for "Save as PDF" or Print
 */
export function openPrintableReport({
  title,
  subtitle,
  currency,
  stats,
  tables,
}: {
  title: string;
  subtitle: string;
  currency: string;
  stats: Array<{ label: string; value: string | number; color?: string }>;
  tables: Array<{
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بفتح النوافذ المنبثقة لطباعة التقرير أو حفظه كـ PDF');
    return;
  }

  const statsHtml = stats
    .map(
      (s) => `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; flex: 1; min-width: 140px;">
        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">${s.label}</div>
        <div style="font-size: 20px; font-weight: bold; color: ${s.color || '#0f172a'};">${s.value} ${currency}</div>
      </div>
    `
    )
    .join('');

  const tablesHtml = tables
    .map(
      (t) => `
      <div style="margin-top: 24px;">
        <h3 style="font-size: 16px; margin-bottom: 12px; color: #1e293b; border-bottom: 2px solid #059669; padding-bottom: 6px; display: inline-block;">${t.title}</h3>
        <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 13px;">
          <thead>
            <tr style="background: #f1f5f9; color: #334155;">
              ${t.headers.map((h) => `<th style="padding: 10px; border: 1px solid #cbd5e1;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${
              t.rows.length === 0
                ? `<tr><td colspan="${t.headers.length}" style="text-align: center; padding: 20px; color: #94a3b8;">لا توجد بيانات مسجلة في هذا التقرير</td></tr>`
                : t.rows
                    .map(
                      (row, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border: 1px solid #e2e8f0;">
                ${row.map((cell) => `<td style="padding: 9px; border: 1px solid #e2e8f0;">${cell}</td>`).join('')}
              </tr>
            `
                    )
                    .join('')
            }
          </tbody>
        </table>
      </div>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Cairo', system-ui, sans-serif;
          margin: 30px;
          color: #0f172a;
          direction: rtl;
        }
        @media print {
          .no-print { display: none; }
          body { margin: 15mm; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px 18px; border-radius: 8px;">
        <span style="color: #065f46; font-weight: 600;">يمكنك طباعة هذا التقرير أو حفظه كملف PDF بسهولة.</span>
        <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 8px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-family: inherit;">
          🖨️ طباعة / حفظ كـ PDF
        </button>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <h1 style="margin: 0; font-size: 24px; color: #047857;">مدير مصروفاتي</h1>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">تطبيق إدارة الدخل والمصروفات والمتطلبات</p>
        </div>
        <div style="text-align: left;">
          <h2 style="margin: 0; font-size: 18px; color: #0f172a;">${title}</h2>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 12px;">${subtitle} | تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</p>
        </div>
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
        ${statsHtml}
      </div>

      ${tablesHtml}

      <div style="margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
        تم إصدار هذا التقرير آلياً عبر تطبيق "مدير مصروفاتي"
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
