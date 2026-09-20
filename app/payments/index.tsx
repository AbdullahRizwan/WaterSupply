import dayjs from 'dayjs';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, radius, shadow, spacing } from '../../constants/theme';
import { useAccounts } from '../../hooks/useAccounts';
import { usePayments } from '../../hooks/usePayments';

export default function Payments() {
  const { payments, loading } = usePayments();
  const { accounts } = useAccounts();

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Payments" showBack />

      {loading ? (
        <Text style={styles.metaText}>Loading payments...</Text>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.metaText}>No payments recorded yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{accountNameById.get(item.accountId) ?? 'Unknown account'}</Text>
              <Text style={styles.quantity}>-{item.quantity} bottles</Text>
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
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  quantity: {
    marginTop: 4,
    color: colors.dangerText,
    fontWeight: '700',
  },
  metaText: {
    marginTop: 6,
    color: colors.textSecondary,
  },
});
