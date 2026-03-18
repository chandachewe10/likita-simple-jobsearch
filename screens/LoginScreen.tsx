import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../hooks/useData';
import theme from '../lib/theme';

export default function LoginScreen() {
  const { login } = useData();
  const nav = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!user) return Alert.alert('Login failed', 'Invalid credentials');
      // navigation will be handled by main App since currentUser changed
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to access your account</Text>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TouchableOpacity style={styles.primary} onPress={handleLogin} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <Text style={styles.muted}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => nav.navigate('SignUp' as any)}>
            <Text style={styles.link}> Create one</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 16 }}>
          <Text style={styles.smallMuted}>Demo accounts: employer@acme.test / password | jane@doe.test / password</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, marginTop: theme.spacing.lg },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  subtitle: { color: theme.colors.muted, marginTop: 6, marginBottom: 16 },
  input: { backgroundColor: theme.colors.surface, padding: 12, borderRadius: theme.radii.sm, marginTop: 12, borderWidth: 1, borderColor: theme.colors.surfaceVariant },
  primary: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: theme.radii.md, marginTop: 18, alignItems: 'center' },
  primaryText: { color: theme.colors.onPrimary, fontWeight: '700' },
  row: { flexDirection: 'row', marginTop: 12 },
  muted: { color: theme.colors.muted },
  link: { color: theme.colors.primary, marginLeft: 6 },
  smallMuted: { color: theme.colors.muted, fontSize: theme.type.small },
});