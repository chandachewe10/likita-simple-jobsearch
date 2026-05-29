import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Application, Job, User } from '../types';
import { generateApplicantReview, recommendationColor, recommendationLabel } from '../lib/aiReview';
import theme from '../lib/theme';

type Props = {
  application: Application;
  applicant: User;
  job: Job;
  ratedJobsCount: number;
  onReviewSaved: (applicationId: string, review: NonNullable<Application['aiReview']>) => Promise<void>;
};

export default function AiReviewPanel({ application, applicant, job, ratedJobsCount, onReviewSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localReview, setLocalReview] = useState(application.aiReview);

  useEffect(() => {
    setLocalReview(application.aiReview);
  }, [application.aiReview]);

  const review = localReview ?? application.aiReview;
  const missingExperience = application.yearsOfExperience == null;

  const handleGenerate = async () => {
    if (missingExperience) {
      setError('This application was submitted before years of experience was required. Ask the applicant to re-apply.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateApplicantReview({
        jobTitle: job.title,
        jobDescription: job.description,
        skillsRequired: job.skillsRequired,
        applicantName: applicant.name,
        applicantSkills: applicant.skills || [],
        qualifications: applicant.qualifications,
        previousRating: applicant.rating,
        ratedJobsCount,
        yearsOfExperience: application.yearsOfExperience!,
        coverLetter: application.coverLetter,
      });
      setLocalReview(result);
      await onReviewSaved(application.id, result);
    } catch (e: any) {
      setError(e.message || 'Could not generate recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>AI recommendation</Text>

      {missingExperience ? (
        <Text style={styles.notice}>
          This applicant has no years of experience on file. They need to submit a new application.
        </Text>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {review ? (
        <View style={styles.reviewBox}>
          <View style={[styles.badge, { backgroundColor: recommendationColor(review.recommendation) }]}>
            <Ionicons name="sparkles" size={14} color="#fff" />
            <Text style={styles.badgeText}>{recommendationLabel(review.recommendation)}</Text>
          </View>
          <Text style={styles.summary}>{review.summary}</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleGenerate}
            disabled={loading || missingExperience}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons name="refresh" size={16} color={theme.colors.primary} />
                <Text style={styles.refreshText}>Refresh review</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.generateBtn, (loading || missingExperience) && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={loading || missingExperience}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              <Text style={styles.generateText}>Analyzing applicant...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color={theme.colors.onPrimary} />
              <Text style={styles.generateText}>Get AI recommendation</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
  notice: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: 8,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: theme.radii.sm,
    padding: 10,
    marginBottom: 8,
  },
  errorText: { flex: 1, color: theme.colors.danger, fontSize: 13, lineHeight: 18 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: theme.radii.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateText: { color: theme.colors.onPrimary, fontWeight: '700', fontSize: 14 },
  reviewBox: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radii.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  summary: { fontSize: 14, color: theme.colors.text, lineHeight: 20 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  refreshText: { color: theme.colors.primary, fontWeight: '600', fontSize: 13 },
});
