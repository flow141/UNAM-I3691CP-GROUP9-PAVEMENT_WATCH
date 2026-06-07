import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Bell, CheckCircle2, Clock, AlertCircle } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { PageHeader, Card } from '../../components/shared/ui';
import { colors, spacing } from '../../constants/theme';

const notifications = [
  {
    id: 1,
    type: 'success',
    title: 'Report Approved',
    message: 'Your report "Large Pothole" has been approved and assigned to a worker.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Status Update',
    message: 'Work has started on "Broken Sidewalk" - Main St.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 3,
    type: 'complete',
    title: 'Issue Resolved',
    message: 'The issue "Road Crack" has been marked as completed.',
    time: '3 days ago',
    read: true,
  },
];

function getIcon(type) {
  switch (type) {
    case 'success':
      return <CheckCircle2 size={24} color={colors.success} />;
    case 'info':
      return <Clock size={24} color={colors.info} />;
    case 'complete':
      return <AlertCircle size={24} color={colors.textSecondary} />;
    default:
      return <Bell size={24} color={colors.textSecondary} />;
  }
}

export default function UserNotifications() {
  return (
    <Screen edges={['top']}>
      <PageHeader title="Notifications" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            style={[styles.card, !notification.read && styles.unread]}
          >
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
      <BottomNav role="user" />
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
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
