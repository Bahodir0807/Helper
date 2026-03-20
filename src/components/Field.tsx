import React from 'react';
import {Text, TextInput, type TextInputProps, View} from 'react-native';
import {createStyles} from '../appStyles';

type Styles = ReturnType<typeof createStyles>;

type FieldProps = TextInputProps & {
  styles: Styles;
  label: string;
};

export function Field({styles, label, ...props}: FieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput {...props} style={styles.input} />
    </View>
  );
}
