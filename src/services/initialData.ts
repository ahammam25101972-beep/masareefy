import {
  Income,
  Expense,
  DailyRequirement,
  MonthlyRequirement,
  Budget,
} from '../types';

// Helper to get formatted dates
const now = new Date();
const pad = (n: number) => n.toString().padStart(2, '0');
const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const currentMonthStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

// Past dates for sample distribution
const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Generates a nice lightweight SVG receipt data URL
export function createSampleReceiptSvg(title: string, amount: string, date: string, type: 'فاتورة' | 'إيصال استلام'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" dir="rtl">
    <rect width="100%" height="100%" fill="#fafafa"/>
    <rect x="25" y="25" width="550" height="750" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="25" y1="120" x2="575" y2="120" stroke="#059669" stroke-width="6"/>
    
    <text x="300" y="70" font-family="sans-serif" font-size="24" font-weight="bold" fill="#0f172a" text-anchor="middle">مدير مصروفاتي - ${type}</text>
    <text x="300" y="100" font-family="sans-serif" font-size="14" fill="#64748b" text-anchor="middle">مستند مالي موثق رقم #${Math.floor(100000 + Math.random() * 900000)}</text>
    
    <rect x="50" y="150" width="500" height="90" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
    <text x="520" y="185" font-family="sans-serif" font-size="15" fill="#166534">المبلغ المالي:</text>
    <text x="300" y="215" font-family="sans-serif" font-size="28" font-weight="bold" fill="#15803d" text-anchor="middle">${amount} جنيه</text>
    
    <g transform="translate(60, 280)">
      <text x="470" y="25" font-family="sans-serif" font-size="16" font-weight="bold" fill="#334155">البيان / الوصف:</text>
      <text x="470" y="55" font-family="sans-serif" font-size="15" fill="#0f172a">${title}</text>
      
      <line x1="0" y1="80" x2="480" y2="80" stroke="#f1f5f9" stroke-width="2"/>
      
      <text x="470" y="115" font-family="sans-serif" font-size="16" font-weight="bold" fill="#334155">تاريخ العملية:</text>
      <text x="470" y="145" font-family="sans-serif" font-size="15" fill="#0f172a">${date}</text>
      
      <line x1="0" y1="170" x2="480" y2="170" stroke="#f1f5f9" stroke-width="2"/>
      
      <text x="470" y="205" font-family="sans-serif" font-size="16" font-weight="bold" fill="#334155">حالة التوثيق:</text>
      <text x="470" y="235" font-family="sans-serif" font-size="15" fill="#059669">✓ تم التحقق والتأكيد المالي</text>
    </g>
    
    <rect x="50" y="620" width="500" height="90" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-dasharray="4"/>
    <text x="300" y="660" font-family="sans-serif" font-size="13" fill="#64748b" text-anchor="middle">تم إصدار وحفظ هذه الوثيقة آلياً عبر تطبيق مدير مصروفاتي</text>
    <text x="300" y="685" font-family="sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">إيصال مالي إلكتروني للاستخدام الشخصي والمحاسبي</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const sampleIncomes: Income[] = [
  {
    id: 'inc-1',
    date: todayStr,
    time: '10:30',
    amount: 18500,
    source: 'راتب شهري',
    type: 'راتب أساسي',
    description: 'استلام راتب العمل لشركة التكنولوجيا',
    paymentMethod: 'تحويل بنكي',
    receiptImage: createSampleReceiptSvg('تحويل راتب شهر سبتمبر 2026', '18,500', todayStr, 'إيصال استلام'),
    receiptImageName: 'salary_receipt.svg',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'inc-2',
    date: getPastDateStr(2),
    time: '16:00',
    amount: 4500,
    source: 'عمل حر (Freelance)',
    type: 'أرباح مشاريع',
    description: 'دفعة تصميم وبرمجة متجر إلكتروني لعميل خارجي',
    paymentMethod: 'محفظة إلكترونية',
    receiptImage: createSampleReceiptSvg('دفعة عمل حر - متجر إلكتروني', '4,500', getPastDateStr(2), 'إيصال استلام'),
    receiptImageName: 'freelance_payment.svg',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'inc-3',
    date: getPastDateStr(6),
    time: '14:15',
    amount: 2200,
    source: 'استثمار ومبيعات',
    type: 'أرباح',
    description: 'أرباح أسهم وصندوق استثماري دوري',
    paymentMethod: 'تحويل بنكي',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 6,
  },
];

export const sampleExpenses: Expense[] = [
  {
    id: 'exp-1',
    date: todayStr,
    time: '12:45',
    amount: 650,
    title: 'مشتريات سوبرماركت ولحوم',
    category: 'طعام',
    description: 'شراء خضروات وفواكه ولحوم وأجبان للأسبوع',
    paymentMethod: 'بطاقة بنكية',
    receiptImage: createSampleReceiptSvg('فاتورة هايبرماركت للمواد الغذائية', '650', todayStr, 'فاتورة'),
    receiptImageName: 'grocery_bill.svg',
    createdAt: Date.now() - 3600000 * 3,
    updatedAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'exp-2',
    date: todayStr,
    time: '09:15',
    amount: 140,
    title: 'مواصلات ووقود سيارة',
    category: 'مواصلات',
    description: 'تزويد بنزين ومصاريف طريق',
    paymentMethod: 'نقدي',
    createdAt: Date.now() - 3600000 * 7,
    updatedAt: Date.now() - 3600000 * 7,
  },
  {
    id: 'exp-3',
    date: getPastDateStr(1),
    time: '18:20',
    amount: 580,
    title: 'فاتورة الكهرباء الشهرية',
    category: 'فواتير',
    description: 'سداد استهلاك الكهرباء والتكييف عن الشهر',
    paymentMethod: 'محفظة إلكترونية',
    receiptImage: createSampleReceiptSvg('سداد فاتورة الكهرباء', '580', getPastDateStr(1), 'فاتورة'),
    receiptImageName: 'electricity_bill.svg',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'exp-4',
    date: getPastDateStr(3),
    time: '11:10',
    amount: 320,
    title: 'صيدلية وأدوية ومستلزمات صحية',
    category: 'صحة',
    description: 'شراء فيتامينات ومسكنات وأدوية دورية',
    paymentMethod: 'نقدي',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'exp-5',
    date: getPastDateStr(4),
    time: '20:00',
    amount: 950,
    title: 'قسط أجهزة منزلية',
    category: 'أقساط',
    description: 'القسط الشهري للغسالة الجديدة',
    paymentMethod: 'تحويل بنكي',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'exp-6',
    date: getPastDateStr(5),
    time: '15:30',
    amount: 350,
    title: 'اشتراك الإنترنت المنزلي VDSL',
    category: 'فواتير',
    description: 'تجديد باقة الإنترنت غير المحدودة',
    paymentMethod: 'محفظة إلكترونية',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
];

export const sampleDailyRequirements: DailyRequirement[] = [
  {
    id: 'dreq-1',
    name: 'شراء خبز بلدي وتوست طازج',
    date: todayStr,
    quantity: 2,
    expectedPrice: 20,
    actualPrice: 25,
    totalCost: 25,
    priority: 'عالية',
    status: 'تم الشراء',
    notes: 'تم الشراء من المخبز الآلي صباحاً',
    createdAt: Date.now() - 3600000 * 6,
    updatedAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'dreq-2',
    name: 'شراء حليب طبيعي وجبن أبيض',
    date: todayStr,
    quantity: 1,
    expectedPrice: 85,
    actualPrice: 0,
    totalCost: 85,
    priority: 'عالية',
    status: 'مطلوب',
    notes: 'من السوبرماركت بعد العمل',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'dreq-3',
    name: 'شراء دواء ومسكن من الصيدلية',
    date: todayStr,
    quantity: 1,
    expectedPrice: 110,
    actualPrice: 0,
    totalCost: 110,
    priority: 'متوسطة',
    status: 'مطلوب',
    notes: 'كبسولات الصداع الموصوفة',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'dreq-4',
    name: 'شحن كارت الغاز الذكي',
    date: todayStr,
    quantity: 1,
    expectedPrice: 150,
    actualPrice: 0,
    totalCost: 150,
    priority: 'منخفضة',
    status: 'تم التأجيل',
    notes: 'تم تأجيله للغد لتوفر رصيد كافٍ حالياً',
    createdAt: Date.now() - 3600000 * 3,
    updatedAt: Date.now() - 3600000 * 3,
  },
];

export const sampleMonthlyRequirements: MonthlyRequirement[] = [
  {
    id: 'mreq-1',
    name: 'إيجار الشقة السكني',
    month: currentMonthStr,
    expectedAmount: 4200,
    actualAmount: 4200,
    dueDate: `${currentMonthStr}-05`,
    priority: 'عالية',
    status: 'تم الدفع',
    notes: 'تم تحويله للمالك مع الإيصال',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'mreq-2',
    name: 'فاتورة الكهرباء والتكييف',
    month: currentMonthStr,
    expectedAmount: 600,
    actualAmount: 580,
    dueDate: `${currentMonthStr}-15`,
    priority: 'عالية',
    status: 'تم الدفع',
    notes: 'سداد عبر محفظة فودافون كاش',
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 8,
  },
  {
    id: 'mreq-3',
    name: 'فاتورة الغاز والمياه',
    month: currentMonthStr,
    expectedAmount: 220,
    actualAmount: 0,
    dueDate: `${currentMonthStr}-28`,
    priority: 'متوسطة',
    status: 'مطلوب',
    notes: 'في انتظار المحصل الشهري',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'mreq-4',
    name: 'اشتراك الإنترنت فايبر المنزلي',
    month: currentMonthStr,
    expectedAmount: 350,
    actualAmount: 350,
    dueDate: `${currentMonthStr}-18`,
    priority: 'عالية',
    status: 'تم الدفع',
    notes: 'تم التجديد أونلاين',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'mreq-5',
    name: 'قسط الأجهزة المنزلية',
    month: currentMonthStr,
    expectedAmount: 950,
    actualAmount: 950,
    dueDate: `${currentMonthStr}-20`,
    priority: 'عالية',
    status: 'تم الدفع',
    notes: 'قسط البنك 8 من 12',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 6,
  },
  {
    id: 'mreq-6',
    name: 'مصاريف وباص المدارس',
    month: currentMonthStr,
    expectedAmount: 1800,
    actualAmount: 0,
    dueDate: `${currentMonthStr}-30`,
    priority: 'عالية',
    status: 'مطلوب',
    notes: 'الدفعة الأولى من الفصل الدراسي',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'mreq-7',
    name: 'شراء كرتونة التموين والمنظفات',
    month: currentMonthStr,
    expectedAmount: 1500,
    actualAmount: 1450,
    dueDate: `${currentMonthStr}-10`,
    priority: 'متوسطة',
    status: 'تم الشراء',
    notes: 'مستلزمات تموينية واستهلاكية للمطبخ',
    createdAt: Date.now() - 86400000 * 9,
    updatedAt: Date.now() - 86400000 * 9,
  },
];

export const sampleBudget: Budget = {
  month: currentMonthStr,
  expectedIncome: 25000,
  maxTotalExpense: 16000,
  categoryBudgets: {
    'طعام': 5000,
    'فواتير': 2000,
    'مواصلات': 1800,
    'منزل': 4500,
    'أقساط': 1500,
    'صحة': 1000,
    'ترفيه': 800,
    'مشتريات': 1500,
  },
};
