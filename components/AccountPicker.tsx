import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import { useAccounts } from '../hooks/useAccounts';
import { useDeliveries } from '../hooks/useDeliveries';
import { usePayments } from '../hooks/usePayments';
import { colors, radius, spacing } from '../constants/theme';
import { Account } from '../types/models';
import { buildOutstandingLedger, getComputedBalance } from '../utils/helpers';

type AccountPickerProps = {
  onSelect: (accountId: string) => void;
};

export default function AccountPicker({ onSelect }: AccountPickerProps) {
  const { accounts } = useAccounts();
  const { deliveries } = useDeliveries();
  const { payments } = usePayments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const outstandingLedger = useMemo(() => buildOutstandingLedger(deliveries, payments), [deliveries, payments]);

  const filteredAccounts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return accounts;

    return accounts.filter((acc: Account) => {
      const name = String(acc.name ?? '').toLowerCase();
      return name.includes(term);
    });
  }, [accounts, query]);

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search account..."
        style={styles.searchInput}
      />

      <FlatList
        data={filteredAccounts}
        keyExtractor={(item) => item.id}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {accounts.length === 0 ? 'No accounts found.' : 'No matching account.'}
          </Text>
        }
        renderItem={({ item: acc }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedId(acc.id);
              onSelect(acc.id);
            }}
            style={[styles.item, selectedId === acc.id ? styles.itemSelected : null]}
          >
            <Text style={styles.itemName}>{acc.name}</Text>
            <Text style={styles.itemMeta}>
              {getComputedBalance(acc.id, outstandingLedger, Number(acc.balanceBottles || 0))} bottles balance
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.xs,
  },
  list: {
    maxHeight: 220,
  },
  item: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9FF',
  },
  itemName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  itemMeta: {
    marginTop: 2,
    color: colors.textSecondary,
  },
  emptyText: {
    color: colors.textSecondary,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
});