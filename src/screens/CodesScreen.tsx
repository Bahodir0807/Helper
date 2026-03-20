import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {Copy, ThemePalette} from '../appConfig';
import {Field} from '../components/Field';
import {createStyles} from '../appStyles';

type Styles = ReturnType<typeof createStyles>;

type CodesScreenProps = {
  styles: Styles;
  theme: ThemePalette;
  t: Copy;
  qrValue: string;
  qrSvg: string;
  barcodeValue: string;
  barcodeSvg: string;
  lastSavedPath: string;
  onSetQrValue: (value: string) => void;
  onSetBarcodeValue: (value: string) => void;
  onSaveQrCode: () => void;
  onSaveBarcode: () => void;
};

export function CodesScreen({
  styles,
  theme,
  t,
  qrValue,
  qrSvg,
  barcodeValue,
  barcodeSvg,
  lastSavedPath,
  onSetQrValue,
  onSetBarcodeValue,
  onSaveQrCode,
  onSaveBarcode,
}: CodesScreenProps) {
  return (
    <View style={styles.screenBlock}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t.qrCode}</Text>
        <Field
          styles={styles}
          label={t.qrCode}
          value={qrValue}
          onChangeText={onSetQrValue}
          placeholder={t.qrPlaceholder}
          placeholderTextColor={theme.textMuted}
        />
        {qrSvg ? (
          <View style={styles.codePreview}>
            <SvgXml xml={qrSvg} width={220} height={220} />
          </View>
        ) : (
          <Text style={styles.emptyText}>{t.qrEmpty}</Text>
        )}
        <Pressable onPress={onSaveQrCode} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{t.downloadQr}</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t.barcode}</Text>
        <Field
          styles={styles}
          label={t.barcode}
          value={barcodeValue}
          onChangeText={onSetBarcodeValue}
          placeholder={t.barcodePlaceholder}
          placeholderTextColor={theme.textMuted}
          autoCapitalize="characters"
        />
        <View style={styles.codePreview}>
          <SvgXml xml={barcodeSvg} width="100%" height={170} />
        </View>
        <Pressable onPress={onSaveBarcode} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{t.downloadBarcode}</Text>
        </Pressable>
      </View>
      {lastSavedPath ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t.lastSavedFile}</Text>
          <Text style={styles.pathText}>{lastSavedPath}</Text>
        </View>
      ) : null}
    </View>
  );
}
