import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import { useData } from '../hooks/useData';
import theme from '../lib/theme';

const PREDEFINED_SKILLS = [
  'Auto Mechanic', 'Bricklaying', 'Carpentry', 'Cleaning', 'Cook/Chef',
  'Dish Installation', 'Driving', 'Electrical works', 'HVAC Repair',
  'Landscaping', 'Masonry', 'Painting', 'Pest Control', 'Plumbing',
  'Roofing', 'Tiling', 'Welding'
];

export default function PostJob({ navigation }: any) {
  const { postJob, currentUser } = useData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = PREDEFINED_SKILLS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  const handlePost = async () => {
    if (!title || !description) return Alert.alert('Missing fields', 'Please add title and description');
    if (selectedSkills.length === 0) return Alert.alert('Missing skills', 'Please select at least one skill required');
    setLoading(true);
    try {
      await postJob({ title, description, skillsRequired: selectedSkills, employerId: currentUser!.id });
      Alert.alert('Posted', 'Job posted successfully');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Post a new job" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput placeholder="Job title" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={[styles.input, { height: 120, textAlignVertical: 'top' }]} multiline />
        
        <View style={styles.skillsContainer}>
            <TouchableOpacity style={styles.dropdownToggle} onPress={() => setModalVisible(true)}>
              <Text style={styles.dropdownToggleText}>
                {selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : 'Select Skills...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.colors.muted} />
            </TouchableOpacity>
            
            {selectedSkills.length > 0 && (
              <View style={styles.skillsGrid}>
                {selectedSkills.map(skill => (
                  <View key={skill} style={[styles.skillPill, styles.skillPillSelected]}>
                    <Text style={[styles.skillPillText, styles.skillPillTextSelected]}>{skill}</Text>
                    <TouchableOpacity onPress={() => setSelectedSkills(prev => prev.filter(s => s !== skill))} style={{ marginLeft: 6 }}>
                      <Ionicons name="close-circle" size={16} color={theme.colors.onPrimary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            <Modal visible={isModalVisible} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Skills</Text>
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
                    data={filteredSkills}
                    keyExtractor={(item) => item}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => {
                      const isSelected = selectedSkills.includes(item);
                      return (
                        <TouchableOpacity 
                          style={styles.dropdownItem} 
                          onPress={() => {
                            if (isSelected) {
                                setSelectedSkills(prev => prev.filter(s => s !== item));
                            } else {
                                setSelectedSkills(prev => [...prev, item]);
                            }
                          }}
                        >
                          <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>{item}</Text>
                          {isSelected && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                        </TouchableOpacity>
                      );
                    }}
                  />
                  <TouchableOpacity style={styles.primary} onPress={() => setModalVisible(false)}>
                    <Text style={styles.primaryText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
        </View>

        <TouchableOpacity style={styles.primary} onPress={handlePost} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Posting...' : 'Post job'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, paddingBottom: 32, flexGrow: 1 },
  input: { ...theme.inputStyle, marginTop: 12 },
  skillsContainer: { marginTop: 12 },
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.inputStyle,
    marginTop: 0,
  },
  dropdownToggleText: { color: theme.colors.text, fontSize: theme.type.body },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  skillPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: theme.colors.surfaceVariant, borderWidth: 1, borderColor: theme.colors.outline },
  skillPillSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  skillPillText: { color: theme.colors.text, fontSize: theme.type.caption },
  skillPillTextSelected: { color: theme.colors.onPrimary, fontWeight: '600', fontSize: theme.type.caption },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radii.lg, borderTopRightRadius: theme.radii.lg, padding: theme.spacing.md, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: theme.type.title, fontWeight: '700', color: theme.colors.text },
  searchInput: { ...theme.inputStyle, marginBottom: 12, marginTop: 0 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant },
  dropdownItemText: { fontSize: theme.type.headline, color: theme.colors.text },
  dropdownItemTextSelected: { fontWeight: '700', color: theme.colors.primary, fontSize: theme.type.headline },
  primary: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.radii.md, marginTop: 18, alignItems: 'center' },
  primaryText: { color: theme.colors.onPrimary, fontWeight: '700', fontSize: theme.type.body },
});