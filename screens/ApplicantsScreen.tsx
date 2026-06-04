import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useData } from '../hooks/useData';
import theme from '../lib/theme';
import StarRating from '../components/StarRating';
import AiReviewPanel from '../components/AiReviewPanel';
import PaymentModal from '../components/PaymentModal';
import { openResume } from '../lib/resume';
import { sendSms, buildAcceptanceMessage } from '../lib/messaging';
import { collectMobileMoney } from '../lib/payments';
import { formatLencoPhone, formatSwiftSmsPhone } from '../lib/phone';
import { Application } from '../types';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusColor(status: Application['status']) {
  switch (status) {
    case 'accepted':
      return theme.colors.success;
    case 'rejected':
      return theme.colors.danger;
    case 'completed':
      return theme.colors.primary;
    default:
      return theme.colors.muted;
  }
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
  const {
    state,
    currentUser,
    acceptApplication,
    rejectApplication,
    markApplicationComplete,
    rateApplication,
    saveApplicationAiReview,
    recordApplicationPayment,
  } = useData();
  const job = state.jobs.find((j) => j.id === jobId);
  const apps = state.applications.filter((a) => a.jobId === jobId);

  const [localRating, setLocalRating] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<{
    applicationId: string;
    workerName: string;
  } | null>(null);

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

  const handleRate = async (applicationId: string) => {
    const r = localRating[applicationId];
    if (!r) return Alert.alert('Pick rating', 'Please tap stars to pick a rating');
    const app = state.applications.find((a) => a.id === applicationId);
    if (app?.status !== 'completed') {
      return Alert.alert('Mark complete first', 'Mark the job as complete before rating.');
    }
    try {
      await rateApplication(applicationId, r);
      Alert.alert('Rated', 'Applicant rated successfully');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not rate');
    }
  };

  const handleAccept = async (applicationId: string, applicantName: string, phone?: string) => {
    setActionLoading(applicationId);
    try {
      await acceptApplication(applicationId);
      if (phone?.trim()) {
        try {
          await sendSms(
            formatSwiftSmsPhone(phone),
            buildAcceptanceMessage(applicantName, job.title)
          );
          Alert.alert('Accepted', 'Applicant accepted and SMS notification sent.');
        } catch (smsError: any) {
          Alert.alert(
            'Accepted',
            `Applicant accepted but SMS failed: ${smsError.message || 'Could not send SMS'}`
          );
        }
      } else {
        Alert.alert('Accepted', 'Applicant accepted (no phone number for SMS).');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not accept');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    Alert.alert('Reject applicant', 'Are you sure you want to reject this application?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(applicationId);
          try {
            await rejectApplication(applicationId);
            Alert.alert('Rejected', 'Application rejected.');
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not reject');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const handleMarkComplete = async (applicationId: string) => {
    setActionLoading(applicationId);
    try {
      await markApplicationComplete(applicationId);
      Alert.alert('Complete', 'Job marked as complete. You can now rate and collect payment.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not mark complete');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayment = async (amount: number, operator: 'airtel' | 'mtn', payerPhone: string) => {
    if (!paymentTarget) return;
    const reference = `LIKITA-${paymentTarget.applicationId.slice(0, 8)}-${Date.now()}`;
    const formattedPhone = formatLencoPhone(payerPhone);
    await recordApplicationPayment(paymentTarget.applicationId, {
      reference,
      status: 'pending',
      phone: formattedPhone,
    });
    try {
      const result = await collectMobileMoney({
        phone: formattedPhone,
        operator,
        amount,
        reference,
      });
      await recordApplicationPayment(paymentTarget.applicationId, {
        reference: result.reference,
        status: 'paid',
        phone: formattedPhone,
      });
      Alert.alert(
        'Collection started',
        'Lenco will deduct the amount from the number you entered. Approve the prompt on that phone if asked. Funds will appear in your Lenco account once collected.'
      );
    } catch (e: any) {
      await recordApplicationPayment(paymentTarget.applicationId, {
        reference,
        status: 'failed',
        phone: formattedPhone,
      });
      throw e;
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
      <AppHeader title="Applicants" subtitle={job.title} showBack />
      <View style={styles.content}>
        {apps.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={styles.muted}>No applicants yet.</Text>
          </View>
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
              const busy = actionLoading === item.id;

              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={[styles.statusBadge, { color: statusColor(item.status) }]}>
                      {item.status}
                    </Text>
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
                      value={
                        item.yearsOfExperience != null
                          ? `${item.yearsOfExperience} year${item.yearsOfExperience === 1 ? '' : 's'}`
                          : undefined
                      }
                    />
                  </View>

                  {user.skills && user.skills.length > 0 ? (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Skills</Text>
                      <Text style={styles.detailValue}>{user.skills.join(', ')}</Text>
                    </View>
                  ) : null}

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Previous rating</Text>
                    {user.rating != null ? (
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
                    <TouchableOpacity
                      style={styles.resumeBtn}
                      onPress={() => handleOpenResume(item.resumeUri!, item.resumeFileName)}
                    >
                      <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
                      <Text style={styles.resumeBtnText}>{item.resumeFileName || 'View resume'}</Text>
                    </TouchableOpacity>
                  ) : null}

                  <AiReviewPanel
                    application={item}
                    applicant={user}
                    job={job}
                    ratedJobsCount={ratedJobs}
                    onReviewSaved={saveApplicationAiReview}
                  />

                  {item.status === 'applied' ? (
                    <View style={styles.decisionRow}>
                      <TouchableOpacity
                        style={[styles.acceptBtn, busy && styles.btnDisabled]}
                        onPress={() => handleAccept(item.id, user.name, user.phone)}
                        disabled={busy}
                      >
                        <Text style={styles.acceptBtnText}>{busy ? '...' : 'Accept'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.rejectBtn, busy && styles.btnDisabled]}
                        onPress={() => handleReject(item.id)}
                        disabled={busy}
                      >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {item.status === 'accepted' ? (
                    <TouchableOpacity
                      style={[styles.completeBtn, busy && styles.btnDisabled]}
                      onPress={() => handleMarkComplete(item.id)}
                      disabled={busy}
                    >
                      <Ionicons name="checkmark-done" size={18} color={theme.colors.onPrimary} />
                      <Text style={styles.completeBtnText}>Mark job as complete</Text>
                    </TouchableOpacity>
                  ) : null}

                  {item.status === 'completed' ? (
                    <>
                      <View style={styles.rateSection}>
                        <Text style={styles.sectionTitle}>Rate worker</Text>
                        <View style={styles.actions}>
                          <StarRating
                            value={localRating[item.id] || item.rating || 0}
                            onChange={(n) => setLocalRating((s) => ({ ...s, [item.id]: n }))}
                          />
                          <TouchableOpacity style={styles.rateBtn} onPress={() => handleRate(item.id)}>
                            <Text style={{ color: 'white' }}>Rate</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {item.paymentStatus === 'paid' ? (
                        <View style={styles.paidBanner}>
                          <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                          <Text style={styles.paidText}>
                            Collected · ref {item.paymentReference}
                            {item.paymentPhone ? ` · from ${item.paymentPhone}` : ''}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.payBtn}
                          onPress={() =>
                            setPaymentTarget({
                              applicationId: item.id,
                              workerName: user.name,
                            })
                          }
                        >
                          <Ionicons name="wallet-outline" size={18} color={theme.colors.onPrimary} />
                          <Text style={styles.payBtnText}>Collect via mobile money</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : null}
                </View>
              );
            }}
          />
        )}
      </View>

      <PaymentModal
        visible={Boolean(paymentTarget)}
        workerName={paymentTarget?.workerName || ''}
        defaultPhone={currentUser?.phone || ''}
        onClose={() => setPaymentTarget(null)}
        onPay={handlePayment}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, padding: theme.spacing.md },
  muted: { color: theme.colors.muted },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '700', fontSize: 16, color: theme.colors.text },
  statusBadge: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
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
  decisionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  acceptBtn: {
    flex: 1,
    backgroundColor: theme.colors.success,
    padding: 12,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  acceptBtnText: { color: theme.colors.onPrimary, fontWeight: '700' },
  rejectBtn: {
    flex: 1,
    backgroundColor: theme.colors.danger,
    padding: 12,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  rejectBtnText: { color: theme.colors.onPrimary, fontWeight: '700' },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: theme.radii.sm,
    marginTop: 16,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  completeBtnText: { color: theme.colors.onPrimary, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  rateSection: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.colors.surfaceVariant },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  rateBtn: { backgroundColor: theme.colors.primary, padding: 8, borderRadius: 8 },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    padding: 12,
    borderRadius: theme.radii.sm,
    marginTop: 12,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  payBtnText: { color: theme.colors.onPrimary, fontWeight: '700', fontSize: 14 },
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: '#DCFCE7',
    borderRadius: theme.radii.sm,
  },
  paidText: { color: theme.colors.success, fontSize: 13, fontWeight: '600', flex: 1 },
});
