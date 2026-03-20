export type EntryType = 'expense' | 'income';
export type Screen = 'finance' | 'calculator' | 'codes';
export type Language = 'ru' | 'en' | 'uz';
export type ThemeId = 'atelier' | 'night' | 'grove';

export type Entry = {
  id: string;
  title: string;
  amount: number;
  type: EntryType;
  date: string;
};

export type MonthBucket = {
  id: string;
  entries: Entry[];
};

export type DailyPoint = {
  date: string;
  expense: number;
  income: number;
  net: number;
};

export type PersistedFinanceState = {
  activeMonthId: string;
  months: MonthBucket[];
};

export type PersistedSettings = {
  language: Language;
  themeId: ThemeId;
};

export type ThemePalette = {
  background: string;
  backgroundSecondary: string;
  panel: string;
  panelAlt: string;
  line: string;
  text: string;
  textMuted: string;
  hero: string;
  heroSecondary: string;
  heroText: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentText: string;
  expense: string;
  income: string;
  shadow: string;
  codeDark: string;
};

export type Copy = {
  locale: string;
  appName: string;
  screens: Record<Screen, {title: string}>;
  menuLabel: string;
  language: string;
  theme: string;
  months: string;
  nextMonth: string;
  currentBalance: string;
  expenses: string;
  income: string;
  addEntry: string;
  expenseChip: string;
  incomeChip: string;
  entryTitlePlaceholder: string;
  amountPlaceholder: string;
  datePlaceholder: string;
  saveEntry: string;
  dailyChart: string;
  chartLegend: string;
  noChartData: string;
  history: string;
  historyEmpty: string;
  delete: string;
  calculate: string;
  calcError: string;
  qrCode: string;
  qrPlaceholder: string;
  qrEmpty: string;
  downloadQr: string;
  barcode: string;
  barcodePlaceholder: string;
  downloadBarcode: string;
  lastSavedFile: string;
  reviewEntryTitle: string;
  reviewEntryMessage: string;
  qrSaved: string;
  qrSaveErrorMessage: string;
  barcodeSaved: string;
  barcodeSaveErrorMessage: string;
  incomeEntry: string;
  expenseEntry: string;
};

export const calculatorKeys = [
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', '.', 'C', '+'],
] as const;

export const copy: Record<Language, Copy> = {
  ru: {
    locale: 'ru-RU',
    appName: 'Helper',
    screens: {
      finance: {title: 'Финансы'},
      calculator: {title: 'Калькулятор'},
      codes: {title: 'QR и штрихкоды'},
    },
    menuLabel: 'Разделы',
    language: 'Язык',
    theme: 'Тема',
    months: 'Месяцы',
    nextMonth: 'Следующий месяц',
    currentBalance: 'Текущий баланс',
    expenses: 'Расходы',
    income: 'Доходы',
    addEntry: 'Новая запись',
    expenseChip: 'Расход',
    incomeChip: 'Доход',
    entryTitlePlaceholder: 'Что было куплено или получено?',
    amountPlaceholder: 'Сумма',
    datePlaceholder: 'ГГГГ-ММ-ДД',
    saveEntry: 'Сохранить запись',
    dailyChart: 'Динамика по дням',
    chartLegend: 'Терракота = расход, зелёный = доход',
    noChartData: 'За этот месяц пока нет данных.',
    history: 'История',
    historyEmpty: 'Записей пока нет.',
    delete: 'Удалить',
    calculate: 'Посчитать',
    calcError: 'Ошибка',
    qrCode: 'QR-код',
    qrPlaceholder: 'Текст или ссылка для QR',
    qrEmpty: 'Введите текст для генерации QR-кода.',
    downloadQr: 'Скачать QR-код',
    barcode: 'Штрихкод',
    barcodePlaceholder: 'Текст для штрихкода',
    downloadBarcode: 'Скачать штрихкод',
    lastSavedFile: 'Последний сохраненный файл',
    reviewEntryTitle: 'Проверь запись',
    reviewEntryMessage: 'Нужно указать название и сумму больше нуля.',
    qrSaved: 'QR-код сохранен',
    qrSaveErrorMessage: 'Не удалось сохранить QR-код.',
    barcodeSaved: 'Штрихкод сохранен',
    barcodeSaveErrorMessage: 'Не удалось сохранить штрихкод.',
    incomeEntry: 'доход',
    expenseEntry: 'расход',
  },
  en: {
    locale: 'en-US',
    appName: 'Helper',
    screens: {
      finance: {title: 'Finance'},
      calculator: {title: 'Calculator'},
      codes: {title: 'QR & barcodes'},
    },
    menuLabel: 'Sections',
    language: 'Language',
    theme: 'Theme',
    months: 'Months',
    nextMonth: 'Next month',
    currentBalance: 'Current balance',
    expenses: 'Expenses',
    income: 'Income',
    addEntry: 'New entry',
    expenseChip: 'Expense',
    incomeChip: 'Income',
    entryTitlePlaceholder: 'What did you pay for or receive?',
    amountPlaceholder: 'Amount',
    datePlaceholder: 'YYYY-MM-DD',
    saveEntry: 'Save entry',
    dailyChart: 'Daily movement',
    chartLegend: 'Terracotta = expense, green = income',
    noChartData: 'No data for this month yet.',
    history: 'History',
    historyEmpty: 'No entries yet.',
    delete: 'Delete',
    calculate: 'Calculate',
    calcError: 'Error',
    qrCode: 'QR code',
    qrPlaceholder: 'Text or URL for QR',
    qrEmpty: 'Enter text to generate a QR code.',
    downloadQr: 'Download QR code',
    barcode: 'Barcode',
    barcodePlaceholder: 'Text for the barcode',
    downloadBarcode: 'Download barcode',
    lastSavedFile: 'Last saved file',
    reviewEntryTitle: 'Check the entry',
    reviewEntryMessage: 'Enter a title and an amount greater than zero.',
    qrSaved: 'QR code saved',
    qrSaveErrorMessage: 'Could not save the QR code.',
    barcodeSaved: 'Barcode saved',
    barcodeSaveErrorMessage: 'Could not save the barcode.',
    incomeEntry: 'income',
    expenseEntry: 'expense',
  },
  uz: {
    locale: 'uz-UZ',
    appName: 'Helper',
    screens: {
      finance: {title: 'Moliya'},
      calculator: {title: 'Kalkulyator'},
      codes: {title: 'QR va shtrixkod'},
    },
    menuLabel: "Bo'limlar",
    language: 'Til',
    theme: 'Mavzu',
    months: 'Oylar',
    nextMonth: 'Keyingi oy',
    currentBalance: 'Joriy balans',
    expenses: 'Xarajatlar',
    income: 'Daromadlar',
    addEntry: 'Yangi yozuv',
    expenseChip: 'Xarajat',
    incomeChip: 'Daromad',
    entryTitlePlaceholder: 'Nima sotib olindi yoki qabul qilindi?',
    amountPlaceholder: 'Summa',
    datePlaceholder: 'YYYY-MM-DD',
    saveEntry: 'Yozuvni saqlash',
    dailyChart: "Kunlik o'zgarish",
    chartLegend: 'Terrakota = xarajat, yashil = daromad',
    noChartData: "Bu oy uchun hali ma'lumot yo'q.",
    history: 'Tarix',
    historyEmpty: "Hali yozuvlar yo'q.",
    delete: "O'chirish",
    calculate: 'Hisoblash',
    calcError: 'Xato',
    qrCode: 'QR-kod',
    qrPlaceholder: 'QR uchun matn yoki havola',
    qrEmpty: 'QR-kod yaratish uchun matn kiriting.',
    downloadQr: 'QR-kodni yuklab olish',
    barcode: 'Shtrixkod',
    barcodePlaceholder: 'Shtrixkod uchun matn',
    downloadBarcode: 'Shtrixkodni yuklab olish',
    lastSavedFile: 'Oxirgi saqlangan fayl',
    reviewEntryTitle: 'Yozuvni tekshiring',
    reviewEntryMessage: 'Nomi va noldan katta summa kiritilishi kerak.',
    qrSaved: 'QR-kod saqlandi',
    qrSaveErrorMessage: 'QR-kodni saqlab bo‘lmadi.',
    barcodeSaved: 'Shtrixkod saqlandi',
    barcodeSaveErrorMessage: 'Shtrixkodni saqlab bo‘lmadi.',
    incomeEntry: 'daromad',
    expenseEntry: 'xarajat',
  },
};

export const themes: Record<ThemeId, ThemePalette> = {
  atelier: {
    background: '#f3ede2',
    backgroundSecondary: '#e7dccb',
    panel: '#fffaf2',
    panelAlt: '#f2e7d8',
    line: '#d5c2a9',
    text: '#35261a',
    textMuted: '#7c6553',
    hero: '#4a3427',
    heroSecondary: '#b96836',
    heroText: '#f8ede3',
    accent: '#c86b35',
    accentStrong: '#9e4e23',
    accentSoft: '#f1c9ad',
    accentText: '#fff8f2',
    expense: '#b44d33',
    income: '#426f49',
    shadow: 'rgba(93, 58, 31, 0.14)',
    codeDark: '#2a221d',
  },
  night: {
    background: '#111827',
    backgroundSecondary: '#1d293d',
    panel: '#192334',
    panelAlt: '#101827',
    line: '#314156',
    text: '#f3f4f6',
    textMuted: '#9ca9bc',
    hero: '#0b1220',
    heroSecondary: '#3182ce',
    heroText: '#dbeafe',
    accent: '#3b82f6',
    accentStrong: '#1d4ed8',
    accentSoft: '#1e3a5f',
    accentText: '#eff6ff',
    expense: '#fb7185',
    income: '#4ade80',
    shadow: 'rgba(2, 6, 23, 0.35)',
    codeDark: '#050b16',
  },
  grove: {
    background: '#e6efe7',
    backgroundSecondary: '#d1dfd1',
    panel: '#f6fbf4',
    panelAlt: '#eaf2e5',
    line: '#b6c7b0',
    text: '#213127',
    textMuted: '#607266',
    hero: '#1f3a2c',
    heroSecondary: '#7f9656',
    heroText: '#edf5ea',
    accent: '#567543',
    accentStrong: '#3d5531',
    accentSoft: '#d9e6cc',
    accentText: '#f3f8ef',
    expense: '#a04a3e',
    income: '#2f7d4a',
    shadow: 'rgba(38, 60, 43, 0.14)',
    codeDark: '#18271d',
  },
};

export const themeLabels: Record<ThemeId, Record<Language, string>> = {
  atelier: {ru: 'Ателье', en: 'Atelier', uz: 'Atelye'},
  night: {ru: 'Ночной', en: 'Night', uz: 'Tun'},
  grove: {ru: 'Роща', en: 'Grove', uz: "Bog'"},
};

export const today = new Date().toISOString().slice(0, 10);

export const initialMonths: MonthBucket[] = [
  {
    id: toMonthId(new Date()),
    entries: [
      {id: '1', title: 'Coffee', amount: 12000, type: 'expense', date: today},
      {id: '2', title: 'Lunch', amount: 45000, type: 'expense', date: today},
      {id: '3', title: 'Salary', amount: 250000, type: 'income', date: today},
    ],
  },
];

export function toMonthId(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
