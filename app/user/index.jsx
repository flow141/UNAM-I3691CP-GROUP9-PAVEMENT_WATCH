import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { Header, Card, PrimaryButton } from '../../components/shared/ui';
import { colors, spacing } from '../../constants/theme';

export default function UserDashboard() {
  const router = useRouter();

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Header title="Welcome, User!" subtitle="Report and track road issues" />

        <View style={styles.body}>
          <PrimaryButton title="+ Report an Issue" onPress={() => router.push('/user/report')} style={styles.reportBtn} />

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Active Reports</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </Card>
          </View>

          <Card>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.emptyText}>
              No recent reports. Tap the button above to report an issue!
            </Text>
          </Card>
        </View>
      </ScrollView>
      <BottomNav role="user" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.lg,
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  reportBtn: {
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
});
