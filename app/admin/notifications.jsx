import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Bell, FileText, CheckCircle2, XCircle, ClipboardCheck } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { PageHeader, Card } from '../../components/shared/ui';
import { getJSON, setJSON } from '../../services/storage';
import { colors, spacing } from '../../constants/theme';

function buildNotifications(pending, completed, rejected) {
  const items = [];

  pending.forEach((r) => {
    items.push({
      id: `new-${r.id}`,
      type: 'new',
      title: 'New Report Submitted',
      message: `"${r.title}" — ${r.location}`,
      time: r.date,
      sortKey: r.id,
    });
  });

  completed.forEach((r) => {
    items.push({
      id: `done-${r.id}`,
      type: 'complete',
      title: 'Task Completed',
      message: `"${r.title}" has been marked as completed by a worker.`,
      time: r.date,
      sortKey: r.id,
    });
  });

  rejected.forEach((r) => {
    items.push({
      id: `rej-${r.id}`,
      type: 'rejected',
      title: 'Report Rejected',
      message: `"${r.title}" was rejected on ${r.rejectedDate ?? r.date}.`,
      time: r.rejectedDate ?? r.date,
      sortKey: r.id,
    });
  });

  return items.sort((a, b) => b.sortKey - a.sortKey);
}

function getIcon(type) {
  switch (type) {
    case 'new':
      return <FileText size={22} color={colors.info} />;
    case 'complete':
      return <CheckCircle2 size={22} color={colors.success} />;
    case 'rejected':
      return <XCircle size={22} color={colors.error} />;
    default:
      return <Bell size={22} color={colors.textSecondary} />;
  }
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [seenKey, setSeenKey] = useState(0);

  const loadNotifications = useCallback(async () => {
    const [pending, completed, rejected, lastSeen] = await Promise.all([
      getJSON('pendingReports'),
      getJSON('completedTasks'),
      getJSON('rejectedReports'),
      getJSON('adminNotifLastSeen', { ts: 0 }),
    ]);

    const items = buildNotifications(pending, completed, rejected);
    setNotifications(items);
    setSeenKey(lastSeen.ts);

    // Mark all as seen after a short delay so user sees unread dots first
    setTimeout(() => {
      const now = items.length > 0 ? items[0].sortKey : Date.now();
      setJSON('adminNotifLastSeen', { ts: now });
    }, 1500);
  }, []);

  useFocusEffect(useCallback(() => { loadNotifications(); }, [loadNotifications]));

  return (
    <Screen edges={['top']}>
      <PageHeader title="Notifications" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {notifications.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Bell size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              New reports and task completions will appear here.
            </Text>
          </Card>
        ) : (
          notifications.map((n) => {
            const isUnread = n.sortKey > seenKey;
            return (
              <Card key={n.id} style={[styles.card, isUnread && styles.unread]}>
                <View style={styles.row}>
                  <View style={styles.iconWrap}>{getIcon(n.type)}</View>
                  <View style={styles.content}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{n.title}</Text>
                      {isUnread && <View style={styles.dot} />}
                    </View>
                    <Text style={styles.message}>{n.message}</Text>
                    <Text style={styles.time}>{n.time}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
      <BottomNav role="admin" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
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
    alignItems: 'flex-start',
  },
  iconWrap: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
