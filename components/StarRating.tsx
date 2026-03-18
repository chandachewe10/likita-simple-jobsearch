import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../lib/theme';

type Props = {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
};

export default function StarRating({ value, onChange, size = 22 }: Props) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.row}>
      {stars.map((s) => (
        <TouchableOpacity key={s} onPress={() => onChange && onChange(s)} disabled={!onChange}>
          <Ionicons name={s <= Math.round(value) ? 'star' : 'star-outline'} size={size} color={theme.colors.primary} style={{ marginRight: 6 }} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });