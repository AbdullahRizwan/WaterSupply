import dayjs from 'dayjs';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radius, shadow, spacing } from '../../constants/theme';
import { useAccounts } from '../../hooks/useAccounts';
import { useDeliveries } from '../../hooks/useDeliveries';
import { usePayments } from '../../hooks/usePayments';
import { buildOutstandingLedger, buildRecentActivity, computeOutstandingAccounts, computeTodayMetrics } from '../../utils/helpers';

export default function Reports() {
  const { accounts } = useAccounts();
  const { deliveries } = useDeliveries();
  const { payments } = usePayments();

  const outstandingByAccountId = useMemo(() => buildOutstandingLedger(deliveries, payments), [deliveries, payments]);

  const computedOutstanding = useMemo(
    () => computeOutstandingAccounts(accounts, outstandingByAccountId),
    [accounts, outstandingByAccountId]
  );

  const outstandingAccounts = computedOutstanding.filter((a) => a.computedBalanceBottles > 0).length;
  const totalOutstanding = computedOutstanding.reduce((sum, a) => sum + a.computedBalanceBottles, 0);

  const { todayCreditDeliveries, todayCashDeliveries, todayPayments, netToday } = useMemo(
    () => computeTodayMetrics(deliveries, payments),
    [deliveries, payments]
  );

  const recentActivity = useMemo(() => buildRecentActivity(deliveries, payments, 6), [deliveries, payments]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Reports" showBack />

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Outstanding</Text>
          <Text style={styles.metricValue}>{totalOutstanding}</Text>
          <Text style={styles.metricSub}>bottles</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Due Accounts</Text>
          <Text style={styles.metricValue}>{outstandingAccounts}</Text>
          <Text style={styles.metricSub}>customers</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Today Credit</Text>
          <Text style={[styles.metricValue, { color: colors.successText }]}>{todayCreditDeliveries}</Text>
          <Text style={styles.metricSub}>bottles</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Today Cash</Text>
          <Text style={[styles.metricValue, { color: colors.primaryDark }]}>{todayCashDeliveries}</Text>
          <Text style={styles.metricSub}>bottles</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Today Payments</Text>
          <Text style={[styles.metricValue, { color: colors.dangerText }]}>{todayPayments}</Text>
          <Text style={styles.metricSub}>bottles</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Net Today (Credit-Payments)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{netToday}</Text>
          <Text style={styles.metricSub}>bottles</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <FlatList
        data={recentActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No activity yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.activityRow}>
            <Text
              style={[
                styles.activityLabel,
                {
                  color:
                    item.kind === 'payment'
                      ? colors.dangerText
                      : item.kind === 'delivery-credit'
                      ? colors.successText
                      : colors.primaryDark,
                },
              ]}
            >
              {item.label}
            </Text>
            <Text style={styles.activityQty}>{item.qty} bottles</Text>
            <Text style={styles.activityDate}>
              {item.date ? dayjs(item.date).format('DD MMM, hh:mm A') : '-'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  metricSub: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  activityRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  activityLabel: {
    fontWeight: '700',
  },
  activityQty: {
    marginTop: 2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  activityDate: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
