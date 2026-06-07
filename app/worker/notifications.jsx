import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Clipboard, Clock, CheckCircle2 } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { PageHeader, Card } from '../../components/shared/ui';
import { colors, spacing } from '../../constants/theme';

const notifications = [
  { id: 1, type: 'new', title: 'New Task Assigned', message: 'You have been assigned to "Damaged Sign" - Park Avenue.', time: '30 minutes ago' },
  { id: 2, type: 'reminder', title: 'Task Reminder', message: 'Please complete "Large Pothole" - Main St & 5th Ave.', time: '2 hours ago' },
  { id: 3, type: 'success', title: 'Task Verified', message: 'Your completed task "Road Crack" has been verified.', time: '1 day ago' },
];

function getIcon(type) {
  if (type === 'new') return <Clipboard size={24} color={colors.info} />;
  if (type === 'reminder') return <Clock size={24} color={colors.warning} />;
  return <CheckCircle2 size={24} color={colors.success} />;
}

export default function WorkerNotifications() {
  return (
    <Screen edges={['top']}>
      <PageHeader title="Notifications" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {notifications.map((notification) => (
          <Card key={notification.id} style={styles.card}>
            <View style={styles.row}>
              {getIcon(notification.type)}
              <View style={styles.content}>
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.time}>{notification.time}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
      <BottomNav role="worker" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  card: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
