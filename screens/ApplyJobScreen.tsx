import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useData } from '../hooks/useData';
import theme from '../lib/theme';
import { pickResume, type ResumeFile } from '../lib/resume';

export default function ApplyJobScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const { state, currentUser, applyToJob } = useData();
  const job = state.jobs.find((j) => j.id === jobId);

  const [coverLetter, setCoverLetter] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [resume, setResume] = useState<ResumeFile | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickResume = async () => {
    const file = await pickResume();
    if (file) setResume(file);
  };

  const handleSubmit = async () => {
    const years = Number(yearsOfExperience.trim());
    if (!yearsOfExperience.trim() || Number.isNaN(years) || years < 0) {
      return Alert.alert('Missing field', 'Please enter your years of experience (0 or more).');
    }

    setLoading(true);
    try {
      await applyToJob(jobId, currentUser!.id, {
        coverLetter: coverLetter.trim() || undefined,
        yearsOfExperience: years,
        resumeUri: resume?.uri,
        resumeFileName: resume?.name,
      });
      Alert.alert('Applied', 'Your application was submitted successfully');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not apply');
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader title="Apply" showBack />
        <View style={styles.content}>
          <Text style={styles.muted}>Job not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Apply for job" subtitle={job.title} showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Years of experience *</Text>
        <TextInput
          placeholder="e.g. 3"
          value={yearsOfExperience}
          onChangeText={setYearsOfExperience}
          style={styles.input}
          keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'}
          inputMode="numeric"
        />

        <Text style={styles.label}>Application letter (optional)</Text>
        <TextInput
          placeholder="Write a short message to the employer..."
          value={coverLetter}
          onChangeText={setCoverLetter}
          style={[styles.input, styles.textArea]}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Resume (optional)</Text>
        <Text style={styles.hint}>PDF or Word, max 2 MB{Platform.OS === 'web' ? ' — stored in this browser' : ''}</Text>
        <TouchableOpacity style={styles.attachBtn} onPress={handlePickResume}>
          <Ionicons name="document-attach-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.attachBtnText}>
            {resume ? resume.name : 'Attach resume (PDF or Word)'}
          </Text>
        </TouchableOpacity>
        {resume && (
          <TouchableOpacity style={styles.removeBtn} onPress={() => setResume(null)}>
            <Ionicons name="close-circle" size={18} color={theme.colors.danger} />
            <Text style={styles.removeBtnText}>Remove attachment</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.primary} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Submitting...' : 'Submit application'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginTop: 12, marginBottom: 6 },
  hint: { fontSize: 12, color: theme.colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
    fontSize: 14,
    color: theme.colors.text,
  },
  textArea: { height: 140 },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderStyle: 'dashed',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  attachBtnText: { color: theme.colors.primary, fontSize: 14, flex: 1 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  removeBtnText: { color: theme.colors.danger, fontSize: 13 },
  primary: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: theme.radii.md,
    marginTop: 24,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  primaryText: { color: theme.colors.onPrimary, fontWeight: '700' },
  muted: { color: theme.colors.muted, padding: theme.spacing.md },
});
