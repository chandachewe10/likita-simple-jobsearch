import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../lib/theme';

type LogoSize = 'sm' | 'md' | 'lg';

const SIZES: Record<LogoSize, { mark: number; icon: number; text: number }> = {
  sm: { mark: 36, icon: 18, text: 20 },
  md: { mark: 48, icon: 24, text: 26 },
  lg: { mark: 56, icon: 28, text: 32 },
};

type Props = {
  size?: LogoSize;
  showText?: boolean;
  variant?: 'default' | 'onDark';
  style?: ViewStyle;
};

export default function LikitaLogo({ size = 'md', showText = true, variant = 'default', style }: Props) {
  const dims = SIZES[size];
  const textColor = variant === 'onDark' ? '#F8FAFC' : theme.colors.text;

  return (
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.mark,
          {
            width: dims.mark,
            height: dims.mark,
            borderRadius: dims.mark * 0.28,
          },
        ]}
      >
        <Ionicons name="hammer" size={dims.icon} color="#FFFFFF" />
      </View>
      {showText && (
        <Text style={[styles.text, { fontSize: dims.text, color: textColor }]}>Likita</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mark: {
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
});
