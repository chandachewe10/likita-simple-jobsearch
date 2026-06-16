import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapPicker from '../components/MapPicker';
import AppHeader from '../components/AppHeader';
import { useData } from '../hooks/useData';
import theme from '../lib/theme';
import { isProfileComplete, profileMissingFields } from '../lib/profile';

const PREDEFINED_SKILLS = [
  'Auto Mechanic', 'Bricklaying', 'Carpentry', 'Cleaning', 'Cook/Chef',
  'Dish Installation', 'Driving', 'Electrical works', 'HVAC Repair',
  'Landscaping', 'Masonry', 'Painting', 'Pest Control', 'Plumbing',
  'Roofing', 'Tiling', 'Welding'
];

export default function ProfileScreen() {
  const { currentUser, updateProfile, logout } = useData();
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [nrc, setNrc] = useState(currentUser?.nrc || '');
  const [qualifications, setQualifications] = useState(currentUser?.qualifications || '');
  const [location, setLocation] = useState(currentUser?.location || null);
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>(currentUser?.skills || []);
  const [isSkillsModalVisible, setSkillsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMapVisible, setMapVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(currentUser?.location || { latitude: -15.3875, longitude: 28.3228 });

  const filteredSkills = PREDEFINED_SKILLS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const payload: any = { phone, address, nrc, qualifications, location };
      if (currentUser?.role === 'employee') payload.skills = selectedSkills;
      await updateProfile(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  const complete = isProfileComplete(currentUser);
  const missing = profileMissingFields(currentUser);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader showLogo title="Your Profile" subtitle="Contact info & documents" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {!complete ? (
          <View style={styles.setupBanner}>
            <Text style={styles.setupTitle}>Complete your profile</Text>
            <Text style={styles.setupText}>
              {currentUser.role === 'employee'
                ? `Add your ${missing.join(' and ')} before applying for jobs.`
                : `Add your ${missing.join(' and ')} to get the most from Likita.`}
            </Text>
          </View>
        ) : null}

        <TextInput placeholder="Phone Number" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
        <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />
        
        <TouchableOpacity style={styles.mapBtn} onPress={() => setMapVisible(true)}>
          <Ionicons name="location" size={20} color={theme.colors.primary} />
          <Text style={styles.mapBtnText}>
            {location ? `GPS Set (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})` : 'Set GPS Location on Map'}
          </Text>
        </TouchableOpacity>

        <TextInput placeholder="NRC Number" value={nrc} onChangeText={setNrc} style={styles.input} />
        
        <TextInput 
          placeholder="Summary of Qualifications / Experience" 
          value={qualifications} 
          onChangeText={setQualifications} 
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
          multiline 
        />

        {currentUser?.role === 'employee' && (
          <View style={styles.skillsContainer}>
            <TouchableOpacity style={styles.dropdownToggle} onPress={() => setSkillsModalVisible(true)}>
              <Text style={styles.dropdownToggleText}>
                {selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : 'Update Your Skills...'}
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
            
            <Modal visible={isSkillsModalVisible} animationType="slide" transparent>
              <View style={styles.skillsModalOverlay}>
                <View style={styles.skillsModalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Update Your Skills</Text>
                    <TouchableOpacity onPress={() => setSkillsModalVisible(false)}>
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
                  <TouchableOpacity style={styles.primary} onPress={() => setSkillsModalVisible(false)}>
                    <Text style={styles.primaryText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        )}

        <TouchableOpacity style={[styles.primary, saveSuccess && { backgroundColor: theme.colors.success }]} onPress={handleSave} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Saving...' : saveSuccess ? '✅ Saved Successfully!' : 'Save Profile'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.primary, { backgroundColor: theme.colors.surfaceVariant, marginTop: 40 }]} onPress={logout}>
          <Text style={[styles.primaryText, { color: theme.colors.danger }]}>Log Out</Text>
        </TouchableOpacity>

        <Modal visible={isMapVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setMapVisible(false)}>
                <Text style={{ color: theme.colors.primary, fontSize: theme.type.headline }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: theme.type.title, fontWeight: '700' }}>Pin Location</Text>
              <TouchableOpacity onPress={() => { setLocation(tempLocation); setMapVisible(false); }}>
                <Text style={{ color: theme.colors.primary, fontSize: theme.type.headline, fontWeight: '700' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
            <MapPicker tempLocation={tempLocation} setTempLocation={setTempLocation} />
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { padding: theme.spacing.md, paddingBottom: 40, flexGrow: 1 },
  setupBanner: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: theme.radii.sm,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  setupTitle: { fontSize: theme.type.subtitle, fontWeight: '700', color: theme.colors.text },
  setupText: { fontSize: theme.type.caption, color: theme.colors.muted, marginTop: 4, lineHeight: theme.lineHeight.small },
  input: { ...theme.inputStyle, marginTop: 12 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceVariant, padding: 14, borderRadius: theme.radii.sm, marginTop: 12, borderWidth: 1, borderColor: theme.colors.outline },
  mapBtnText: { color: theme.colors.primary, marginLeft: 8, fontWeight: '600', fontSize: theme.type.body },
  primary: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.radii.md, marginTop: 18, alignItems: 'center' },
  primaryText: { color: theme.colors.onPrimary, fontWeight: '700', fontSize: theme.type.body },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant },
  modalTitle: { fontSize: theme.type.title, fontWeight: '700', color: theme.colors.text },
  skillsContainer: { marginTop: 12 },
  dropdownToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...theme.inputStyle, marginTop: 0 },
  dropdownToggleText: { color: theme.colors.text, fontSize: theme.type.body },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  skillPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: theme.colors.surfaceVariant, borderWidth: 1, borderColor: theme.colors.outline },
  skillPillSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  skillPillText: { color: theme.colors.text, fontSize: theme.type.caption },
  skillPillTextSelected: { color: theme.colors.onPrimary, fontWeight: '600', fontSize: theme.type.caption },
  skillsModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  skillsModalContent: { backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radii.lg, borderTopRightRadius: theme.radii.lg, padding: theme.spacing.md, maxHeight: '80%' },
  searchInput: { ...theme.inputStyle, marginBottom: 12, marginTop: 0 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant },
  dropdownItemText: { fontSize: theme.type.headline, color: theme.colors.text },
  dropdownItemTextSelected: { fontWeight: '700', color: theme.colors.primary, fontSize: theme.type.headline },
});
