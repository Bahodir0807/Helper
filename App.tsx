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
  View,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import RNFS from 'react-native-fs';
import {SvgXml} from 'react-native-svg';
import QRCode from 'qrcode';
import {
  calculatorKeys,
  copy,
  DailyPoint,
  EntryType,
  initialMonths,
  Language,
  MonthBucket,
  PersistedFinanceState,
  PersistedSettings,
  Screen,
  ThemeId,
  themeLabels,
  themes,
  today,
  toMonthId,
} from './src/appConfig';
import {createStyles} from './src/appStyles';

const financeStatePath = `${RNFS.DocumentDirectoryPath}/helper-finance-state.json`;
const settingsPath = `${RNFS.DocumentDirectoryPath}/helper-settings.json`;

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('finance');
  const [language, setLanguage] = useState<Language>('ru');
  const [themeId, setThemeId] = useState<ThemeId>('atelier');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarX = useRef(new Animated.Value(-340)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const [months, setMonths] = useState(initialMonths);
  const [activeMonthId, setActiveMonthId] = useState(toMonthId(new Date()));
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
  const [isFinanceHydrated, setIsFinanceHydrated] = useState(false);
  const [isSettingsHydrated, setIsSettingsHydrated] = useState(false);

  const theme = themes[themeId];
  const t = copy[language];
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(sidebarX, {
        toValue: sidebarOpen ? 0 : -340,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: sidebarOpen ? 1 : 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlayOpacity, sidebarOpen, sidebarX]);

  useEffect(() => {
    hydrateFinance(setMonths, setActiveMonthId, setIsFinanceHydrated);
    hydrateSettings(setLanguage, setThemeId, setIsSettingsHydrated);
  }, []);

  useEffect(() => {
    if (isFinanceHydrated) {
      const payload: PersistedFinanceState = {activeMonthId, months};
      RNFS.writeFile(financeStatePath, JSON.stringify(payload), 'utf8').catch(() => {});
    }
  }, [activeMonthId, isFinanceHydrated, months]);

  useEffect(() => {
    if (isSettingsHydrated) {
      const payload: PersistedSettings = {language, themeId};
      RNFS.writeFile(settingsPath, JSON.stringify(payload), 'utf8').catch(() => {});
    }
  }, [isSettingsHydrated, language, themeId]);

  useEffect(() => {
    let cancelled = false;
    if (!qrValue.trim()) {
      setQrSvg('');
      return;
    }

    QRCode.toString(qrValue, {
      type: 'svg',
      margin: 1,
      color: {dark: theme.codeDark, light: '#FFFFFF'},
    })
      .then(svg => {
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
  }, [qrValue, theme.codeDark]);

  const activeMonth = useMemo(
    () => months.find(item => item.id === activeMonthId) ?? months[0],
    [activeMonthId, months],
  );

  const totals = useMemo(
    () =>
      activeMonth.entries.reduce(
        (acc, entry) => ({
          expense: acc.expense + (entry.type === 'expense' ? entry.amount : 0),
          income: acc.income + (entry.type === 'income' ? entry.amount : 0),
        }),
        {expense: 0, income: 0},
      ),
    [activeMonth.entries],
  );

  const currentBalance =
    parseAmount(activeMonth.startingBalance) + totals.income - totals.expense;

  const dailyData = useMemo<DailyPoint[]>(() => buildDailyData(activeMonth.entries), [
    activeMonth.entries,
  ]);
  const chartMax = useMemo(() => Math.max(...dailyData.flatMap(v => [v.expense, v.income]), 1), [
    dailyData,
  ]);
  const barcodeSvg = useMemo(
    () => createCode39Svg(barcodeValue || 'HELPER', theme.codeDark),
    [barcodeValue, theme.codeDark],
  );

  const menuItems = (Object.keys(t.screens) as Screen[]).map(id => ({
    id,
    title: t.screens[id].title,
    subtitle: t.screens[id].subtitle,
  }));

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
      Alert.alert(t.reviewEntryTitle, t.reviewEntryMessage);
      return;
    }

    setMonths(current =>
      current.map(month =>
        month.id === activeMonth.id
          ? {
              ...month,
              entries: [
                {id: String(Date.now()), title, amount, type: entryType, date: entryDate || `${month.id}-01`},
                ...month.entries,
              ],
            }
          : month,
      ),
    );
    setEntryTitle('');
    setEntryAmount('');
  };

  const createNextMonth = () => {
    const nextMonthId = incrementMonthId(activeMonth.id);
    if (!months.some(month => month.id === nextMonthId)) {
      setMonths(current => [
        ...current,
        {id: nextMonthId, startingBalance: String(currentBalance), entries: []},
      ]);
    }
    setActiveMonthId(nextMonthId);
    setEntryDate(`${nextMonthId}-01`);
  };

  const saveQrCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(qrValue, {margin: 1, width: 1200});
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
      const filePath = await saveFile('qr-code', 'png', base64, 'base64');
      setLastSavedPath(filePath);
      Alert.alert(t.qrSaved, filePath);
    } catch {
      Alert.alert(t.calcError, t.qrSaveErrorMessage);
    }
  };

  const saveBarcode = async () => {
    try {
      const filePath = await saveFile('barcode', 'svg', barcodeSvg, 'utf8');
      setLastSavedPath(filePath);
      Alert.alert(t.barcodeSaved, filePath);
    } catch {
      Alert.alert(t.calcError, t.barcodeSaveErrorMessage);
    }
  };

  return (
    <>
      <StatusBar
        barStyle={themeId === 'night' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.root}>
          <View style={styles.orbPrimary} />
          <View style={styles.orbSecondary} />

          <View style={styles.topBar}>
            <Pressable onPress={() => setSidebarOpen(true)} style={styles.menuButton}>
              <Text style={styles.menuButtonText}>|||</Text>
            </Pressable>
            <View style={styles.topBarTextBlock}>
              <Text style={styles.topBarEyebrow}>{t.appName}</Text>
              <Text style={styles.topBarTitle}>{t.screens[screen].title}</Text>
              <Text style={styles.topBarSubtitle}>{t.screens[screen].subtitle}</Text>
            </View>
            <View style={styles.topBarBadge}>
              <Text style={styles.topBarBadgeText}>{language.toUpperCase()}</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <HeroBlock styles={styles} label={t.hero[screen].label} title={t.hero[screen].title} text={t.hero[screen].text} />
            <View style={styles.infoStrip}>
              <View style={styles.infoPill}>
                <Text style={styles.infoLabel}>{t.theme}</Text>
                <Text style={styles.infoValue}>{themeLabels[themeId][language]}</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.infoLabel}>{t.language}</Text>
                <Text style={styles.infoValue}>{language.toUpperCase()}</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.infoLabel}>{t.months}</Text>
                <Text style={styles.infoValue}>{formatMonthTitle(activeMonth.id, t.locale)}</Text>
              </View>
            </View>

            {screen === 'finance' ? (
              <View style={styles.screenBlock}>
                <View style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t.months}</Text>
                    <Pressable onPress={createNextMonth} style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>{t.nextMonth}</Text>
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
                              setEntryDate(`${month.id}-01`);
                            }}
                            style={[styles.monthChip, selected && styles.monthChipSelected]}>
                            <Text style={[styles.monthChipText, selected && styles.monthChipTextSelected]}>
                              {formatMonthTitle(month.id, t.locale)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t.startingBalance}</Text>
                  <TextInput
                    value={activeMonth.startingBalance}
                    onChangeText={setMonthStartingBalance}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder={t.startingBalancePlaceholder}
                    placeholderTextColor={theme.textMuted}
                  />
                </View>

                <View style={styles.summaryRow}>
                  <MetricCard styles={styles} label={t.currentBalance} value={formatNumber(currentBalance, t.locale)} color={currentBalance >= 0 ? theme.income : theme.expense} />
                  <MetricCard styles={styles} label={t.expenses} value={formatNumber(totals.expense, t.locale)} color={theme.expense} />
                  <MetricCard styles={styles} label={t.income} value={formatNumber(totals.income, t.locale)} color={theme.income} />
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t.addEntry}</Text>
                  <View style={styles.typeRow}>
                    <Chip styles={styles} label={t.expenseChip} selected={entryType === 'expense'} onPress={() => setEntryType('expense')} />
                    <Chip styles={styles} label={t.incomeChip} selected={entryType === 'income'} onPress={() => setEntryType('income')} />
                  </View>
                  <TextInput value={entryTitle} onChangeText={setEntryTitle} style={styles.input} placeholder={t.entryTitlePlaceholder} placeholderTextColor={theme.textMuted} />
                  <TextInput value={entryAmount} onChangeText={setEntryAmount} keyboardType="numeric" style={styles.input} placeholder={t.amountPlaceholder} placeholderTextColor={theme.textMuted} />
                  <TextInput value={entryDate} onChangeText={setEntryDate} style={styles.input} placeholder={t.datePlaceholder} placeholderTextColor={theme.textMuted} />
                  <Pressable onPress={addEntry} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>{t.saveEntry}</Text>
                  </Pressable>
                </View>

                <View style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t.dailyChart}</Text>
                    <Text style={styles.legendText}>{t.chartLegend}</Text>
                  </View>
                  <View style={styles.chartCard}>
                    {dailyData.length === 0 ? (
                      <Text style={styles.emptyText}>{t.noChartData}</Text>
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.chartRow}>
                          {dailyData.map(point => (
                            <View key={point.date} style={styles.chartGroup}>
                              <View style={styles.barArea}>
                                <View style={[styles.bar, styles.expenseBar, {height: `${(point.expense / chartMax) * 100}%`}]} />
                                <View style={[styles.bar, styles.incomeBar, {height: `${(point.income / chartMax) * 100}%`}]} />
                              </View>
                              <Text style={styles.chartDate}>{formatShortDay(point.date, t.locale)}</Text>
                              <Text style={[styles.netValue, {color: point.net >= 0 ? theme.income : theme.expense}]}>
                                {point.net >= 0 ? '+' : '-'}{formatNumber(Math.abs(point.net), t.locale)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </ScrollView>
                    )}
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t.history}</Text>
                  <View style={styles.historyList}>
                    {activeMonth.entries.map(entry => (
                      <View key={entry.id} style={styles.historyItem}>
                        <View style={styles.historyTextBlock}>
                          <Text style={styles.historyTitle}>{entry.title}</Text>
                          <Text style={styles.historyMeta}>
                            {formatDate(entry.date, t.locale)} В· {entry.type === 'income' ? t.incomeEntry : t.expenseEntry}
                          </Text>
                        </View>
                        <View style={styles.historyActions}>
                          <Text style={[styles.historyAmount, {color: entry.type === 'income' ? theme.income : theme.expense}]}>
                            {entry.type === 'income' ? '+' : '-'}{formatNumber(entry.amount, t.locale)}
                          </Text>
                          <Pressable onPress={() => setMonths(current => current.map(month => month.id === activeMonth.id ? {...month, entries: month.entries.filter(item => item.id !== entry.id)} : month))}>
                            <Text style={styles.deleteText}>{t.delete}</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                    {activeMonth.entries.length === 0 ? <Text style={styles.emptyText}>{t.historyEmpty}</Text> : null}
                  </View>
                </View>
              </View>
            ) : null}

            {screen === 'calculator' ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>{t.calculator}</Text>
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
                          onPress={() => {
                            if (key === 'C') {
                              setExpression('0');
                              setCalcResult('0');
                            } else {
                              setExpression(current => (current === '0' && key !== '.' ? key : `${current}${key}`));
                            }
                          }}
                          style={[styles.calcButton, key === 'C' && styles.clearButton, isOperator(key) && styles.operatorButton]}>
                          <Text style={styles.calcButtonText}>{key}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                  <Pressable
                    onPress={() => {
                      if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
                        setCalcResult(t.calcError);
                        return;
                      }
                      try {
                        setCalcResult(formatNumber(evaluateExpression(expression), t.locale));
                      } catch {
                        setCalcResult(t.calcError);
                      }
                    }}
                    style={styles.equalsButton}>
                    <Text style={styles.equalsButtonText}>{t.calculate}</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {screen === 'codes' ? (
              <View style={styles.screenBlock}>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t.qrCode}</Text>
                  <TextInput value={qrValue} onChangeText={setQrValue} style={styles.input} placeholder={t.qrPlaceholder} placeholderTextColor={theme.textMuted} />
                  {qrSvg ? <View style={styles.codePreview}><SvgXml xml={qrSvg} width={220} height={220} /></View> : <Text style={styles.emptyText}>{t.qrEmpty}</Text>}
                  <Pressable onPress={saveQrCode} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{t.downloadQr}</Text></Pressable>
                </View>
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t.barcode}</Text>
                  <TextInput value={barcodeValue} onChangeText={setBarcodeValue} style={styles.input} placeholder={t.barcodePlaceholder} placeholderTextColor={theme.textMuted} autoCapitalize="characters" />
                  <View style={styles.codePreview}><SvgXml xml={barcodeSvg} width="100%" height={170} /></View>
                  <Pressable onPress={saveBarcode} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{t.downloadBarcode}</Text></Pressable>
                </View>
                {lastSavedPath ? <View style={styles.card}><Text style={styles.sectionTitle}>{t.lastSavedFile}</Text><Text style={styles.pathText}>{lastSavedPath}</Text></View> : null}
              </View>
            ) : null}
          </ScrollView>

          <View pointerEvents={sidebarOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
            <Animated.View pointerEvents={sidebarOpen ? 'auto' : 'none'} style={[styles.overlay, {opacity: overlayOpacity}]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setSidebarOpen(false)} />
            </Animated.View>
            <Animated.View style={[styles.sidebar, {transform: [{translateX: sidebarX}]}]}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>{t.menuLabel}</Text>
                <Pressable onPress={() => setSidebarOpen(false)} style={styles.sidebarCloseButton}>
                  <Text style={styles.sidebarClose}>Г—</Text>
                </Pressable>
              </View>

              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionLabel}>{t.language}</Text>
                <View style={styles.optionRow}>
                  {(['ru', 'en', 'uz'] as Language[]).map(item => (
                    <Pressable key={item} onPress={() => setLanguage(item)} style={[styles.optionChip, language === item && styles.optionChipSelected]}>
                      <Text style={[styles.optionChipText, language === item && styles.optionChipTextSelected]}>{item.toUpperCase()}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionLabel}>{t.theme}</Text>
                {(Object.keys(themes) as ThemeId[]).map(item => (
                  <Pressable key={item} onPress={() => setThemeId(item)} style={[styles.themeOption, themeId === item && styles.themeOptionSelected]}>
                    <View style={[styles.themePreview, {backgroundColor: themes[item].hero}]}>
                      <View style={[styles.themePreviewDot, {backgroundColor: themes[item].heroSecondary}]} />
                    </View>
                    <Text style={styles.themeOptionText}>{themeLabels[item][language]}</Text>
                  </Pressable>
                ))}
              </View>

              {menuItems.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setScreen(item.id);
                    setSidebarOpen(false);
                  }}
                  style={[styles.sidebarItem, screen === item.id && styles.sidebarItemSelected]}>
                  <Text style={[styles.sidebarItemTitle, screen === item.id && styles.sidebarItemTitleSelected]}>{item.title}</Text>
                  <Text style={styles.sidebarItemSubtitle}>{item.subtitle}</Text>
                </Pressable>
              ))}
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

function HeroBlock({styles, label, title, text}: {styles: ReturnType<typeof createStyles>; label: string; title: string; text: string}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroGlowLarge} />
      <View style={styles.heroGlowSmall} />
      <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>{label}</Text></View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroText}>{text}</Text>
    </View>
  );
}

function MetricCard({styles, label, value, color}: {styles: ReturnType<typeof createStyles>; label: string; value: string; color: string}) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricAccent, {backgroundColor: color}]} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, {color}]}>{value}</Text>
    </View>
  );
}

function Chip({styles, label, selected, onPress}: {styles: ReturnType<typeof createStyles>; label: string; selected: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[styles.typeChip, selected && styles.typeChipSelected]}>
      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

async function hydrateFinance(
  setMonths: React.Dispatch<React.SetStateAction<MonthBucket[]>>,
  setActiveMonthId: React.Dispatch<React.SetStateAction<string>>,
  setHydrated: React.Dispatch<React.SetStateAction<boolean>>,
) {
  try {
    if (!(await RNFS.exists(financeStatePath))) {
      return;
    }
    const parsed = JSON.parse(await RNFS.readFile(financeStatePath, 'utf8')) as PersistedFinanceState;
    if (Array.isArray(parsed.months) && parsed.months.length > 0) {
      setMonths(parsed.months);
      setActiveMonthId(parsed.activeMonthId);
    }
  } catch {
  } finally {
    setHydrated(true);
  }
}

async function hydrateSettings(
  setLanguage: React.Dispatch<React.SetStateAction<Language>>,
  setThemeId: React.Dispatch<React.SetStateAction<ThemeId>>,
  setHydrated: React.Dispatch<React.SetStateAction<boolean>>,
) {
  try {
    if (!(await RNFS.exists(settingsPath))) {
      return;
    }
    const parsed = JSON.parse(await RNFS.readFile(settingsPath, 'utf8')) as PersistedSettings;
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

function buildDailyData(entries: MonthBucket['entries']) {
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

function parseAmount(value: string) {
  const parsed = Number(value.replace(/\s/g, '').replace(/,/g, '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMonthTitle(monthId: string, locale: string) {
  const [year, month] = monthId.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {month: 'long', year: 'numeric'}).format(
    new Date(year, month - 1, 1),
  );
}

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, {day: '2-digit', month: 'short', year: 'numeric'}).format(date);
}

function formatShortDay(value: string, locale: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value.slice(5)
    : new Intl.DateTimeFormat(locale, {day: '2-digit', month: 'short'}).format(date);
}

function incrementMonthId(monthId: string) {
  const [year, month] = monthId.split('-').map(Number);
  return toMonthId(new Date(year, month, 1));
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
    while (operators.length > 0 && precedence(operators[operators.length - 1]) >= precedence(token)) {
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

async function saveFile(baseName: string, extension: 'png' | 'svg', content: string, encoding: 'base64' | 'utf8') {
  const filePath = `${RNFS.DocumentDirectoryPath}/${baseName}-${Date.now()}.${extension}`;
  await RNFS.writeFile(filePath, content, encoding);
  if (Platform.OS === 'android') {
    await RNFS.scanFile(filePath);
  }
  return filePath;
}

function createCode39Svg(rawValue: string, darkColor: string) {
  const patterns: Record<string, string> = {
    '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw',
    '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
    A: 'wnnnnwnnw', B: 'nnwnnwnnw', C: 'wnwnnwnnn', D: 'nnnnwwnnw', E: 'wnnnwwnnn', F: 'nnwnwwnnn',
    G: 'nnnnnwwnw', H: 'wnnnnwwnn', I: 'nnwnnwwnn', J: 'nnnnwwwnn', K: 'wnnnnnnww', L: 'nnwnnnnww',
    M: 'wnwnnnnwn', N: 'nnnnwnnww', O: 'wnnnwnnwn', P: 'nnwnwnnwn', Q: 'nnnnnnwww', R: 'wnnnnnwwn',
    S: 'nnwnnnwwn', T: 'nnnnwnwwn', U: 'wwnnnnnnw', V: 'nwwnnnnnw', W: 'wwwnnnnnn', X: 'nwnnwnnnw',
    Y: 'wwnnwnnnn', Z: 'nwwnwnnnn', '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn',
    $: 'nwnwnwnnn', '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn',
  };
  const value = `*${rawValue.trim().toUpperCase().replace(/[^A-Z0-9 .\-$/+%]/g, '') || 'HELPER'}*`;
  let x = 16;
  const bars: string[] = [];
  value.split('').forEach((char, index) => {
    (patterns[char] ?? patterns['*']).split('').forEach((widthType, barIndex) => {
      const width = widthType === 'w' ? 9 : 3;
      if (barIndex % 2 === 0) {
        bars.push(`<rect x="${x}" y="18" width="${width}" height="120" fill="${darkColor}" />`);
      }
      x += width;
    });
    if (index < value.length - 1) {
      x += 3;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x + 16} 190"><rect width="100%" height="100%" rx="18" fill="#FFFFFF" />${bars.join('')}<text x="${(x + 16) / 2}" y="170" text-anchor="middle" font-size="20" font-family="Arial" fill="${darkColor}">${escapeXml(value.replace(/\*/g, ''))}</text></svg>`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
