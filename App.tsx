import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import {SvgXml} from 'react-native-svg';
import QRCode from 'qrcode';

type EntryType = 'expense' | 'income';
type Screen = 'finance' | 'calculator' | 'codes';

type Entry = {
  id: string;
  title: string;
  amount: number;
  type: EntryType;
  date: string;
};

type MonthBucket = {
  id: string;
  title: string;
  startingBalance: string;
  entries: Entry[];
};

type DailyPoint = {
  date: string;
  expense: number;
  income: number;
  net: number;
};

const calculatorKeys = [
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', '.', 'C', '+'],
] as const;

const menuItems: {id: Screen; title: string; subtitle: string}[] = [
  {id: 'finance', title: 'Финансы', subtitle: 'Расходы, доходы и месяцы'},
  {id: 'calculator', title: 'Калькулятор', subtitle: 'Отдельное окно расчётов'},
  {id: 'codes', title: 'QR и штрихкоды', subtitle: 'Генерация и сохранение'},
];

const today = new Date().toISOString().slice(0, 10);
const initialMonthId = toMonthId(new Date());

const initialMonths: MonthBucket[] = [
  {
    id: initialMonthId,
    title: formatMonthTitle(initialMonthId),
    startingBalance: '100000',
    entries: [
      {id: '1', title: 'Кофе', amount: 12000, type: 'expense', date: today},
      {id: '2', title: 'Обед', amount: 45000, type: 'expense', date: today},
      {
        id: '3',
        title: 'Оплата за работу',
        amount: 250000,
        type: 'income',
        date: today,
      },
    ],
  },
];

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        <AppContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('finance');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarX = useRef(new Animated.Value(-320)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const [months, setMonths] = useState(initialMonths);
  const [activeMonthId, setActiveMonthId] = useState(initialMonthId);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryDate, setEntryDate] = useState(today);
  const [entryType, setEntryType] = useState<EntryType>('expense');

  const [expression, setExpression] = useState('0');
  const [calcResult, setCalcResult] = useState('0');

  const [qrValue, setQrValue] = useState('https://example.com');
  const [qrSvg, setQrSvg] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('HELPER-2026');
  const [lastSavedPath, setLastSavedPath] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(sidebarX, {
        toValue: sidebarOpen ? 0 : -320,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: sidebarOpen ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlayOpacity, sidebarOpen, sidebarX]);

  useEffect(() => {
    let cancelled = false;

    if (!qrValue.trim()) {
      setQrSvg('');
      return;
    }

    QRCode.toString(qrValue, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((svg: string) => {
        if (!cancelled) {
          setQrSvg(svg);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrSvg('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [qrValue]);

  const activeMonth = useMemo(() => {
    return months.find(item => item.id === activeMonthId) ?? months[0];
  }, [activeMonthId, months]);

  const totals = useMemo(() => {
    return activeMonth.entries.reduce(
      (acc, entry) => {
        if (entry.type === 'expense') {
          acc.expense += entry.amount;
        } else {
          acc.income += entry.amount;
        }
        return acc;
      },
      {expense: 0, income: 0},
    );
  }, [activeMonth.entries]);

  const startingBalanceValue = parseAmount(activeMonth.startingBalance);
  const currentBalance = startingBalanceValue + totals.income - totals.expense;

  const dailyData = useMemo<DailyPoint[]>(() => {
    const grouped = activeMonth.entries.reduce<Record<string, DailyPoint>>(
      (acc, entry) => {
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
      },
      {},
    );

    return Object.values(grouped)
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(-10);
  }, [activeMonth.entries]);

  const chartMax = useMemo(() => {
    const values = dailyData.flatMap(item => [item.expense, item.income]);
    return Math.max(...values, 1);
  }, [dailyData]);

  const barcodeSvg = useMemo(() => {
    return createCode39Svg(barcodeValue || 'HELPER');
  }, [barcodeValue]);

  const setMonthStartingBalance = (value: string) => {
    setMonths(current =>
      current.map(month =>
        month.id === activeMonth.id ? {...month, startingBalance: value} : month,
      ),
    );
  };

  const addEntry = () => {
    const title = entryTitle.trim();
    const amount = parseAmount(entryAmount);

    if (!title || amount <= 0) {
      Alert.alert('Проверь запись', 'Нужно указать название и сумму больше нуля.');
      return;
    }

    setMonths(current =>
      current.map(month =>
        month.id === activeMonth.id
          ? {
              ...month,
              entries: [
                {
                  id: String(Date.now()),
                  title,
                  amount,
                  type: entryType,
                  date: entryDate || firstDateOfMonth(month.id),
                },
                ...month.entries,
              ],
            }
          : month,
      ),
    );

    setEntryTitle('');
    setEntryAmount('');
  };

  const removeEntry = (entryId: string) => {
    setMonths(current =>
      current.map(month =>
        month.id === activeMonth.id
          ? {...month, entries: month.entries.filter(entry => entry.id !== entryId)}
          : month,
      ),
    );
  };

  const createNextMonth = () => {
    const nextMonthId = incrementMonthId(activeMonth.id);
    if (months.some(month => month.id === nextMonthId)) {
      setActiveMonthId(nextMonthId);
      return;
    }
    const nextMonth: MonthBucket = {
      id: nextMonthId,
      title: formatMonthTitle(nextMonthId),
      startingBalance: String(currentBalance),
      entries: [],
    };
    setMonths(current => [...current, nextMonth]);
    setActiveMonthId(nextMonthId);
    setEntryDate(firstDateOfMonth(nextMonthId));
  };

  const appendCalculatorValue = (value: string) => {
    if (value === 'C') {
      setExpression('0');
      setCalcResult('0');
      return;
    }
    setExpression(current => {
      if (current === '0' && value !== '.') {
        return value;
      }
      return `${current}${value}`;
    });
  };

  const runCalculation = () => {
    if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
      setCalcResult('Ошибка');
      return;
    }
    try {
      const value = evaluateExpression(expression);
      setCalcResult(formatNumberOnly(value));
    } catch {
      setCalcResult('Ошибка');
    }
  };

  const saveQrCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(qrValue, {margin: 1, width: 1200});
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      const filePath = await saveFile('qr-code', 'png', base64, 'base64');
      setLastSavedPath(filePath);
      Alert.alert('QR сохранён', filePath);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить QR-код.');
    }
  };

  const saveBarcode = async () => {
    try {
      const filePath = await saveFile('barcode', 'svg', barcodeSvg, 'utf8');
      setLastSavedPath(filePath);
      Alert.alert('Штрихкод сохранён', filePath);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить штрихкод.');
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable onPress={() => setSidebarOpen(true)} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>≡</Text>
        </Pressable>
        <View style={styles.topBarTextBlock}>
          <Text style={styles.topBarTitle}>{getScreenTitle(screen)}</Text>
          <Text style={styles.topBarSubtitle}>{getScreenSubtitle(screen)}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {screen === 'finance' ? (
          <View style={styles.screenBlock}>
            <View style={styles.hero}>
              <Text style={styles.heroLabel}>ФИНАНСОВЫЙ ПОМОЩНИК</Text>
              <Text style={styles.heroTitle}>
                Расходы и доходы по месяцам в отдельном окне.
              </Text>
              <Text style={styles.heroText}>
                Считай остаток автоматически, переходи между месяцами и сразу
                открывай следующий месяц.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Месяцы</Text>
                <Pressable onPress={createNextMonth} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Следующий месяц</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.monthRow}>
                  {months.map(month => {
                    const selected = month.id === activeMonth.id;

                    return (
                      <Pressable
                        key={month.id}
                        onPress={() => {
                          setActiveMonthId(month.id);
                          setEntryDate(firstDateOfMonth(month.id));
                        }}
                        style={[
                          styles.monthChip,
                          selected && styles.monthChipSelected,
                        ]}>
                        <Text
                          style={[
                            styles.monthChipText,
                            selected && styles.monthChipTextSelected,
                          ]}>
                          {month.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Начальная сумма месяца</Text>
              <TextInput
                value={activeMonth.startingBalance}
                onChangeText={setMonthStartingBalance}
                keyboardType="numeric"
                style={styles.input}
                placeholder="Например, 100000"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.summaryRow}>
              <MetricCard
                label="Текущий баланс"
                value={formatMoney(currentBalance)}
                accent={currentBalance >= 0 ? 'green' : 'red'}
              />
              <MetricCard
                label="Расходы"
                value={formatMoney(totals.expense)}
                accent="red"
              />
              <MetricCard
                label="Доходы"
                value={formatMoney(totals.income)}
                accent="green"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Добавить запись</Text>
              <View style={styles.typeRow}>
                <TypeChip
                  label="Расход"
                  selected={entryType === 'expense'}
                  onPress={() => setEntryType('expense')}
                />
                <TypeChip
                  label="Доход"
                  selected={entryType === 'income'}
                  onPress={() => setEntryType('income')}
                />
              </View>
              <TextInput
                value={entryTitle}
                onChangeText={setEntryTitle}
                style={styles.input}
                placeholder="Что купил или получил?"
                placeholderTextColor="#6B7280"
              />
              <TextInput
                value={entryAmount}
                onChangeText={setEntryAmount}
                keyboardType="numeric"
                style={styles.input}
                placeholder="Сумма"
                placeholderTextColor="#6B7280"
              />
              <TextInput
                value={entryDate}
                onChangeText={setEntryDate}
                style={styles.input}
                placeholder="ГГГГ-ММ-ДД"
                placeholderTextColor="#6B7280"
              />
              <Pressable onPress={addEntry} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Сохранить запись</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>График по дням</Text>
                <Text style={styles.legendText}>
                  Красный = расход, зелёный = доход
                </Text>
              </View>

              <View style={styles.chartCard}>
                {dailyData.length === 0 ? (
                  <Text style={styles.emptyText}>Пока нет данных за этот месяц.</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chartRow}>
                      {dailyData.map(point => (
                        <View key={point.date} style={styles.chartGroup}>
                          <View style={styles.barArea}>
                            <View
                              style={[
                                styles.bar,
                                styles.expenseBar,
                                {height: `${(point.expense / chartMax) * 100}%`},
                              ]}
                            />
                            <View
                              style={[
                                styles.bar,
                                styles.incomeBar,
                                {height: `${(point.income / chartMax) * 100}%`},
                              ]}
                            />
                          </View>
                          <Text style={styles.chartDate}>{point.date.slice(5)}</Text>
                          <Text
                            style={[
                              styles.netValue,
                              point.net >= 0
                                ? styles.positiveText
                                : styles.negativeText,
                            ]}>
                            {point.net >= 0 ? '+' : '-'}
                            {formatMoney(Math.abs(point.net))}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>История</Text>
              <View style={styles.historyList}>
                {activeMonth.entries.map(entry => (
                  <View key={entry.id} style={styles.historyItem}>
                    <View style={styles.historyTextBlock}>
                      <Text style={styles.historyTitle}>{entry.title}</Text>
                      <Text style={styles.historyMeta}>
                        {entry.date} · {entry.type === 'income' ? 'доход' : 'расход'}
                      </Text>
                    </View>
                    <View style={styles.historyActions}>
                      <Text
                        style={[
                          styles.historyAmount,
                          entry.type === 'income'
                            ? styles.positiveText
                            : styles.negativeText,
                        ]}>
                        {entry.type === 'income' ? '+' : '-'}
                        {formatMoney(entry.amount)}
                      </Text>
                      <Pressable onPress={() => removeEntry(entry.id)}>
                        <Text style={styles.deleteText}>Удалить</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}

                {activeMonth.entries.length === 0 ? (
                  <Text style={styles.emptyText}>Записей пока нет.</Text>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}

        {screen === 'calculator' ? (
          <View style={styles.screenBlock}>
            <View style={styles.hero}>
              <Text style={styles.heroLabel}>КАЛЬКУЛЯТОР</Text>
              <Text style={styles.heroTitle}>Отдельное окно для расчётов.</Text>
              <Text style={styles.heroText}>
                Считай отдельно от финансового трекера и не смешивай черновые
                вычисления с записями.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Калькулятор</Text>
              <View style={styles.calculatorDisplay}>
                <Text style={styles.expressionText}>{expression}</Text>
                <Text style={styles.resultText}>{calcResult}</Text>
              </View>
              <View style={styles.calculatorGrid}>
                {calculatorKeys.map(row => (
                  <View key={row.join('')} style={styles.calculatorRow}>
                    {row.map(key => (
                      <Pressable
                        key={key}
                        onPress={() => appendCalculatorValue(key)}
                        style={[
                          styles.calcButton,
                          key === 'C' && styles.clearButton,
                          isOperator(key) && styles.operatorButton,
                        ]}>
                        <Text style={styles.calcButtonText}>{key}</Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
                <Pressable onPress={runCalculation} style={styles.equalsButton}>
                  <Text style={styles.equalsButtonText}>Посчитать</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {screen === 'codes' ? (
          <View style={styles.screenBlock}>
            <View style={styles.hero}>
              <Text style={styles.heroLabel}>QR И ШТРИХКОДЫ</Text>
              <Text style={styles.heroTitle}>
                Отдельное окно генерации и сохранения кодов.
              </Text>
              <Text style={styles.heroText}>
                Вводи текст, создавай QR и штрихкод, а затем сохраняй файлы на
                устройство.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>QR-код</Text>
              <TextInput
                value={qrValue}
                onChangeText={setQrValue}
                style={styles.input}
                placeholder="Текст или ссылка для QR"
                placeholderTextColor="#6B7280"
              />
              {qrSvg ? (
                <View style={styles.codePreview}>
                  <SvgXml xml={qrSvg} width={220} height={220} />
                </View>
              ) : (
                <Text style={styles.emptyText}>Введите текст для QR-кода.</Text>
              )}
              <Pressable onPress={saveQrCode} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Скачать QR-код</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Штрихкод</Text>
              <TextInput
                value={barcodeValue}
                onChangeText={setBarcodeValue}
                style={styles.input}
                placeholder="Текст для штрихкода"
                placeholderTextColor="#6B7280"
                autoCapitalize="characters"
              />
              <View style={styles.codePreview}>
                <SvgXml xml={barcodeSvg} width="100%" height={170} />
              </View>
              <Pressable onPress={saveBarcode} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Скачать штрихкод</Text>
              </Pressable>
            </View>

            {lastSavedPath ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Последний сохранённый файл</Text>
                <Text style={styles.pathText}>{lastSavedPath}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View
        pointerEvents={sidebarOpen ? 'auto' : 'none'}
        style={StyleSheet.absoluteFill}>
        <Animated.View
          pointerEvents={sidebarOpen ? 'auto' : 'none'}
          style={[styles.overlay, {opacity: overlayOpacity}]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar} />
        </Animated.View>
        <Animated.View
          style={[styles.sidebar, {transform: [{translateX: sidebarX}]}]}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Разделы</Text>
            <Pressable onPress={closeSidebar}>
              <Text style={styles.sidebarClose}>×</Text>
            </Pressable>
          </View>

          {menuItems.map(item => {
            const selected = item.id === screen;

            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  setScreen(item.id);
                  closeSidebar();
                }}
                style={[
                  styles.sidebarItem,
                  selected && styles.sidebarItemSelected,
                ]}>
                <Text
                  style={[
                    styles.sidebarItemTitle,
                    selected && styles.sidebarItemTitleSelected,
                  ]}>
                  {item.title}
                </Text>
                <Text style={styles.sidebarItemSubtitle}>{item.subtitle}</Text>
              </Pressable>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'green' | 'red';
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          accent === 'green' ? styles.positiveText : styles.negativeText,
        ]}>
        {value}
      </Text>
    </View>
  );
}

function TypeChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.typeChip, selected && styles.typeChipSelected]}>
      <Text
        style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function parseAmount(value: string) {
  const normalized = value.replace(/\s/g, '').replace(/,/g, '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  const sign = value < 0 ? '-' : '';
  const [integerPart, decimalPart] = Math.abs(value).toFixed(2).split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${grouped},${decimalPart}`;
}

function formatNumberOnly(value: number) {
  const sign = value < 0 ? '-' : '';
  const [integerPart, decimalPart] = Math.abs(value).toFixed(2).split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${grouped}.${decimalPart}`;
}

function getScreenTitle(screen: Screen) {
  if (screen === 'finance') {
    return 'Финансы';
  }
  if (screen === 'calculator') {
    return 'Калькулятор';
  }
  return 'QR и штрихкоды';
}

function getScreenSubtitle(screen: Screen) {
  if (screen === 'finance') {
    return 'Отдельное окно учёта по месяцам';
  }
  if (screen === 'calculator') {
    return 'Отдельное окно быстрых вычислений';
  }
  return 'Генерация кодов и сохранение файлов';
}

function isOperator(value: string) {
  return ['/', '*', '-', '+'].includes(value);
}

function evaluateExpression(expressionValue: string) {
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
      return;
    }
    if (operator === '-') {
      values.push(left - right);
      return;
    }
    if (operator === '*') {
      values.push(left * right);
      return;
    }
    if (right === 0) {
      throw new Error('Division by zero');
    }

    values.push(left / right);
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

function toMonthId(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function incrementMonthId(monthId: string) {
  const [year, month] = monthId.split('-').map(Number);
  const next = new Date(year, month, 1);
  return toMonthId(next);
}

function firstDateOfMonth(monthId: string) {
  return `${monthId}-01`;
}

function formatMonthTitle(monthId: string) {
  const [year, month] = monthId.split('-').map(Number);
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

async function saveFile(
  baseName: string,
  extension: 'png' | 'svg',
  content: string,
  encoding: 'base64' | 'utf8',
) {
  const directory = RNFS.DocumentDirectoryPath;
  const filePath = `${directory}/${baseName}-${Date.now()}.${extension}`;
  await RNFS.writeFile(filePath, content, encoding);

  if (Platform.OS === 'android') {
    await RNFS.scanFile(filePath);
  }

  return filePath;
}

function normalizeCode39(value: string) {
  const upper = value.trim().toUpperCase();
  const cleaned = upper.replace(/[^A-Z0-9 .\-$/+%]/g, '');
  return cleaned || 'HELPER';
}

function createCode39Svg(rawValue: string) {
  const value = `*${normalizeCode39(rawValue)}*`;
  const patterns: Record<string, string> = {
    '0': 'nnnwwnwnn',
    '1': 'wnnwnnnnw',
    '2': 'nnwwnnnnw',
    '3': 'wnwwnnnnn',
    '4': 'nnnwwnnnw',
    '5': 'wnnwwnnnn',
    '6': 'nnwwwnnnn',
    '7': 'nnnwnnwnw',
    '8': 'wnnwnnwnn',
    '9': 'nnwwnnwnn',
    A: 'wnnnnwnnw',
    B: 'nnwnnwnnw',
    C: 'wnwnnwnnn',
    D: 'nnnnwwnnw',
    E: 'wnnnwwnnn',
    F: 'nnwnwwnnn',
    G: 'nnnnnwwnw',
    H: 'wnnnnwwnn',
    I: 'nnwnnwwnn',
    J: 'nnnnwwwnn',
    K: 'wnnnnnnww',
    L: 'nnwnnnnww',
    M: 'wnwnnnnwn',
    N: 'nnnnwnnww',
    O: 'wnnnwnnwn',
    P: 'nnwnwnnwn',
    Q: 'nnnnnnwww',
    R: 'wnnnnnwwn',
    S: 'nnwnnnwwn',
    T: 'nnnnwnwwn',
    U: 'wwnnnnnnw',
    V: 'nwwnnnnnw',
    W: 'wwwnnnnnn',
    X: 'nwnnwnnnw',
    Y: 'wwnnwnnnn',
    Z: 'nwwnwnnnn',
    '-': 'nwnnnnwnw',
    '.': 'wwnnnnwnn',
    ' ': 'nwwnnnwnn',
    $: 'nwnwnwnnn',
    '/': 'nwnwnnnwn',
    '+': 'nwnnnwnwn',
    '%': 'nnnwnwnwn',
    '*': 'nwnnwnwnn',
  };

  let x = 16;
  const bars: string[] = [];

  value.split('').forEach((character, index) => {
    const pattern = patterns[character] ?? patterns['*'];
    pattern.split('').forEach((widthType, barIndex) => {
      const isBar = barIndex % 2 === 0;
      const width = widthType === 'w' ? 9 : 3;
      if (isBar) {
        bars.push(
          `<rect x="${x}" y="18" width="${width}" height="120" fill="#0F172A" />`,
        );
      }
      x += width;
    });
    if (index < value.length - 1) {
      x += 3;
    }
  });

  const label = normalizeCode39(rawValue);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x + 16} 190">
    <rect width="100%" height="100%" rx="18" fill="#FFFFFF" />
    ${bars.join('')}
    <text x="${(x + 16) / 2}" y="170" text-anchor="middle" font-size="20" font-family="Arial" fill="#0F172A">${escapeXml(
      label,
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

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#EEF2FF'},
  root: {flex: 1},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 4,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  menuButtonText: {color: '#FFFFFF', fontSize: 22, fontWeight: '900'},
  topBarTextBlock: {flex: 1},
  topBarTitle: {color: '#0F172A', fontSize: 24, fontWeight: '900'},
  topBarSubtitle: {color: '#64748B', fontSize: 13},
  content: {padding: 18, paddingTop: 10, gap: 16},
  screenBlock: {gap: 16},
  hero: {backgroundColor: '#0F172A', borderRadius: 28, padding: 24},
  heroLabel: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  heroText: {color: '#CBD5E1', fontSize: 15, lineHeight: 22, marginTop: 12},
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE3F3',
    gap: 12,
  },
  sectionTitle: {color: '#0F172A', fontSize: 19, fontWeight: '800'},
  input: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
  },
  secondaryButtonText: {color: '#1D4ED8', fontWeight: '800'},
  monthRow: {flexDirection: 'row', gap: 10},
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  monthChipSelected: {backgroundColor: '#0F172A'},
  monthChipText: {
    color: '#334155',
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  monthChipTextSelected: {color: '#FFFFFF'},
  summaryRow: {gap: 12},
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE3F3',
  },
  metricLabel: {color: '#64748B', fontSize: 13, fontWeight: '700'},
  metricValue: {fontSize: 28, fontWeight: '900', marginTop: 8},
  positiveText: {color: '#15803D'},
  negativeText: {color: '#B91C1C'},
  typeRow: {flexDirection: 'row', gap: 10},
  typeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  typeChipSelected: {backgroundColor: '#0F172A'},
  typeChipText: {color: '#334155', fontWeight: '800'},
  typeChipTextSelected: {color: '#FFFFFF'},
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#2563EB',
  },
  primaryButtonText: {color: '#FFFFFF', fontWeight: '800', fontSize: 15},
  legendText: {color: '#64748B', fontSize: 12, flex: 1, textAlign: 'right'},
  chartCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 12,
    minHeight: 220,
    justifyContent: 'center',
  },
  chartRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 12},
  chartGroup: {width: 72, alignItems: 'center', gap: 8},
  barArea: {
    height: 120,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  bar: {width: 16, minHeight: 4, borderRadius: 999},
  expenseBar: {backgroundColor: '#DC2626'},
  incomeBar: {backgroundColor: '#16A34A'},
  chartDate: {color: '#334155', fontSize: 11, fontWeight: '700'},
  netValue: {fontSize: 11, fontWeight: '800'},
  historyList: {gap: 10},
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
  },
  historyTextBlock: {flex: 1},
  historyTitle: {color: '#0F172A', fontSize: 16, fontWeight: '800'},
  historyMeta: {color: '#64748B', marginTop: 4},
  historyActions: {alignItems: 'flex-end', gap: 6},
  historyAmount: {fontSize: 16, fontWeight: '900'},
  deleteText: {color: '#2563EB', fontWeight: '700'},
  emptyText: {color: '#64748B', textAlign: 'center'},
  calculatorDisplay: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  expressionText: {color: '#BFDBFE', fontSize: 18},
  resultText: {color: '#FFFFFF', fontSize: 32, fontWeight: '900'},
  calculatorGrid: {gap: 10},
  calculatorRow: {flexDirection: 'row', gap: 10},
  calcButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  operatorButton: {backgroundColor: '#DBEAFE'},
  clearButton: {backgroundColor: '#FECACA'},
  calcButtonText: {color: '#0F172A', fontSize: 18, fontWeight: '800'},
  equalsButton: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
  },
  equalsButtonText: {color: '#FFFFFF', fontWeight: '900', fontSize: 16},
  codePreview: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
  },
  pathText: {color: '#334155', lineHeight: 22},
  overlay: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.45)'},
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#FFFFFF',
    paddingTop: 26,
    paddingHorizontal: 18,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    gap: 12,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sidebarTitle: {color: '#0F172A', fontSize: 22, fontWeight: '900'},
  sidebarClose: {color: '#0F172A', fontSize: 28, fontWeight: '400'},
  sidebarItem: {padding: 16, borderRadius: 20, backgroundColor: '#EEF2FF'},
  sidebarItemSelected: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  sidebarItemTitle: {color: '#0F172A', fontSize: 17, fontWeight: '800'},
  sidebarItemTitleSelected: {color: '#1D4ED8'},
  sidebarItemSubtitle: {color: '#64748B', marginTop: 4},
});

export default App;
