import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
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
  style?: ViewStyle;
};

export default function LikitaLogo({ size = 'md', showText = true, style }: Props) {
  const dims = SIZES[size];

  return (
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.mark,
          {
            width: dims.mark,
            height: dims.mark,
            borderRadius: dims.mark * 0.25,
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: dims.icon }]}>⚒️</Text>
      </View>
      {showText && (
        <Text style={[styles.text, { fontSize: dims.text }]}>Likita</Text>
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
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {},
  text: {
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
});
