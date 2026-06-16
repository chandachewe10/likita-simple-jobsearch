import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import theme from '../lib/theme';

type Props = {
  visible: boolean;
  workerName: string;
  defaultPhone?: string;
  onClose: () => void;
  onPay: (amount: number, operator: 'airtel' | 'mtn', phone: string) => Promise<void>;
};

export default function PaymentModal({
  visible,
  workerName,
  defaultPhone = '',
  onClose,
  onPay,
}: Props) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(defaultPhone);
  const [operator, setOperator] = useState<'airtel' | 'mtn'>('airtel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setPhone(defaultPhone);
      setError(null);
    }
  }, [visible, defaultPhone]);

  const handlePay = async () => {
    const value = Number(amount);
    const phoneTrimmed = phone.trim();
    if (!amount.trim() || Number.isNaN(value) || value <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }
    if (!phoneTrimmed) {
      setError('Enter the mobile money number to collect from.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onPay(value, operator, phoneTrimmed);
      setAmount('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Collection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Collect mobile money payment</Text>
          <Text style={styles.subtitle}>
            Job payment for {workerName}. Enter the amount and the number Lenco should deduct from.
            You may receive a prompt on that phone to approve the collection.
          </Text>

          <Text style={styles.label}>Amount (ZMW)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g. 500"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>Mobile money number (deduct from)</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 0971234567"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Network</Text>
          <View style={styles.operatorRow}>
            {(['airtel', 'mtn'] as const).map((op) => (
              <TouchableOpacity
                key={op}
                style={[styles.operatorBtn, operator === op && styles.operatorBtnActive]}
                onPress={() => setOperator(op)}
              >
                <Text style={[styles.operatorText, operator === op && styles.operatorTextActive]}>
                  {op.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.payBtnText}>Request collection</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    padding: theme.spacing.md,
    paddingBottom: 32,
  },
  title: { fontSize: theme.type.title, fontWeight: '700', color: theme.colors.text },
  subtitle: { fontSize: theme.type.caption, color: theme.colors.muted, marginTop: 4, marginBottom: 16, lineHeight: theme.lineHeight.small },
  label: { fontSize: theme.type.caption, fontWeight: '600', color: theme.colors.text, marginBottom: 6, marginTop: 8 },
  input: { ...theme.inputStyle, borderColor: theme.colors.outline },
  operatorRow: { flexDirection: 'row', gap: 10 },
  operatorBtn: {
    flex: 1,
    padding: 14,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as const } : {}),
  },
  operatorBtnActive: { backgroundColor: theme.colors.primary },
  operatorText: { fontWeight: '600', color: theme.colors.text, fontSize: theme.type.body },
  operatorTextActive: { color: theme.colors.onPrimary, fontSize: theme.type.body },
  error: { color: theme.colors.danger, fontSize: theme.type.caption, marginTop: 10 },
  payBtn: {
    backgroundColor: theme.colors.success,
    padding: 16,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    marginTop: 16,
  },
  payBtnText: { color: theme.colors.onPrimary, fontWeight: '700', fontSize: theme.type.body },
  cancelBtn: { padding: 12, alignItems: 'center', marginTop: 8 },
  cancelText: { color: theme.colors.muted, fontWeight: '600', fontSize: theme.type.body },
});
