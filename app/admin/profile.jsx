import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import {
  ShieldCheck,
  Mail,
  LogOut,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { PageHeader, Card } from '../../components/shared/ui';
import { auth } from '../../services/firebase';
import { getJSON } from '../../services/storage';
import { colors, spacing, radius } from '../../constants/theme';

export default function AdminProfile() {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState({ email: '', displayName: '' });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0, rejected: 0 });

  const loadData = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      setAdminInfo({
        email: user.email ?? '',
        displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Admin',
      });
    }

    const [pending, approved, completed, rejected] = await Promise.all([
      getJSON('pendingReports'),
      getJSON('approvedReports'),
      getJSON('completedTasks'),
      getJSON('rejectedReports'),
    ]);

    setStats({
      total: pending.length + approved.length + completed.length + rejected.length,
      pending: pending.length,
      approved: approved.length,
      completed: completed.length,
      rejected: rejected.length,
    });
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleLogout = () => {
    router.replace('/');
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: FileText, color: '#3B82F6' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: colors.warning },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: colors.success },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: colors.error },
  ];

  return (
    <Screen edges={['top']}>
      <PageHeader title="Admin Profile" />
      <ScrollView contentContainerStyle={styles.scroll}>

        <Card>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <ShieldCheck size={40} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {adminInfo.displayName || 'Administrator'}
              </Text>
              <Text style={styles.role}>Municipal Admin</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Mail size={18} color={colors.textMuted} />
            <Text style={styles.infoText}>{adminInfo.email || 'admin@pavement.com'}</Text>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.color }]}>
                  <Icon size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </Card>
            );
          })}
        </View>

        <Card style={styles.menuCard}>
          <MenuItem title="Manage Reports" onPress={() => router.push('/admin/reports')} />
          <MenuItem title="Pending Reviews" onPress={() => router.push('/admin')} last />
        </Card>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
      <BottomNav role="admin" />
    </Screen>
  );
}

function MenuItem({ title, onPress, last }) {
  return (
    <Pressable style={[styles.menuItem, !last && styles.menuBorder]} onPress={onPress}>
      <Text style={styles.menuText}>{title}</Text>
      <ChevronRight size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statIcon: {
    width: 32,
    height: 32,
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
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 16,
  },
});
