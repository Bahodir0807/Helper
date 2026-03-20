import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {createStyles} from '../appStyles';

type Styles = ReturnType<typeof createStyles>;

type TopBarProps = {
  styles: Styles;
  appName: string;
  title: string;
  badgeText: string;
  onMenuPress: () => void;
};

export function TopBar({
  styles,
  appName,
  title,
  badgeText,
  onMenuPress,
}: TopBarProps) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onMenuPress} style={styles.menuButton}>
        <Text style={styles.menuButtonText}>|||</Text>
      </Pressable>
      <View style={styles.topBarTextBlock}>
        <Text style={styles.topBarEyebrow}>{appName}</Text>
        <Text style={styles.topBarTitle}>{title}</Text>
      </View>
      <View style={styles.topBarBadge}>
        <Text style={styles.topBarBadgeText}>{badgeText}</Text>
      </View>
    </View>
  );
}
