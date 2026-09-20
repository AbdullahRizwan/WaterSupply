import { router } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
};

export default function ScreenHeader({ title, showBack = false }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <View style={styles.rightSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  leftContainer: {
    minWidth: 72,
  },
  rightSpacer: {
    minWidth: 72,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
