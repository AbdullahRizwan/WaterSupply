import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Alert } from 'react-native';
import { addPayment } from '../../services/paymentService';
import { router } from 'expo-router';
import AccountPicker from '../../components/AccountPicker';
import DatePicker from '../../components/DatePicker';
import ScreenHeader from '../../components/ScreenHeader';
import DismissKeyboardView from '../../components/DismissKeyboardView';
import { colors, radius, shadow, spacing } from '../../constants/theme';

export default function AddPayment() {
  const [accountId, setAccountId] = useState('');
  const [qty, setQty] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!accountId || !qty || Number(qty) <= 0) {
      Alert.alert('Invalid input', 'Please select an account and enter a valid quantity.');
      return;
    }

    try {
  setSaving(true);
  await addPayment(accountId, Number(qty), date);
      Alert.alert('Saved', 'Payment has been recorded.');
      router.back();
    } catch (error: any) {
      const reason = error?.code || error?.message || 'unknown-error';
      Alert.alert('Unable to save', `Firebase error: ${reason}`);
    } finally {
      setSaving(false);
    }
  };

  const canSave = Boolean(accountId && qty && Number(qty) > 0) && !saving;

  return (
    <SafeAreaView style={styles.container}>
      <DismissKeyboardView>
        <ScreenHeader title="Record Payment" showBack />
        <Text style={styles.label}>Select account</Text>
        <AccountPicker onSelect={setAccountId} />

        <TextInput
          placeholder="Quantity (bottles)"
          value={qty}
          onChangeText={setQty}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Date</Text>
        <DatePicker value={date} onChange={setDate} />

        <TouchableOpacity
          style={[styles.button, !canSave ? styles.buttonDisabled : null]}
          disabled={!canSave}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Payment'}</Text>
        </TouchableOpacity>
      </DismissKeyboardView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});