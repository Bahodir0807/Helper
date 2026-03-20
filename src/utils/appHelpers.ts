import RNFS from 'react-native-fs';
import {
  copy,
  DailyPoint,
  Language,
  MonthBucket,
  PersistedFinanceState,
  PersistedSettings,
  ThemeId,
  themes,
  toMonthId,
} from '../appConfig';

const financeStatePath = `${RNFS.DocumentDirectoryPath}/helper-finance-state.json`;
const settingsPath = `${RNFS.DocumentDirectoryPath}/helper-settings.json`;

export {financeStatePath, settingsPath};

export async function hydrateFinance(
  setMonths: React.Dispatch<React.SetStateAction<MonthBucket[]>>,
  setActiveMonthId: React.Dispatch<React.SetStateAction<string>>,
  setHydrated: React.Dispatch<React.SetStateAction<boolean>>,
) {
  try {
    if (!(await RNFS.exists(financeStatePath))) {
      return;
    }
    const parsed = JSON.parse(
      await RNFS.readFile(financeStatePath, 'utf8'),
    ) as PersistedFinanceState;
    if (Array.isArray(parsed.months) && parsed.months.length > 0) {
      setMonths(parsed.months);
      setActiveMonthId(parsed.activeMonthId);
    }
  } catch {
  } finally {
    setHydrated(true);
  }
}

export async function hydrateSettings(
  setLanguage: React.Dispatch<React.SetStateAction<Language>>,
  setThemeId: React.Dispatch<React.SetStateAction<ThemeId>>,
  setHydrated: React.Dispatch<React.SetStateAction<boolean>>,
) {
  try {
    if (!(await RNFS.exists(settingsPath))) {
      return;
    }
    const parsed = JSON.parse(
      await RNFS.readFile(settingsPath, 'utf8'),
    ) as PersistedSettings;
    if (parsed.language && copy[parsed.language]) {
      setLanguage(parsed.language);
    }
    if (parsed.themeId && themes[parsed.themeId]) {
      setThemeId(parsed.themeId);
    }
  } catch {
  } finally {
    setHydrated(true);
  }
}

export function buildDailyData(entries: MonthBucket['entries']) {
  const grouped = entries.reduce<Record<string, DailyPoint>>((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = {date: entry.date, expense: 0, income: 0, net: 0};
    }
    if (entry.type === 'expense') {
      acc[entry.date].expense += entry.amount;
      acc[entry.date].net -= entry.amount;
    } else {
      acc[entry.date].income += entry.amount;
      acc[entry.date].net += entry.amount;
    }
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-10);
}

export function parseAmount(value: string) {
  const parsed = Number(value.replace(/\s/g, '').replace(/,/g, '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMonthTitle(monthId: string, locale: string) {
  const [year, month] = monthId.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {month: 'long', year: 'numeric'}).format(
    new Date(year, month - 1, 1),
  );
}

export function formatDate(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
}

export function formatShortDay(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value.slice(5)
    : new Intl.DateTimeFormat(locale, {day: '2-digit', month: 'short'}).format(
        date,
      );
}

export function incrementMonthId(monthId: string) {
  const [year, month] = monthId.split('-').map(Number);
  return toMonthId(new Date(year, month, 1));
}

export function isOperator(value: string) {
  return ['/', '*', '-', '+'].includes(value);
}

export function evaluateExpression(expressionValue: string) {
  const tokens = expressionValue.match(/\d+(?:\.\d+)?|[()+\-*/]/g);
  if (!tokens) {
    throw new Error('Invalid expression');
  }

  const values: number[] = [];
  const operators: string[] = [];

  const applyTopOperator = () => {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    if (!operator || left === undefined || right === undefined) {
      throw new Error('Invalid operator state');
    }
    if (operator === '+') {
      values.push(left + right);
    } else if (operator === '-') {
      values.push(left - right);
    } else if (operator === '*') {
      values.push(left * right);
    } else {
      if (right === 0) {
        throw new Error('Division by zero');
      }
      values.push(left / right);
    }
  };

  tokens.forEach(token => {
    if (/^\d/.test(token)) {
      values.push(Number(token));
      return;
    }
    if (token === '(') {
      operators.push(token);
      return;
    }
    if (token === ')') {
      while (operators[operators.length - 1] !== '(') {
        applyTopOperator();
      }
      operators.pop();
      return;
    }
    while (
      operators.length > 0 &&
      precedence(operators[operators.length - 1]) >= precedence(token)
    ) {
      applyTopOperator();
    }
    operators.push(token);
  });

  while (operators.length > 0) {
    applyTopOperator();
  }

  if (values.length !== 1 || !Number.isFinite(values[0])) {
    throw new Error('Invalid result');
  }
  return values[0];
}

function precedence(operator: string) {
  if (operator === '+' || operator === '-') {
    return 1;
  }
  if (operator === '*' || operator === '/') {
    return 2;
  }
  return 0;
}

export async function saveFile(
  baseName: string,
  extension: 'png' | 'svg',
  content: string,
  encoding: 'base64' | 'utf8',
) {
  const filePath = `${RNFS.DownloadDirectoryPath}/${baseName}-${Date.now()}.${extension}`;
  await RNFS.writeFile(filePath, content, encoding);
  if (encoding === 'base64') {
    await RNFS.scanFile(filePath);
  }
  return filePath;
}

export function createCode39Svg(rawValue: string, darkColor: string) {
  const fallback = 'HELPER';
  const normalized = rawValue
    .toUpperCase()
    .replace(/[^0-9A-Z\-.\s$\/+%]/g, '')
    .trim();
  const value = `*${normalized || fallback}*`;
  const pattern = value
    .split('')
    .map(char => CODE39_PATTERNS[char] ?? CODE39_PATTERNS['*'])
    .join('0');

  let cursor = 16;
  const bars = pattern
    .split('')
    .map(bit => {
      const width = bit === '1' ? 6 : 2.4;
      const rect =
        bit === '1'
          ? `<rect x="${cursor}" y="16" width="${width}" height="104" rx="1.2" fill="${darkColor}" />`
          : '';
      cursor += width + 1.8;
      return rect;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cursor + 16} 152">
    <rect width="100%" height="100%" fill="#ffffff" rx="18" />
    ${bars}
    <text x="50%" y="142" text-anchor="middle" font-family="monospace" font-size="18" fill="${darkColor}">${escapeXml(
      rawValue || fallback,
    )}</text>
  </svg>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const CODE39_PATTERNS: Record<string, string> = {
  '0': '101001101101',
  '1': '110100101011',
  '2': '101100101011',
  '3': '110110010101',
  '4': '101001101011',
  '5': '110100110101',
  '6': '101100110101',
  '7': '101001011011',
  '8': '110100101101',
  '9': '101100101101',
  A: '110101001011',
  B: '101101001011',
  C: '110110100101',
  D: '101011001011',
  E: '110101100101',
  F: '101101100101',
  G: '101010011011',
  H: '110101001101',
  I: '101101001101',
  J: '101011001101',
  K: '110101010011',
  L: '101101010011',
  M: '110110101001',
  N: '101011010011',
  O: '110101101001',
  P: '101101101001',
  Q: '101010110011',
  R: '110101011001',
  S: '101101011001',
  T: '101011011001',
  U: '110010101011',
  V: '100110101011',
  W: '110011010101',
  X: '100101101011',
  Y: '110010110101',
  Z: '100110110101',
  '-': '100101011011',
  '.': '110010101101',
  ' ': '100110101101',
  '$': '100100100101',
  '/': '100100101001',
  '+': '100101001001',
  '%': '101001001001',
  '*': '100101101101',
};
