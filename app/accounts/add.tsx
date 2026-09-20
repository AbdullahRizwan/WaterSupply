import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radius, spacing } from '../../constants/theme';
import { addAccount } from '../../services/accountService';
import DismissKeyboardView from '../../components/DismissKeyboardView';
import DatePicker from '../../components/DatePicker';

export default function AddAccount() {
  const [name, setName] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [date, setDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && Number(openingBalance || 0) >= 0;

  const handleSave = async () => {
    if (!canSave || saving) {
      Alert.alert('Invalid input', 'Please enter a valid account name and balance.');
      return;
    }

    try {
      setSaving(true);
      await addAccount(name, Number(openingBalance || 0), date);
      Alert.alert('Success', 'Account created successfully.');
      router.back();
    } catch (error: any) {
      const reason = error?.code || error?.message || 'unknown-error';
      if (reason === 'timeout' || String(reason).toLowerCase().includes('timed out')) {
        Alert.alert('Unable to save', 'Request timed out. Check your internet and Firebase rules, then try again.');
      } else {
        Alert.alert('Unable to save', `Firebase error: ${reason}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DismissKeyboardView>
        <ScreenHeader title="Add Account" showBack />

        <View style={styles.formCard}>
          <Text style={styles.label}>Customer name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ravi Kumar"
            style={styles.input}
          />

          <Text style={styles.label}>Opening balance (bottles)</Text>
          <TextInput
            value={openingBalance}
            onChangeText={setOpeningBalance}
            keyboardType="numeric"
            placeholder="0"
            style={styles.input}
          />

          <Text style={styles.label}>Date</Text>
          <DatePicker value={date} onChange={setDate} />

          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave || saving}
            style={[styles.button, (!canSave || saving) && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>
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
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 13,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
