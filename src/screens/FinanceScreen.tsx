import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {Chip} from '../components/Chip';
import {Field} from '../components/Field';
import {Copy, EntryType, MonthBucket, ThemePalette} from '../appConfig';
import {createStyles} from '../appStyles';
import {
  formatDate,
  formatNumber,
  formatShortDay,
  formatMonthTitle,
} from '../utils/appHelpers';

type Styles = ReturnType<typeof createStyles>;

type FinanceScreenProps = {
  styles: Styles;
  theme: ThemePalette;
  t: Copy;
  months: MonthBucket[];
  activeMonth: MonthBucket;
  currentBalance: number;
  totals: {expense: number; income: number};
  dailyData: {date: string; expense: number; income: number; net: number}[];
  chartMax: number;
  entryTitle: string;
  entryAmount: string;
  entryDate: string;
  entryType: EntryType;
  onSetActiveMonth: (monthId: string) => void;
  onCreateNextMonth: () => void;
  onSetEntryTitle: (value: string) => void;
  onSetEntryAmount: (value: string) => void;
  onSetEntryDate: (value: string) => void;
  onSetEntryType: (value: EntryType) => void;
  onAddEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
};

export function FinanceScreen({
  styles,
  theme,
  t,
  months,
  activeMonth,
  currentBalance,
  totals,
  dailyData,
  chartMax,
  entryTitle,
  entryAmount,
  entryDate,
  entryType,
  onSetActiveMonth,
  onCreateNextMonth,
  onSetEntryTitle,
  onSetEntryAmount,
  onSetEntryDate,
  onSetEntryType,
  onAddEntry,
  onDeleteEntry,
}: FinanceScreenProps) {
  return (
    <View style={styles.screenBlock}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t.currentBalance}</Text>
        <Text
          style={[
            styles.balanceValue,
            {color: currentBalance >= 0 ? theme.income : theme.expense},
          ]}>
          {formatNumber(currentBalance, t.locale)}
        </Text>
        <View style={styles.balanceMetaRow}>
          <View style={styles.balanceMetaItem}>
            <Text style={styles.balanceMetaLabel}>{t.expenses}</Text>
            <Text style={[styles.balanceMetaValue, {color: theme.expense}]}>
              {formatNumber(totals.expense, t.locale)}
            </Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceMetaItem}>
            <Text style={styles.balanceMetaLabel}>{t.income}</Text>
            <Text style={[styles.balanceMetaValue, {color: theme.income}]}>
              {formatNumber(totals.income, t.locale)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t.months}</Text>
          <Pressable onPress={onCreateNextMonth} style={styles.secondaryButton}>
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
                  onPress={() => onSetActiveMonth(month.id)}
                  style={[styles.monthChip, selected && styles.monthChipSelected]}>
                  <Text
                    style={[
                      styles.monthChipText,
                      selected && styles.monthChipTextSelected,
                    ]}>
                    {formatMonthTitle(month.id, t.locale)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t.addEntry}</Text>
        <View style={styles.typeRow}>
          <Chip
            styles={styles}
            label={t.expenseChip}
            selected={entryType === 'expense'}
            onPress={() => onSetEntryType('expense')}
          />
          <Chip
            styles={styles}
            label={t.incomeChip}
            selected={entryType === 'income'}
            onPress={() => onSetEntryType('income')}
          />
        </View>
        <Field
          styles={styles}
          label={t.entryTitlePlaceholder}
          value={entryTitle}
          onChangeText={onSetEntryTitle}
          placeholder={t.entryTitlePlaceholder}
          placeholderTextColor={theme.textMuted}
        />
        <Field
          styles={styles}
          label={t.amountPlaceholder}
          value={entryAmount}
          onChangeText={onSetEntryAmount}
          keyboardType="numeric"
          placeholder={t.amountPlaceholder}
          placeholderTextColor={theme.textMuted}
        />
        <Field
          styles={styles}
          label={t.datePlaceholder}
          value={entryDate}
          onChangeText={onSetEntryDate}
          placeholder={t.datePlaceholder}
          placeholderTextColor={theme.textMuted}
        />
        <Pressable onPress={onAddEntry} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{t.saveEntry}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeaderCompact}>
          <Text style={styles.sectionTitle}>{t.history}</Text>
          <Text style={styles.sectionHint}>{activeMonth.entries.length}</Text>
        </View>
        <View style={styles.historyList}>
          {activeMonth.entries.map(entry => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyTextBlock}>
                <Text style={styles.historyTitle}>{entry.title}</Text>
                <Text style={styles.historyMeta}>
                  {formatDate(entry.date, t.locale)} В·{' '}
                  {entry.type === 'income' ? t.incomeEntry : t.expenseEntry}
                </Text>
              </View>
              <View style={styles.historyActions}>
                <Text
                  style={[
                    styles.historyAmount,
                    {color: entry.type === 'income' ? theme.income : theme.expense},
                  ]}>
                  {entry.type === 'income' ? '+' : '-'}
                  {formatNumber(entry.amount, t.locale)}
                </Text>
                <Pressable onPress={() => onDeleteEntry(entry.id)}>
                  <Text style={styles.deleteText}>{t.delete}</Text>
                </Pressable>
              </View>
            </View>
          ))}
          {activeMonth.entries.length === 0 ? (
            <Text style={styles.emptyText}>{t.historyEmpty}</Text>
          ) : null}
        </View>
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
                    <Text style={styles.chartDate}>
                      {formatShortDay(point.date, t.locale)}
                    </Text>
                    <Text
                      style={[
                        styles.netValue,
                        {color: point.net >= 0 ? theme.income : theme.expense},
                      ]}>
                      {point.net >= 0 ? '+' : '-'}
                      {formatNumber(Math.abs(point.net), t.locale)}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}
