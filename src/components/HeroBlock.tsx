import React from 'react';
import {Text, View} from 'react-native';
import {Screen} from '../appConfig';
import {createStyles} from '../appStyles';

type Styles = ReturnType<typeof createStyles>;

type HeroBlockProps = {
  styles: Styles;
  screen: Screen;
  title: string;
  activeMonthTitle: string;
};

export function HeroBlock({
  styles,
  screen,
  title,
  activeMonthTitle,
}: HeroBlockProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTopRow}>
        <Text style={styles.heroLabel}>{screen.toUpperCase()}</Text>
        {screen === 'finance' ? (
          <Text style={styles.heroMeta}>{activeMonthTitle}</Text>
        ) : null}
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
    </View>
  );
}
