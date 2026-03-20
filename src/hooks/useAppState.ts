import {useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Animated, Easing} from 'react-native';
import RNFS from 'react-native-fs';
import QRCode from 'qrcode';
import {
  copy,
  EntryType,
  initialMonths,
  Language,
  PersistedFinanceState,
  PersistedSettings,
  Screen,
  ThemeId,
  themes,
  today,
  toMonthId,
} from '../appConfig';
import {
  buildDailyData,
  createCode39Svg,
  financeStatePath,
  hydrateFinance,
  hydrateSettings,
  incrementMonthId,
  parseAmount,
  saveFile,
  settingsPath,
} from '../utils/appHelpers';

export function useAppState() {
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
      RNFS.writeFile(financeStatePath, JSON.stringify(payload), 'utf8').catch(
        () => {},
      );
    }
  }, [activeMonthId, isFinanceHydrated, months]);

  useEffect(() => {
    if (isSettingsHydrated) {
      const payload: PersistedSettings = {language, themeId};
      RNFS.writeFile(settingsPath, JSON.stringify(payload), 'utf8').catch(
        () => {},
      );
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

  const currentBalance = totals.income - totals.expense;
  const dailyData = useMemo(() => buildDailyData(activeMonth.entries), [
    activeMonth.entries,
  ]);
  const chartMax = useMemo(
    () => Math.max(...dailyData.flatMap(v => [v.expense, v.income]), 1),
    [dailyData],
  );
  const barcodeSvg = useMemo(
    () => createCode39Svg(barcodeValue || 'HELPER', theme.codeDark),
    [barcodeValue, theme.codeDark],
  );
  const menuItems = useMemo(
    () =>
      (Object.keys(t.screens) as Screen[]).map(id => ({
        id,
        title: t.screens[id].title,
      })),
    [t.screens],
  );

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
                {
                  id: String(Date.now()),
                  title,
                  amount,
                  type: entryType,
                  date: entryDate || `${month.id}-01`,
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

  const createNextMonth = () => {
    const nextMonthId = incrementMonthId(activeMonth.id);
    if (!months.some(month => month.id === nextMonthId)) {
      setMonths(current => [
        ...current,
        {id: nextMonthId, startingBalance: '0', entries: []},
      ]);
    }
    setActiveMonthId(nextMonthId);
    setEntryDate(`${nextMonthId}-01`);
  };

  const deleteEntry = (entryId: string) => {
    setMonths(current =>
      current.map(month =>
        month.id === activeMonth.id
          ? {
              ...month,
              entries: month.entries.filter(item => item.id !== entryId),
            }
          : month,
      ),
    );
  };

  const selectMonth = (monthId: string) => {
    setActiveMonthId(monthId);
    setEntryDate(`${monthId}-01`);
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

  return {
    screen,
    setScreen,
    language,
    setLanguage,
    themeId,
    setThemeId,
    sidebarOpen,
    setSidebarOpen,
    sidebarX,
    overlayOpacity,
    months,
    activeMonth,
    entryTitle,
    setEntryTitle,
    entryAmount,
    setEntryAmount,
    entryDate,
    setEntryDate,
    entryType,
    setEntryType,
    expression,
    setExpression,
    calcResult,
    setCalcResult,
    qrValue,
    setQrValue,
    qrSvg,
    barcodeValue,
    setBarcodeValue,
    barcodeSvg,
    lastSavedPath,
    theme,
    t,
    currentBalance,
    totals,
    dailyData,
    chartMax,
    menuItems,
    addEntry,
    createNextMonth,
    deleteEntry,
    selectMonth,
    saveQrCode,
    saveBarcode,
  };
}
