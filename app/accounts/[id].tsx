import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useAccounts } from '../../hooks/useAccounts';
import { colors, radius, shadow, spacing } from '../../constants/theme';
import ScreenHeader from '../../components/ScreenHeader';
import { useDeliveries } from '../../hooks/useDeliveries';
import { usePayments } from '../../hooks/usePayments';
import { buildOutstandingLedger, getComputedBalance } from '../../utils/helpers';
import { deleteAccount } from '../../services/accountService';

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Date unavailable';
  return date.toLocaleString();
}

export default function AccountDetail() {
  const { id } = useLocalSearchParams();
  const { getAccountById } = useAccounts();
  const accountId = id as string;
  const { deliveries } = useDeliveries(accountId);
  const { payments } = usePayments(accountId);
  const [deleting, setDeleting] = useState(false);

  const account = getAccountById(accountId);

  const computedBalance = useMemo(() => {
    const ledger = buildOutstandingLedger(deliveries, payments);

    if (deliveries.length === 0 && payments.length === 0) {
      return Number(account?.balanceBottles || 0);
    }

    return getComputedBalance(accountId, ledger, Number(account?.balanceBottles || 0));
  }, [deliveries, payments, account?.balanceBottles]);

  const latestActivityDate = useMemo(() => {
    const deliveryTimes = deliveries.map((d) => d.date?.getTime() ?? 0);
    const paymentTimes = payments.map((p) => p.date?.getTime() ?? 0);
    const latest = Math.max(0, ...deliveryTimes, ...paymentTimes);
    return latest > 0 ? new Date(latest) : null;
  }, [deliveries, payments]);

  const handleDelete = () => {
    if (!account) {
      return;
    }

    Alert.alert(
      'Delete account?',
      `This will permanently delete ${account.name} and all related deliveries/payments.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteAccount(account.id);
              Alert.alert('Deleted', 'Account has been deleted.');
              router.replace('/accounts');
            } catch (error: any) {
              const reason = error?.code || error?.message || 'unknown-error';
              Alert.alert('Unable to delete', `Firebase error: ${reason}`);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (!account) return <Text style={styles.notFound}>Account not found</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Account Detail" showBack />
      <View style={styles.heroCard}>
        <Text style={styles.name}>{account.name}</Text>
        <Text style={styles.metaLine}>Added: {formatDate(account.createdAt)}</Text>
        <Text style={styles.metaLine}>Last activity: {formatDate(latestActivityDate)}</Text>
        <Text style={styles.balanceLabel}>Current balance</Text>
        <Text style={styles.balanceValue}>{computedBalance} bottles</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/modals/add-delivery')}>
        <Text style={styles.primaryButtonText}>+ Give Bottles</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/modals/add-payment')}>
        <Text style={styles.secondaryButtonText}>+ Record Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton, deleting ? styles.deleteButtonDisabled : null]}
        onPress={handleDelete}
        disabled={deleting}
      >
        <Text style={styles.deleteButtonText}>{deleting ? 'Deleting...' : 'Delete Account'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.sm,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.card,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  balanceLabel: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metaLine: {
    marginTop: 2,
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  balanceValue: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  primaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: spacing.xs,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: colors.dangerText,
    fontWeight: '800',
  },
  notFound: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.textSecondary,
  },
});