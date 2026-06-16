import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import WorkerCard from '../components/WorkerCard';
import { useData } from '../hooks/useData';
import { TRADE_SKILLS } from '../lib/skills';
import { filterAndSortWorkers } from '../lib/findWorkers';
import theme from '../lib/theme';

export default function FindWorkersScreen({ navigation }: any) {
  const { state, currentUser } = useData();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const employees = state.users.filter((u) => u.role === 'employee');
  const matches = useMemo(
    () => filterAndSortWorkers(employees, selectedSkills, currentUser?.location),
    [employees, selectedSkills, currentUser?.location]
  );

  const filteredSkillOptions = TRADE_SKILLS.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Find tradespeople" subtitle="Filter by skill · sorted by rating & distance" showBack />

      <View style={styles.content}>
        {!currentUser?.location ? (
          <TouchableOpacity
            style={styles.locationNotice}
            onPress={() => navigation.getParent()?.navigate('Profile')}
          >
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.locationNoticeText}>
              Add your location in Profile to sort workers by distance.
            </Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.filterBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={18} color={theme.colors.primary} />
          <Text style={styles.filterBtnText}>
            {selectedSkills.length > 0
              ? `${selectedSkills.length} skill${selectedSkills.length === 1 ? '' : 's'} selected`
              : 'Filter by trade skill'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.colors.muted} />
        </TouchableOpacity>

        {selectedSkills.length > 0 ? (
          <View style={styles.selectedSkills}>
            {selectedSkills.map((skill) => (
              <TouchableOpacity key={skill} style={styles.selectedPill} onPress={() => toggleSkill(skill)}>
                <Text style={styles.selectedPillText}>{skill}</Text>
                <Ionicons name="close-circle" size={16} color={theme.colors.onPrimary} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setSelectedSkills([])}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.resultCount}>
          {matches.length} tradesperson{matches.length === 1 ? '' : 'people'} found
          {selectedSkills.length === 0 ? ' · showing all skills' : ''}
        </Text>

        {matches.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>No workers match these skills. Try a different filter.</Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.worker.id}
            renderItem={({ item }) => (
              <WorkerCard worker={item.worker} distanceKm={item.distanceKm} />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trade skills</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search skills..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoCapitalize="none"
            />
            <FlatList
              data={filteredSkillOptions}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = selectedSkills.includes(item);
                return (
                  <TouchableOpacity style={styles.modalItem} onPress={() => toggleSkill(item)}>
                    <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                      {item}
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.doneBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, paddingHorizontal: theme.spacing.md },
  locationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceVariant,
    padding: 12,
    borderRadius: theme.radii.sm,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  locationNoticeText: { flex: 1, fontSize: theme.type.caption, color: theme.colors.text, lineHeight: theme.lineHeight.small },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginBottom: 10,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  filterBtnText: { flex: 1, fontSize: theme.type.body, color: theme.colors.text, fontWeight: '600' },
  selectedSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  selectedPillText: { color: theme.colors.onPrimary, fontSize: theme.type.small, fontWeight: '600' },
  clearText: { color: theme.colors.primary, fontSize: theme.type.caption, fontWeight: '600', marginLeft: 4 },
  resultCount: { fontSize: theme.type.caption, color: theme.colors.muted, marginBottom: 8 },
  listContent: { paddingBottom: 24 },
  empty: { padding: theme.spacing.lg, alignItems: 'center' },
  muted: { color: theme.colors.muted, textAlign: 'center', fontSize: theme.type.body },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    padding: theme.spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: theme.type.title, fontWeight: '700', color: theme.colors.text },
  searchInput: { ...theme.inputStyle, marginBottom: 12, marginTop: 0 },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  modalItemText: { fontSize: theme.type.headline, color: theme.colors.text },
  modalItemTextSelected: { fontWeight: '700', color: theme.colors.primary, fontSize: theme.type.headline },
  doneBtn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: theme.radii.md,
    marginTop: 12,
    alignItems: 'center',
  },
  doneBtnText: { color: theme.colors.onPrimary, fontWeight: '700', fontSize: theme.type.body },
});
