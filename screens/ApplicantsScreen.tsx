import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useData } from '../hooks/useData';
import theme from '../lib/theme';
import StarRating from '../components/StarRating';
import AiReviewPanel from '../components/AiReviewPanel';
import { openResume } from '../lib/resume';
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function ApplicantsScreen({ route }: any) {
  const { jobId } = route.params;
  const { state, rateApplication, saveApplicationAiReview } = useData();
  const job = state.jobs.find((j) => j.id === jobId);
  const apps = state.applications.filter((a) => a.jobId === jobId);

  if (!job) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader title="Applicants" showBack />
        <View style={styles.content}>
          <Text style={styles.muted}>Job not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [localRating, setLocalRating] = useState<Record<string, number>>({});

  const handleRate = async (applicationId: string) => {
    const r = localRating[applicationId];
    if (!r) return Alert.alert('Pick rating', 'Please tap stars to pick a rating');
    try {
      await rateApplication(applicationId, r);
      Alert.alert('Rated', 'Applicant rated successfully');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not rate');
    }
  };

  const handleOpenResume = async (uri: string, fileName?: string) => {
    try {
      await openResume(uri, fileName);
    } catch {
      Alert.alert('Error', 'Could not open resume');
    }
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Applicants" subtitle={job?.title} showBack />
      <View style={styles.content}>
        {apps.length === 0 ? (
          <View style={{ padding: 16 }}><Text style={styles.muted}>No applicants yet.</Text></View>
        ) : (
          <FlatList
            data={apps}
            extraData={state.applications}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
            const user = state.users.find((u) => u.id === item.employeeId);
            if (!user) return null;

            const ratedJobs = state.applications.filter(
              (a) => a.employeeId === item.employeeId && typeof a.rating === 'number'
            ).length;

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.smallMuted}>{item.status}</Text>
                </View>
                <Text style={styles.appliedDate}>Applied {formatDate(item.appliedAt)}</Text>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Personal details</Text>
                  <DetailRow label="Email" value={user.email} />
                  <DetailRow label="Phone" value={user.phone} />
                  <DetailRow label="Address" value={user.address} />
                  <DetailRow label="NRC" value={user.nrc} />
                  <DetailRow label="Qualifications" value={user.qualifications} />
                  <DetailRow
                    label="Years of experience"
                    value={item.yearsOfExperience != null ? `${item.yearsOfExperience} year${item.yearsOfExperience === 1 ? '' : 's'}` : undefined}
                  />
                </View>

                {user?.skills && user.skills.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <Text style={styles.detailValue}>{user.skills.join(', ')}</Text>
                  </View>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Previous rating</Text>
                  {user?.rating != null ? (
                    <View style={styles.ratingRow}>
                      <StarRating value={user.rating} size={18} />
                      <Text style={styles.ratingText}>
                        {user.rating.toFixed(1)} / 5
                        {ratedJobs > 0 ? ` (${ratedJobs} job${ratedJobs === 1 ? '' : 's'})` : ''}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.muted}>No previous ratings yet</Text>
                  )}
                </View>

                {item.coverLetter ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Application letter</Text>
                    <Text style={styles.coverLetter}>{item.coverLetter}</Text>
                  </View>
                ) : null}

                {item.resumeUri ? (
                  <TouchableOpacity style={styles.resumeBtn} onPress={() => handleOpenResume(item.resumeUri!, item.resumeFileName)}>
                    <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.resumeBtnText}>
                      {item.resumeFileName || 'View resume'}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <AiReviewPanel
                  application={item}
                  applicant={user}
                  job={job}
                  ratedJobsCount={ratedJobs}
                  onReviewSaved={saveApplicationAiReview}
                />

                <View style={styles.rateSection}>
                  <Text style={styles.sectionTitle}>Rate after job completion</Text>
                  <View style={styles.actions}>
                    <StarRating value={localRating[item.id] || 0} onChange={(n) => setLocalRating((s) => ({ ...s, [item.id]: n }))} />
                    <TouchableOpacity style={styles.rateBtn} onPress={() => handleRate(item.id)}>
                      <Text style={{ color: 'white' }}>Rate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, padding: theme.spacing.md },
  muted: { color: theme.colors.muted },
  card: { backgroundColor: theme.colors.surface, padding: 14, borderRadius: theme.radii.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.surfaceVariant },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '700', fontSize: 16, color: theme.colors.text },
  smallMuted: { color: theme.colors.muted, fontSize: 12, textTransform: 'capitalize' },
  appliedDate: { color: theme.colors.muted, fontSize: 12, marginTop: 4 },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
  detailRow: { marginBottom: 4 },
  detailLabel: { fontSize: 12, color: theme.colors.muted },
  detailValue: { fontSize: 14, color: theme.colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 13, color: theme.colors.text },
  coverLetter: { fontSize: 14, color: theme.colors.text, lineHeight: 20 },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 10,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radii.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  resumeBtnText: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
  rateSection: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.colors.surfaceVariant },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  rateBtn: { backgroundColor: theme.colors.primary, padding: 8, borderRadius: 8 },
});
