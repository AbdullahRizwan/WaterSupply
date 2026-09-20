import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAccounts } from '../../hooks/useAccounts';
import { colors, radius, shadow, spacing } from '../../constants/theme';
import ScreenHeader from '../../components/ScreenHeader';

function formatDate(date: Date | null | undefined) {
  if (!date) return 'Date unavailable';
  return date.toLocaleString();
}

export default function Accounts() {
  const { accounts } = useAccounts();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Accounts" showBack />
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/accounts/add')}>
        <Text style={styles.addButtonText}>+ Add Account</Text>
      </TouchableOpacity>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/accounts/${item.id}`)}>
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.balanceBottles} bottles balance</Text>
              <Text style={styles.metaDate}>
                Added: {formatDate(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  listContent: {
    marginTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    paddingVertical: 11,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    ...shadow.card,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metaDate: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});