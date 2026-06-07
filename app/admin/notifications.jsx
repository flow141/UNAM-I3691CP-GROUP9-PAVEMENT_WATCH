import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { PageHeader, Card } from '../../components/shared/ui';
import { colors, spacing } from '../../constants/theme';

export default function AdminNotifications() {
  return (
    <Screen edges={['top']}>
      <PageHeader title="Admin Notifications" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.text}>Notifications will appear here</Text>
        </Card>
      </ScrollView>
      <BottomNav role="admin" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
  },
  text: {
    color: colors.textSecondary,
  },
});
