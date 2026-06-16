import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../hooks/useData';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import theme from '../lib/theme';

export default function EmployerHome({ navigation }: any) {
  const { state, currentUser } = useData();

  const myJobs = state.jobs.filter((j) => j.employerId === currentUser?.id);
  const workerCount = state.users.filter((u) => u.role === 'employee').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        showLogo
        title="Employer dashboard"
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('PostJob' as any)}>
            <Text style={styles.link}>+ Post job</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.findCard}
          onPress={() => navigation.navigate('FindWorkers' as any)}
        >
          <View style={styles.findIconWrap}>
            <Ionicons name="people" size={28} color={theme.colors.primary} />
          </View>
          <View style={styles.findTextBlock}>
            <Text style={styles.findTitle}>Find certified tradespeople</Text>
            <Text style={styles.findSubtitle}>
              Filter by skill · top-rated & nearby first · call instantly
            </Text>
            <Text style={styles.findMeta}>{workerCount} workers on the platform</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={theme.colors.muted} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>My posted jobs</Text>
        {myJobs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>No jobs yet. Post a job to receive applicants.</Text>
          </View>
        ) : (
          myJobs.map((item) => (
            <JobCard
              key={item.id}
              job={item}
              onPress={() => navigation.navigate('Applicants' as any, { jobId: item.id })}
              actionLabel="Applicants"
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: theme.spacing.md, paddingBottom: 32 },
  link: { color: theme.colors.primary, fontWeight: '700', fontSize: theme.type.body },
  findCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  findIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findTextBlock: { flex: 1 },
  findTitle: { fontSize: theme.type.headline, fontWeight: '700', color: theme.colors.text },
  findSubtitle: { fontSize: theme.type.small, color: theme.colors.muted, marginTop: 4, lineHeight: theme.lineHeight.small },
  findMeta: { fontSize: theme.type.small, color: theme.colors.primary, marginTop: 6, fontWeight: '600' },
  sectionTitle: {
    fontSize: theme.type.subtitle,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  empty: { padding: theme.spacing.lg, alignItems: 'center' },
  muted: { color: theme.colors.muted, textAlign: 'center', fontSize: theme.type.body },
});
