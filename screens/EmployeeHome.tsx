import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../hooks/useData';
import JobCard from '../components/JobCard';
import theme from '../lib/theme';

export default function EmployeeHome({ navigation }: any) {
  const { state, currentUser, applyToJob } = useData();

  const skills = currentUser?.skills || [];
  const filtered = state.jobs.filter((j) => j.skillsRequired.some((s) => skills.includes(s)));

  const hasApplied = (jobId: string) => {
    return state.applications.some(a => a.jobId === jobId && a.employeeId === currentUser?.id);
  };

  const [applyingId, setApplyingId] = React.useState<string | null>(null);

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    try {
      await applyToJob(jobId, currentUser!.id);
      // The UI automatically updates to "✅ Applied!" - no alert required natively.
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not apply');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs for you</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile' as any)}>
          <Text style={styles.link}>Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
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
              const label = applied ? "✅ Applied" : applyingId === item.id ? "Applying..." : "Apply";
              return (
                <JobCard 
                  job={item} 
                  onPress={() => handleApply(item.id)} 
                  actionLabel={label} 
                  disabled={applied || applyingId === item.id}
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
  header: { padding: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  link: { color: theme.colors.primary },
  content: { paddingHorizontal: theme.spacing.md },
  empty: { padding: theme.spacing.lg, alignItems: 'center' },
  muted: { color: theme.colors.muted },
});