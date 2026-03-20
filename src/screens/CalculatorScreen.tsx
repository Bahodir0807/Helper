import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {calculatorKeys, Copy} from '../appConfig';
import {createStyles} from '../appStyles';
import {
  evaluateExpression,
  formatNumber,
  isOperator,
} from '../utils/appHelpers';

type Styles = ReturnType<typeof createStyles>;

type CalculatorScreenProps = {
  styles: Styles;
  t: Copy;
  expression: string;
  calcResult: string;
  onSetExpression: React.Dispatch<React.SetStateAction<string>>;
  onSetCalcResult: React.Dispatch<React.SetStateAction<string>>;
};

export function CalculatorScreen({
  styles,
  t,
  expression,
  calcResult,
  onSetExpression,
  onSetCalcResult,
}: CalculatorScreenProps) {
  return (
    <View style={styles.card}>
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
                    onSetExpression('0');
                    onSetCalcResult('0');
                  } else {
                    onSetExpression(current =>
                      current === '0' && key !== '.' ? key : `${current}${key}`,
                    );
                  }
                }}
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
        <Pressable
          onPress={() => {
            if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
              onSetCalcResult(t.calcError);
              return;
            }
            try {
              onSetCalcResult(formatNumber(evaluateExpression(expression), t.locale));
            } catch {
              onSetCalcResult(t.calcError);
            }
          }}
          style={styles.equalsButton}>
          <Text style={styles.equalsButtonText}>{t.calculate}</Text>
        </Pressable>
      </View>
    </View>
  );
}
