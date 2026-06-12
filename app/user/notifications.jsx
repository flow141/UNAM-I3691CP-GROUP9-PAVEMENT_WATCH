import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Bell, CheckCircle2, Clock, AlertCircle, XCircle, Send } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { PageHeader, Card } from '../../components/shared/ui';
import { auth, getUserReports } from '../../services/firebase';
import { getJSON, setJSON } from '../../services/storage';
import { colors, spacing } from '../../constants/theme';

const STATUS_CONFIG = {
  pending: {
    type: 'pending',
    title: 'Report Submitted',
    icon: (c) => <Send size={22} color={c.textMuted} />,
    color: () => colors.textMuted,
  },
  approved: {
    type: 'approved',
    title: 'Report Approved',
    icon: (c) => <CheckCircle2 size={22} color={c.success} />,
    color: () => colors.success,
  },
  in_progress: {
    type: 'in_progress',
    title: 'Work in Progress',
    icon: (c) => <Clock size={22} color={c.info} />,
    color: () => colors.info,
  },
  completed: {
    type: 'completed',
    title: 'Issue Resolved',
    icon: (c) => <CheckCircle2 size={22} color={c.success} />,
    color: () => colors.success,
  },
  rejected: {
    type: 'rejected',
    title: 'Report Not Approved',
    icon: (c) => <XCircle size={22} color={c.error} />,
    color: () => colors.error,
  },
};

const STATUS_MESSAGES = {
  pending: (title) => `Your report "${title}" is awaiting admin review.`,
  approved: (title) => `Your report "${title}" has been approved. A worker will be assigned.`,
  in_progress: (title) => `Work has started on "${title}". A field worker is on site.`,
  completed: (title) => `"${title}" has been marked as resolved. Thank you for reporting!`,
  rejected: (title) => `Your report "${title}" was reviewed and not approved.`,
};

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [seenKey, setSeenKey] = useState(0);

  const loadNotifications = useCallback(async () => {
    const user = auth.currentUser;
    let reports = [];

    if (user?.uid) {
      const result = await getUserReports(user.uid);
      if (result.success && result.data.length > 0) {
        reports = result.data;
        await setJSON('userReports', reports);
      } else {
        reports = await getJSON('userReports');
      }
    } else {
      reports = await getJSON('userReports');
    }

    const items = reports
      .map((r) => {
        const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
        return {
          id: String(r.id),
          status: r.status,
          title: cfg.title,
          message: (STATUS_MESSAGES[r.status] ?? STATUS_MESSAGES.pending)(r.title),
          time: r.date,
          sortKey: r.id,
          isUnresolved: r.status !== 'completed' && r.status !== 'rejected',
        };
      })
      .sort((a, b) => b.sortKey - a.sortKey);

    const lastSeen = await getJSON('userNotifLastSeen', { ts: 0 });
    setNotifications(items);
    setSeenKey(lastSeen.ts);

    setTimeout(() => {
      const now = items.length > 0 ? items[0].sortKey : Date.now();
      setJSON('userNotifLastSeen', { ts: now });
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
              Updates on your submitted reports will appear here.
            </Text>
          </Card>
        ) : (
          notifications.map((n) => {
            const cfg = STATUS_CONFIG[n.status] ?? STATUS_CONFIG.pending;
            const isUnread = n.sortKey > seenKey;
            const accentColor = cfg.color(colors);
            return (
              <Card key={n.id} style={[styles.card, isUnread && { borderLeftColor: accentColor, borderLeftWidth: 4 }]}>
                <View style={styles.row}>
                  <View style={styles.iconWrap}>{cfg.icon(colors)}</View>
                  <View style={styles.content}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{n.title}</Text>
                      {isUnread && <View style={[styles.dot, { backgroundColor: accentColor }]} />}
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
