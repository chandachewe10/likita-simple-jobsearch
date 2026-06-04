import React from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../hooks/useData';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import theme from '../lib/theme';
import { isProfileComplete } from '../lib/profile';

export default function EmployeeHome({ navigation }: any) {
  const { state, currentUser } = useData();
  const profileReady = currentUser ? isProfileComplete(currentUser) : false;

  const skills = currentUser?.skills || [];
  const filtered = state.jobs.filter((j) => j.skillsRequired.some((s) => skills.includes(s)));

  const hasApplied = (jobId: string) => {
    return state.applications.some(a => a.jobId === jobId && a.employeeId === currentUser?.id);
  };

  const handleApplyPress = (jobId: string) => {
    if (!profileReady) {
      Alert.alert(
        'Complete your profile first',
        'Add your phone number and save your profile before applying for jobs.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => navigation.getParent()?.navigate('Profile') },
        ]
      );
      return;
    }
    navigation.navigate('ApplyJob', { jobId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader showLogo title="Jobs for you" />
      <View style={styles.content}>
        {!profileReady ? (
          <TouchableOpacity
            style={styles.profileBanner}
            onPress={() => navigation.getParent()?.navigate('Profile')}
          >
            <Text style={styles.profileBannerText}>
              Complete your profile before you can apply for jobs →
            </Text>
          </TouchableOpacity>
        ) : null}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>No matching jobs found. Update your skills to see more.</Text>
          </View>
        ) : (
          <FlatList 
            data={filtered} 
            keyExtractor={(i) => i.id} 
            renderItem={({ item }) => {
              const applied = hasApplied(item.id);
              const label = applied ? "✅ Applied" : "Apply";
              return (
                <JobCard 
                  job={item} 
                  onPress={() => (applied ? undefined : handleApplyPress(item.id))} 
                  actionLabel={label} 
                  disabled={applied}
                />
              );
            }} 
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, paddingHorizontal: theme.spacing.md },
  profileBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  profileBannerText: { color: '#92400E', fontSize: 13, fontWeight: '600' },
  empty: { padding: theme.spacing.lg, alignItems: 'center' },
  muted: { color: theme.colors.muted },
});