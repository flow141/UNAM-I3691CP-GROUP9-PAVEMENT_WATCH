import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FileText, Clock, CheckCircle2, ThumbsUp, ThumbsDown, UserPlus, X } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { Header, Card, ErrorBanner } from '../../components/shared/ui';
import { getJSON, setJSON } from '../../services/storage';
import { getReportsByStatus, updateReportStatus, createWorkerAccount } from '../../services/firebase';
import { colors, spacing, radius } from '../../constants/theme';

export default function AdminDashboard() {
  const [pendingReports, setPendingReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [workerForm, setWorkerForm] = useState({ fullName: '', email: '', password: '' });
  const [workerError, setWorkerError] = useState('');
  const [workerLoading, setWorkerLoading] = useState(false);

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

  const handleCreateWorker = async () => {
    const { fullName, email, password } = workerForm;
    if (!fullName.trim() || !email.trim() || !password) {
      setWorkerError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setWorkerError('Password must be at least 6 characters.');
      return;
    }
    setWorkerLoading(true);
    setWorkerError('');
    const result = await createWorkerAccount(email.trim(), password, fullName.trim());
    setWorkerLoading(false);
    if (result.success) {
      setShowWorkerModal(false);
      setWorkerForm({ fullName: '', email: '', password: '' });
      Alert.alert('Worker Created', `Account for ${fullName.trim()} has been created.`);
    } else {
      setWorkerError(result.error ?? 'Failed to create account. Try again.');
    }
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

        {/* Create Worker Account button */}
        <Pressable style={styles.workerBtn} onPress={() => setShowWorkerModal(true)}>
          <UserPlus size={18} color="#FFFFFF" />
          <Text style={styles.workerBtnText}>Create Worker Account</Text>
        </Pressable>

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

      {/* Create Worker Account Modal */}
      <Modal visible={showWorkerModal} transparent animationType="slide" onRequestClose={() => setShowWorkerModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Worker Account</Text>
              <Pressable onPress={() => { setShowWorkerModal(false); setWorkerError(''); }} style={styles.modalClose}>
                <X size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Worker's full name"
              placeholderTextColor={colors.textMuted}
              value={workerForm.fullName}
              onChangeText={(v) => { setWorkerForm((p) => ({ ...p, fullName: v })); setWorkerError(''); }}
            />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="worker@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={workerForm.email}
              onChangeText={(v) => { setWorkerForm((p) => ({ ...p, email: v })); setWorkerError(''); }}
            />

            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Min 6 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={workerForm.password}
              onChangeText={(v) => { setWorkerForm((p) => ({ ...p, password: v })); setWorkerError(''); }}
            />

            <ErrorBanner message={workerError} />

            <Pressable
              style={[styles.createBtn, workerLoading && { opacity: 0.6 }]}
              onPress={handleCreateWorker}
              disabled={workerLoading}
            >
              {workerLoading
                ? <ActivityIndicator color="#FFFFFF" size="small" />
                : <Text style={styles.createBtnText}>Create Account</Text>}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  workerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#1D4ED8',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.lg,
  },
  workerBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    padding: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  createBtn: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
