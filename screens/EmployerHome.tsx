import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../hooks/useData';
import JobCard from '../components/JobCard';
import theme from '../lib/theme';

export default function EmployerHome({ navigation }: any) {
  const { state, currentUser } = useData();

  const myJobs = state.jobs.filter((j) => j.employerId === currentUser?.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My posted jobs</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PostJob' as any)}>
          <Text style={styles.link}>Post job</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {myJobs.length === 0 ? (
          <View style={styles.empty}><Text style={styles.muted}>No jobs yet. Post a job to get applicants.</Text></View>
        ) : (
          <FlatList data={myJobs} keyExtractor={(i) => i.id} renderItem={({ item }) => (
            <JobCard job={item} onPress={() => navigation.navigate('Applicants' as any, { jobId: item.id })} actionLabel="Applicants" />
          )} />
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