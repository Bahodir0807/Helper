import React from 'react';
import {ScrollView, StatusBar, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {formatMonthTitle} from './src/utils/appHelpers';
import {HeroBlock} from './src/components/HeroBlock';
import {SidebarMenu} from './src/components/SidebarMenu';
import {TopBar} from './src/components/TopBar';
import {createStyles} from './src/appStyles';
import {useAppState} from './src/hooks/useAppState';
import {CalculatorScreen} from './src/screens/CalculatorScreen';
import {CodesScreen} from './src/screens/CodesScreen';
import {FinanceScreen} from './src/screens/FinanceScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const state = useAppState();
  const styles = React.useMemo(() => createStyles(state.theme), [state.theme]);

  return (
    <>
      <StatusBar
        barStyle={state.themeId === 'night' ? 'light-content' : 'dark-content'}
        backgroundColor={state.theme.background}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.root}>
          <View style={styles.orbPrimary} />
          <View style={styles.orbSecondary} />

          <TopBar
            styles={styles}
            appName={state.t.appName}
            title={state.t.screens[state.screen].title}
            badgeText={
              state.screen === 'finance'
                ? formatMonthTitle(state.activeMonth.id, state.t.locale)
                : state.t.appName
            }
            onMenuPress={() => state.setSidebarOpen(true)}
          />

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <HeroBlock
              styles={styles}
              screen={state.screen}
              title={state.t.screens[state.screen].title}
              activeMonthTitle={formatMonthTitle(state.activeMonth.id, state.t.locale)}
            />

            {state.screen === 'finance' ? (
              <FinanceScreen
                styles={styles}
                theme={state.theme}
                t={state.t}
                months={state.months}
                activeMonth={state.activeMonth}
                currentBalance={state.currentBalance}
                totals={state.totals}
                dailyData={state.dailyData}
                chartMax={state.chartMax}
                entryTitle={state.entryTitle}
                entryAmount={state.entryAmount}
                entryDate={state.entryDate}
                entryType={state.entryType}
                onSetActiveMonth={state.selectMonth}
                onCreateNextMonth={state.createNextMonth}
                onSetEntryTitle={state.setEntryTitle}
                onSetEntryAmount={state.setEntryAmount}
                onSetEntryDate={state.setEntryDate}
                onSetEntryType={state.setEntryType}
                onAddEntry={state.addEntry}
                onDeleteEntry={state.deleteEntry}
              />
            ) : null}

            {state.screen === 'calculator' ? (
              <CalculatorScreen
                styles={styles}
                t={state.t}
                expression={state.expression}
                calcResult={state.calcResult}
                onSetExpression={state.setExpression}
                onSetCalcResult={state.setCalcResult}
              />
            ) : null}

            {state.screen === 'codes' ? (
              <CodesScreen
                styles={styles}
                theme={state.theme}
                t={state.t}
                qrValue={state.qrValue}
                qrSvg={state.qrSvg}
                barcodeValue={state.barcodeValue}
                barcodeSvg={state.barcodeSvg}
                lastSavedPath={state.lastSavedPath}
                onSetQrValue={state.setQrValue}
                onSetBarcodeValue={state.setBarcodeValue}
                onSaveQrCode={state.saveQrCode}
                onSaveBarcode={state.saveBarcode}
              />
            ) : null}
          </ScrollView>

          <SidebarMenu
            styles={styles}
            sidebarOpen={state.sidebarOpen}
            overlayOpacity={state.overlayOpacity}
            sidebarX={state.sidebarX}
            language={state.language}
            themeId={state.themeId}
            screen={state.screen}
            menuItems={state.menuItems}
            onClose={() => state.setSidebarOpen(false)}
            onSelectLanguage={state.setLanguage}
            onSelectTheme={state.setThemeId}
            onSelectScreen={value => {
              state.setScreen(value);
              state.setSidebarOpen(false);
            }}
          />
        </View>
      </SafeAreaView>
    </>
  );
}
