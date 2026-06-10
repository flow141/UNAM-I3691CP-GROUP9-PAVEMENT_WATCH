import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FileText, Clock, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { Header, Card } from '../../components/shared/ui';
import { getJSON, setJSON } from '../../services/storage';
import { getReportsByStatus, updateReportStatus } from '../../services/firebase';
import { colors, spacing, radius } from '../../constants/theme';

export default function AdminDashboard() {
  const [pendingReports, setPendingReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  const loadData = useCallback(async () => {
    const [firestoreResult, localPending, approved, completed, rejected] = await Promise.all([
      getReportsByStatus('pending'),
      getJSON('pendingReports'),
      getJSON('approvedReports'),
      getJSON('completedTasks'),
      getJSON('rejectedReports'),
    ]);

    // Merge Firestore + AsyncStorage, dedup by id (Firestore wins)
    const merged = new Map();
    firestoreResult.data.forEach((r) => merged.set(String(r.id), r));
    localPending.forEach((r) => { if (!merged.has(String(r.id))) merged.set(String(r.id), r); });
    const pending = [...merged.values()];

    // Keep local cache in sync
    await setJSON('pendingReports', pending);

    setPendingReports(pending);
    setStats({
      total: pending.length + approved.length + completed.length + rejected.length,
      pending: pending.length,
      approved: approved.length,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleApprove = async (report) => {
    const approvedDate = new Date().toLocaleDateString();

    await Promise.all([
      // Update Firestore
      updateReportStatus(report.id, { status: 'approved', approvedDate }),
      // Update AsyncStorage
      (async () => {
        let pending = await getJSON('pendingReports');
        pending = pending.filter((r) => r.id !== report.id);
        await setJSON('pendingReports', pending);

        const approved = await getJSON('approvedReports');
        approved.push({ ...report, status: 'approved', approvedDate });
        await setJSON('approvedReports', approved);

        const workerTasks = await getJSON('workerTasks');
        workerTasks.push({ ...report, status: 'pending', assignedDate: approvedDate });
        await setJSON('workerTasks', workerTasks);

        const userReports = await getJSON('userReports');
        await setJSON('userReports', userReports.map((r) =>
          r.id === report.id ? { ...r, status: 'approved' } : r
        ));
      })(),
    ]);

    await loadData();
    Alert.alert('Approved', 'Report approved and sent to workers.');
  };

  const handleReject = async (report) => {
    const rejectedDate = new Date().toLocaleDateString();

    await Promise.all([
      // Update Firestore
      updateReportStatus(report.id, { status: 'rejected', rejectedDate }),
      // Update AsyncStorage
      (async () => {
        let pending = await getJSON('pendingReports');
        pending = pending.filter((r) => r.id !== report.id);
        await setJSON('pendingReports', pending);

        const rejected = await getJSON('rejectedReports');
        rejected.push({ ...report, status: 'rejected', rejectedDate });
        await setJSON('rejectedReports', rejected);

        const userReports = await getJSON('userReports');
        await setJSON('userReports', userReports.map((r) =>
          r.id === report.id ? { ...r, status: 'rejected' } : r
        ));
      })(),
    ]);

    await loadData();
    Alert.alert('Rejected', 'Report has been rejected.');
  };

  const statCards = [
    { label: 'Total Reports', value: stats.total, icon: FileText, color: '#3B82F6' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: colors.error },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: colors.success },
  ];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Header title="Admin Dashboard" subtitle="Manage and verify reports" />

        <View style={styles.statsRow}>
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <Icon size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Reports</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingReports.length} Pending</Text>
          </View>
        </View>

        {pendingReports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <CheckCircle2 size={48} color={colors.success} />
            <Text style={styles.emptyTitle}>No pending reports!</Text>
            <Text style={styles.emptySub}>When users report issues, they will appear here.</Text>
          </Card>
        ) : (
          pendingReports.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              {report.image ? (
                <Image source={{ uri: report.image }} style={styles.reportImage} />
              ) : null}
              <View style={styles.reportBody}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportMeta}>📍 {report.location}</Text>
                <Text style={styles.reportDesc}>{report.description}</Text>
                <Text style={styles.reportDate}>📅 {report.date}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApprove(report)}>
                  <ThumbsUp size={16} color="#FFFFFF" />
                  <Text style={styles.actionText}>Approve</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleReject(report)}>
                  <ThumbsDown size={16} color="#FFFFFF" />
                  <Text style={styles.actionText}>Reject</Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
      <BottomNav role="admin" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  badge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xl,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B91C1C',
  },
  emptyCard: {
    marginHorizontal: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  reportCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  reportImage: {
    width: '100%',
    height: 160,
  },
  reportBody: {
    padding: spacing.md,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  reportMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  reportDesc: {
    fontSize: 14,
    color: colors.text,
    marginTop: spacing.sm,
  },
  reportDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  approveBtn: {
    backgroundColor: colors.success,
  },
  rejectBtn: {
    backgroundColor: colors.error,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
