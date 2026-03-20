import React from 'react';
import {Pressable, Text} from 'react-native';
import {createStyles} from '../appStyles';

type Styles = ReturnType<typeof createStyles>;

type ChipProps = {
  styles: Styles;
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({styles, label, selected, onPress}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.typeChip, selected && styles.typeChipSelected]}>
      <Text style={[styles.typeChipText, selected && styles.typeChipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}
