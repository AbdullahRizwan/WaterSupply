import { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAccounts } from '../hooks/useAccounts';
import { colors, radius, shadow, spacing } from '../constants/theme';
import { useDeliveries } from '../hooks/useDeliveries';
import { usePayments } from '../hooks/usePayments';
import { buildOutstandingLedger, computeOutstandingAccounts } from '../utils/helpers';

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Date unavailable';
  return date.toLocaleString();
}

export default function Home() {
  const { accounts } = useAccounts();
  const { deliveries } = useDeliveries();
  const { payments } = usePayments();

  const outstandingByAccountId = useMemo(() => buildOutstandingLedger(deliveries, payments), [deliveries, payments]);

  const dueAccounts = useMemo(
    () => computeOutstandingAccounts(accounts, outstandingByAccountId),
    [accounts, outstandingByAccountId]
  );

  const totalDue = dueAccounts.reduce((sum, a) => sum + (a.computedBalanceBottles || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Outstanding</Text>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryText}>{totalDue} bottles</Text>
        </View>
      </View>

      <FlatList
        data={dueAccounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>All clear 🎉</Text>
            <Text style={styles.emptySubtitle}>No outstanding balances right now.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/accounts/${item.id}`)}>
            <View style={styles.card}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.computedBalanceBottles} bottles due</Text>
              <Text style={styles.cardSubMeta}>Added: {formatDate(item.createdAt)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/modals/add-delivery')}>
          <Text style={styles.primaryButtonText}>+ Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/modals/add-payment')}>
          <Text style={styles.primaryButtonText}>+ Payment</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/accounts')}>
        <Text style={styles.secondaryButtonText}>View all accounts</Text>
      </TouchableOpacity>

      <View style={styles.quickLinksRow}>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/deliveries')}>
          <Text style={styles.linkButtonText}>Deliveries</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/payments')}>
          <Text style={styles.linkButtonText}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/reports')}>
          <Text style={styles.linkButtonText}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryChip: {
    backgroundColor: colors.successTint,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  summaryText: {
    color: colors.successText,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadow.card,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardMeta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  cardSubMeta: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: 6,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  quickLinksRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  linkButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkButtonText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
});