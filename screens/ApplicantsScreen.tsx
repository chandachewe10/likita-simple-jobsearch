import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../hooks/useData';
import theme from '../lib/theme';
import StarRating from '../components/StarRating';

export default function ApplicantsScreen({ route }: any) {
  const { jobId } = route.params;
  const { state, rateApplication } = useData();
  const apps = state.applications.filter((a) => a.jobId === jobId);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {apps.length === 0 ? (
          <View style={{ padding: 16 }}><Text style={styles.muted}>No applicants yet.</Text></View>
        ) : (
          <FlatList data={apps} keyExtractor={(i) => i.id} renderItem={({ item }) => {
            const user = state.users.find((u) => u.id === item.employeeId);
            return (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.name}>{user?.name}</Text>
                  <Text style={styles.smallMuted}>{item.status}</Text>
                </View>
                <Text style={styles.muted}>{user?.skills?.join(', ')}</Text>
                <Text style={{ marginTop: 8 }}>{item.coverLetter}</Text>
                <View style={styles.actions}>
                  <StarRating value={localRating[item.id] || 0} onChange={(n) => setLocalRating((s) => ({ ...s, [item.id]: n }))} />
                  <TouchableOpacity style={styles.rateBtn} onPress={() => handleRate(item.id)}>
                    <Text style={{ color: 'white' }}>Rate</Text>
                  </TouchableOpacity>
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
  content: { padding: theme.spacing.md },
  muted: { color: theme.colors.muted },
  card: { backgroundColor: theme.colors.surface, padding: 12, borderRadius: theme.radii.md, marginBottom: theme.spacing.md },
  name: { fontWeight: '700' },
  smallMuted: { color: theme.colors.muted },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  rateBtn: { backgroundColor: theme.colors.primary, padding: 8, borderRadius: 8 },
});