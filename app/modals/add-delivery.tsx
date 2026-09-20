import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Alert } from 'react-native';
import { addDelivery } from '../../services/deliveryService';
import { router } from 'expo-router';
import AccountPicker from '../../components/AccountPicker';
import DatePicker from '../../components/DatePicker';
import ScreenHeader from '../../components/ScreenHeader';
import DismissKeyboardView from '../../components/DismissKeyboardView';
import { colors, radius, shadow, spacing } from '../../constants/theme';

export default function AddDelivery() {
  const [accountId, setAccountId] = useState('');
  const [qty, setQty] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [deliveryMode, setDeliveryMode] = useState<'credit' | 'cash'>('credit');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!accountId || !qty || Number(qty) <= 0) {
      Alert.alert('Invalid input', 'Please select an account and enter a valid quantity.');
      return;
    }

    try {
  setSaving(true);
  const onCredit = deliveryMode === 'credit';
  await addDelivery(accountId, Number(qty), onCredit, date);
      Alert.alert('Saved', onCredit ? 'Credit delivery has been recorded.' : 'Cash delivery has been recorded.');
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
        <ScreenHeader title="Add Delivery" showBack />
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
        {/* Date picker */}
        <DatePicker value={date} onChange={setDate} />

        <View style={styles.creditRow}>
          <Text style={styles.creditTitle}>Delivery type</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[styles.modeButton, deliveryMode === 'credit' ? styles.modeButtonActive : null]}
              onPress={() => setDeliveryMode('credit')}
            >
              <Text style={[styles.modeButtonText, deliveryMode === 'credit' ? styles.modeButtonTextActive : null]}>
                On Credit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, deliveryMode === 'cash' ? styles.modeButtonActive : null]}
              onPress={() => setDeliveryMode('cash')}
            >
              <Text style={[styles.modeButtonText, deliveryMode === 'cash' ? styles.modeButtonTextActive : null]}>
                Cash
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.creditSubtext}>
            {deliveryMode === 'credit'
              ? 'Balance will increase for this account.'
              : 'Cash delivery will not increase account balance.'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !canSave ? styles.buttonDisabled : null]}
          disabled={!canSave}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Delivery'}</Text>
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
  creditRow: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  creditTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#E0F2FE',
  },
  modeButtonText: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  creditSubtext: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
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