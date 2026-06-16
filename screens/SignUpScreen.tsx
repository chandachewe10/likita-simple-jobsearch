import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PREDEFINED_SKILLS = [
  'Auto Mechanic', 'Bricklaying', 'Carpentry', 'Cleaning', 'Cook/Chef',
  'Dish Installation', 'Driving', 'Electrical works', 'HVAC Repair',
  'Landscaping', 'Masonry', 'Painting', 'Pest Control', 'Plumbing',
  'Roofing', 'Tiling', 'Welding'
];

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../hooks/useData';
import AppHeader from '../components/AppHeader';
import LikitaLogo from '../components/LikitaLogo';
import theme from '../lib/theme';

export default function SignUpScreen() {
  const { signUp } = useData();
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employee' | 'employer'>('employee');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = PREDEFINED_SKILLS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSignUp = async () => {
    if (!name || !email || !password) return Alert.alert('Missing fields', 'Please complete all fields');
    if (role === 'employee' && selectedSkills.length === 0) return Alert.alert('Missing fields', 'Please select at least one skill');
    setLoading(true);
    try {
      const payload: any = { name, email, password, role };
      if (role === 'employee') payload.skills = selectedSkills;
      await signUp(payload);
      // success — user is now signed in by provider
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppHeader showBack title="Create account" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <LikitaLogo size="md" style={styles.logo} />
        <Text style={styles.title}>Join Likita</Text>
        <Text style={styles.subtitle}>Choose role and enter details</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity onPress={() => setRole('employee')} style={[styles.roleBtn, role === 'employee' && styles.roleActive]}>
            <Text style={role === 'employee' ? styles.roleTextActive : styles.roleText}>Employee</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRole('employer')} style={[styles.roleBtn, role === 'employer' && styles.roleActive]}>
            <Text style={role === 'employer' ? styles.roleTextActive : styles.roleText}>Employer</Text>
          </TouchableOpacity>
        </View>
        <TextInput placeholder="Full name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        {role === 'employee' && (
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
        )}
        <TouchableOpacity style={styles.primary} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Creating...' : 'Create account'}</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 12, flexDirection: 'row' }}>
          <Text style={styles.muted}>Have an account?</Text>
          <TouchableOpacity onPress={() => nav.navigate('Login' as any)}>
            <Text style={styles.link}> Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32, flexGrow: 1 },
  content: { padding: theme.spacing.md, marginTop: theme.spacing.md },
  logo: { marginBottom: 16 },
  title: { fontSize: theme.type.display, fontWeight: '700', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginTop: 6, marginBottom: 12, fontSize: theme.type.body },
  roleBtn: { padding: 12, borderRadius: theme.radii.sm, backgroundColor: theme.colors.surfaceVariant, marginRight: 12 },
  roleActive: { backgroundColor: theme.colors.primary },
  roleText: { color: theme.colors.text, fontSize: theme.type.body },
  roleTextActive: { color: theme.colors.onPrimary, fontWeight: '700', fontSize: theme.type.body },
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
  muted: { color: theme.colors.muted, fontSize: theme.type.body },
  link: { color: theme.colors.primary, marginLeft: 6, fontSize: theme.type.body },
});