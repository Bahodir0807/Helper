import React from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  copy,
  Language,
  Screen,
  ThemeId,
  themeLabels,
  themes,
} from '../appConfig';
import {createStyles} from '../appStyles';

type Styles = ReturnType<typeof createStyles>;

type MenuItem = {
  id: Screen;
  title: string;
};

type SidebarMenuProps = {
  styles: Styles;
  sidebarOpen: boolean;
  overlayOpacity: Animated.Value;
  sidebarX: Animated.Value;
  language: Language;
  themeId: ThemeId;
  screen: Screen;
  menuItems: MenuItem[];
  onClose: () => void;
  onSelectLanguage: (value: Language) => void;
  onSelectTheme: (value: ThemeId) => void;
  onSelectScreen: (value: Screen) => void;
};

export function SidebarMenu({
  styles,
  sidebarOpen,
  overlayOpacity,
  sidebarX,
  language,
  themeId,
  screen,
  menuItems,
  onClose,
  onSelectLanguage,
  onSelectTheme,
  onSelectScreen,
}: SidebarMenuProps) {
  const t = copy[language];

  return (
    <View pointerEvents={sidebarOpen ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Animated.View
        pointerEvents={sidebarOpen ? 'auto' : 'none'}
        style={[styles.overlay, {opacity: overlayOpacity}]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.sidebar, {transform: [{translateX: sidebarX}]}]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>{t.menuLabel}</Text>
          <Pressable onPress={onClose} style={styles.sidebarCloseButton}>
            <Text style={styles.sidebarClose}>Г—</Text>
          </Pressable>
        </View>

        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionLabel}>{t.language}</Text>
          <View style={styles.optionRow}>
            {(['ru', 'en', 'uz'] as Language[]).map(item => (
              <Pressable
                key={item}
                onPress={() => onSelectLanguage(item)}
                style={[
                  styles.optionChip,
                  language === item && styles.optionChipSelected,
                ]}>
                <Text
                  style={[
                    styles.optionChipText,
                    language === item && styles.optionChipTextSelected,
                  ]}>
                  {item.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarSectionLabel}>{t.theme}</Text>
          {(Object.keys(themes) as ThemeId[]).map(item => (
            <Pressable
              key={item}
              onPress={() => onSelectTheme(item)}
              style={[
                styles.themeOption,
                themeId === item && styles.themeOptionSelected,
              ]}>
              <View style={[styles.themePreview, {backgroundColor: themes[item].hero}]}>
                <View
                  style={[
                    styles.themePreviewDot,
                    {backgroundColor: themes[item].heroSecondary},
                  ]}
                />
              </View>
              <Text style={styles.themeOptionText}>
                {themeLabels[item][language]}
              </Text>
            </Pressable>
          ))}
        </View>

        {menuItems.map(item => (
          <Pressable
            key={item.id}
            onPress={() => onSelectScreen(item.id)}
            style={[styles.sidebarItem, screen === item.id && styles.sidebarItemSelected]}>
            <Text
              style={[
                styles.sidebarItemTitle,
                screen === item.id && styles.sidebarItemTitleSelected,
              ]}>
              {item.title}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}
