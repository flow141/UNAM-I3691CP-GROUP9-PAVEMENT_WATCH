import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { FileText, Clock, CheckCircle2, XCircle, ChevronRight, LogOut } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { Card } from '../../components/shared/ui';
import { auth, logout } from '../../services/firebase';
import { getJSON } from '../../services/storage';
import { colors, spacing, radius } from '../../constants/theme';

const HERO_COLOR = '#1D4ED8';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name[0].toUpperCase();
}

export default function AdminProfile() {
  const router = useRouter();
  const [info, setInfo] = useState({ email: '', name: '' });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0, rejected: 0 });

  const loadData = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      setInfo({
        email: user.email ?? '',
        name: user.displayName ?? user.email?.split('@')[0] ?? 'Admin',
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

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const statCards = [
    { icon: FileText,    label: 'Total',     value: stats.total,     color: '#3B82F6' },
    { icon: Clock,       label: 'Pending',   value: stats.pending,   color: colors.warning },
    { icon: CheckCircle2,label: 'Approved',  value: stats.approved,  color: colors.success },
    { icon: XCircle,     label: 'Rejected',  value: stats.rejected,  color: colors.error },
  ];

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
            <Text style={[styles.initials, { color: HERO_COLOR }]}>{getInitials(info.name)}</Text>
          </View>
          <Text style={styles.heroName}>{info.name || 'Admin'}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>Municipal Administrator</Text>
          </View>
          {info.email ? <Text style={styles.heroEmail}>{info.email}</Text> : null}
        </View>

        {/* Stats — 2×2 grid */}
        <View style={styles.statsGrid}>
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.color }]}>
                  <Icon size={16} color="#fff" />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </Card>
            );
          })}
        </View>

        {/* Menu */}
        <Card style={styles.menuCard}>
          <MenuItem title="Pending Reports" onPress={() => router.push('/admin')} />
          <MenuItem title="All Reports" onPress={() => router.push('/admin/reports')} last />
        </Card>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={colors.error} />
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
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: HERO_COLOR,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl + spacing.md,
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  initials: {
    fontSize: 32,
    fontWeight: '700',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.xl,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  heroEmail: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: -spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menuCard: {
    marginHorizontal: spacing.md,
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
    color: colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 15,
  },
});
