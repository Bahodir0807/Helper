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
  startingBalance: string;
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
  screens: Record<Screen, {title: string; subtitle: string}>;
  menuLabel: string;
  language: string;
  theme: string;
  months: string;
  nextMonth: string;
  startingBalance: string;
  startingBalancePlaceholder: string;
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
  calculator: string;
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
  hero: Record<Screen, {label: string; title: string; text: string}>;
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
      finance: {title: 'Финансы', subtitle: 'Доходы, расходы и месяцы'},
      calculator: {title: 'Калькулятор', subtitle: 'Быстрые расчеты отдельно от учета'},
      codes: {title: 'QR и штрихкоды', subtitle: 'Генерация и сохранение кодов'},
    },
    menuLabel: 'Разделы',
    language: 'Язык',
    theme: 'Тема',
    months: 'Месяцы',
    nextMonth: 'Следующий месяц',
    startingBalance: 'Стартовый баланс месяца',
    startingBalancePlaceholder: 'Например, 100000',
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
    calculator: 'Калькулятор',
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
    hero: {
      finance: {
        label: 'ФИНАНСОВЫЙ ЖУРНАЛ',
        title: 'Личный учет по месяцам без перегруза и лишних экранов.',
        text: 'Фиксируй расходы и доходы, контролируй остаток и открывай следующий месяц одним касанием.',
      },
      calculator: {
        label: 'КАЛЬКУЛЯТОР',
        title: 'Отдельная зона для черновых расчетов.',
        text: 'Считай быстро и не смешивай промежуточные вычисления с финансовыми записями.',
      },
      codes: {
        label: 'QR И ШТРИХКОДЫ',
        title: 'Генератор кодов в том же приложении, без лишних переходов.',
        text: 'Введи текст или ссылку, сгенерируй QR или Code39 и сразу сохрани файл на устройство.',
      },
    },
    incomeEntry: 'доход',
    expenseEntry: 'расход',
  },
  en: {
    locale: 'en-US',
    appName: 'Helper',
    screens: {
      finance: {title: 'Finance', subtitle: 'Income, expenses, and monthly tracking'},
      calculator: {title: 'Calculator', subtitle: 'Quick calculations outside your ledger'},
      codes: {title: 'QR & barcodes', subtitle: 'Create and save codes'},
    },
    menuLabel: 'Sections',
    language: 'Language',
    theme: 'Theme',
    months: 'Months',
    nextMonth: 'Next month',
    startingBalance: 'Starting balance',
    startingBalancePlaceholder: 'For example, 100000',
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
    calculator: 'Calculator',
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
    hero: {
      finance: {
        label: 'MONEY LOG',
        title: 'Monthly budgeting without clutter or throwaway screens.',
        text: 'Track expenses and income, keep your balance visible, and roll into the next month in one tap.',
      },
      calculator: {
        label: 'CALCULATOR',
        title: 'A separate workspace for quick math.',
        text: 'Use it for rough calculations without mixing temporary values into your finance records.',
      },
      codes: {
        label: 'QR & BARCODES',
        title: 'Code generation built into the app, no extra flow needed.',
        text: 'Enter text or a link, generate a QR or Code39 barcode, and save the file directly to your device.',
      },
    },
    incomeEntry: 'income',
    expenseEntry: 'expense',
  },
  uz: {
    locale: 'uz-UZ',
    appName: 'Helper',
    screens: {
      finance: {title: 'Moliya', subtitle: 'Daromad, xarajat va oylar kesimi'},
      calculator: {title: 'Kalkulyator', subtitle: "Hisob-kitoblar alohida oynada"},
      codes: {title: 'QR va shtrixkod', subtitle: 'Kod yaratish va saqlash'},
    },
    menuLabel: "Bo'limlar",
    language: 'Til',
    theme: 'Mavzu',
    months: 'Oylar',
    nextMonth: 'Keyingi oy',
    startingBalance: "Oyning boshlang'ich balansi",
    startingBalancePlaceholder: 'Masalan, 100000',
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
    calculator: 'Kalkulyator',
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
    hero: {
      finance: {
        label: 'MOLIYA JURNALI',
        title: "Oyma-oy hisobni ortiqcha bezaksiz yuritish uchun qulay panel.",
        text: "Xarajat va daromadlarni yozib boring, qoldiqni kuzating va keyingi oyga bir tegishda o'ting.",
      },
      calculator: {
        label: 'KALKULYATOR',
        title: 'Tez hisob-kitoblar uchun alohida maydon.',
        text: 'Oraliq hisoblarni moliyaviy yozuvlar bilan aralashtirmasdan ishlatish mumkin.',
      },
      codes: {
        label: 'QR VA SHTRIXKOD',
        title: "Kod yaratish shu ilovaning o'zida, ortiqcha o'tishlarsiz.",
        text: 'Matn yoki havolani kiriting, QR yoki Code39 yarating va faylni qurilmaga darhol saqlang.',
      },
    },
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
    startingBalance: '100000',
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
