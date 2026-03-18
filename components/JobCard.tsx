import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Job } from '../types';
import theme from '../lib/theme';

type Props = {
  job: Job;
  onPress?: () => void;
  actionLabel?: string;
  disabled?: boolean;
};

export default function JobCard({ job, onPress, actionLabel = 'View', disabled }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.time}>{new Date(job.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
        {job.description}
      </Text>
      <View style={styles.footer}>
        <View style={styles.skillsRow}>
          {job.skillsRequired.slice(0, 3).map((s) => (
            <View key={s} style={styles.skillPill}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={onPress} style={[styles.button, disabled && styles.buttonDisabled]} disabled={disabled}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: theme.type.title, fontWeight: '600', color: theme.colors.text },
  time: { fontSize: theme.type.small, color: theme.colors.muted },
  desc: { marginTop: 8, color: theme.colors.muted },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  skillsRow: { flexDirection: 'row' },
  skillPill: { backgroundColor: theme.colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  skillText: { fontSize: theme.type.small, color: theme.colors.text },
  button: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  buttonDisabled: { backgroundColor: theme.colors.success },
  buttonText: { color: theme.colors.onPrimary, fontWeight: '600' },
});