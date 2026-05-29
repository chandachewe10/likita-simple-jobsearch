import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';
import StarRating from './StarRating';
import { formatDistance } from '../lib/location';
import theme from '../lib/theme';

type Props = {
  worker: User;
  distanceKm: number | null;
  onPressProfile?: () => void;
};

export default function WorkerCard({ worker, distanceKm }: Props) {
  const handleCall = async () => {
    if (!worker.phone?.trim()) {
      Alert.alert('No phone number', 'This worker has not added a phone number yet.');
      return;
    }
    const tel = worker.phone.replace(/\s/g, '');
    const url = `tel:${tel}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Call', worker.phone);
      }
    } catch {
      Alert.alert('Call', worker.phone);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{worker.name}</Text>
          {worker.qualifications ? (
            <Text style={styles.certified}>Certified · {worker.qualifications}</Text>
          ) : null}
        </View>
        {distanceKm != null ? (
          <View style={styles.distancePill}>
            <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.distanceText}>{formatDistance(distanceKm)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.ratingRow}>
        {worker.rating != null ? (
          <>
            <StarRating value={worker.rating} size={16} />
            <Text style={styles.ratingText}>{worker.rating.toFixed(1)} / 5</Text>
          </>
        ) : (
          <Text style={styles.muted}>No ratings yet</Text>
        )}
      </View>

      {worker.skills && worker.skills.length > 0 ? (
        <View style={styles.skillsRow}>
          {worker.skills.slice(0, 4).map((skill) => (
            <View key={skill} style={styles.skillPill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {worker.skills.length > 4 ? (
            <Text style={styles.moreSkills}>+{worker.skills.length - 4}</Text>
          ) : null}
        </View>
      ) : null}

      {worker.address ? <Text style={styles.address}>{worker.address}</Text> : null}

      <TouchableOpacity
        style={[styles.callBtn, !worker.phone && styles.callBtnDisabled]}
        onPress={handleCall}
        disabled={!worker.phone}
      >
        <Ionicons name="call" size={18} color={theme.colors.onPrimary} />
        <Text style={styles.callBtnText}>{worker.phone ? 'Call now' : 'No phone listed'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titleBlock: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  certified: { fontSize: 12, color: theme.colors.success, marginTop: 2, fontWeight: '600' },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  ratingText: { fontSize: 13, color: theme.colors.text, fontWeight: '600' },
  muted: { fontSize: 13, color: theme.colors.muted },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' },
  skillPill: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: { fontSize: 12, color: theme.colors.text },
  moreSkills: { fontSize: 12, color: theme.colors.muted },
  address: { fontSize: 12, color: theme.colors.muted, marginTop: 8 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.success,
    padding: 12,
    borderRadius: theme.radii.sm,
    marginTop: 12,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  callBtnDisabled: { backgroundColor: theme.colors.outline, opacity: 0.7 },
  callBtnText: { color: theme.colors.onPrimary, fontWeight: '700', fontSize: 14 },
});
