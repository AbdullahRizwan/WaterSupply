import dayjs from 'dayjs';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radius, shadow, spacing } from '../../constants/theme';
import { useAccounts } from '../../hooks/useAccounts';
import { useDeliveries } from '../../hooks/useDeliveries';

export default function Deliveries() {
  const { deliveries, loading } = useDeliveries();
  const { accounts } = useAccounts();

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Deliveries" showBack />

      {loading ? (
        <Text style={styles.metaText}>Loading deliveries...</Text>
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.metaText}>No deliveries recorded yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.cardTitle}>{accountNameById.get(item.accountId) ?? 'Unknown account'}</Text>
                <View style={[styles.statusBadge, item.onCredit ? styles.creditBadge : styles.cashBadge]}>
                  <Text style={[styles.statusText, item.onCredit ? styles.creditText : styles.cashText]}>
                    {item.onCredit ? 'Credit' : 'Cash'}
                  </Text>
                </View>
              </View>
              <Text style={styles.quantity}>+{item.quantity} bottles</Text>
              <Text style={styles.metaText}>
                {item.date ? dayjs(item.date).format('DD MMM YYYY, hh:mm A') : 'Date unavailable'}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  creditBadge: {
    backgroundColor: colors.dangerTint,
  },
  cashBadge: {
    backgroundColor: colors.successTint,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  creditText: {
    color: colors.dangerText,
  },
  cashText: {
    color: colors.successText,
  },
  quantity: {
    marginTop: 4,
    color: colors.successText,
    fontWeight: '700',
  },
  metaText: {
    marginTop: 6,
    color: colors.textSecondary,
  },
});
