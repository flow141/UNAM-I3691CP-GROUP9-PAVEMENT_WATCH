import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ClipboardList, CheckCircle2, TrendingUp, ChevronRight, LogOut } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { Card } from '../../components/shared/ui';
import { auth, logout } from '../../services/firebase';
import { getJSON } from '../../services/storage';
import { colors, spacing, radius } from '../../constants/theme';

const HERO_COLOR = colors.warning;

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name[0].toUpperCase();
}

export default function WorkerProfile() {
  const router = useRouter();
  const [info, setInfo] = useState({ email: '', name: '' });
  const [stats, setStats] = useState({ active: 0, completed: 0, rate: 0 });

  const loadData = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      setInfo({
        email: user.email ?? '',
        name: user.displayName ?? user.email?.split('@')[0] ?? 'Worker',
      });
    }
    const [tasks, completed] = await Promise.all([
      getJSON('workerTasks'),
      getJSON('completedTasks'),
    ]);
    const total = tasks.length + completed.length;
    setStats({
      active: tasks.length,
      completed: completed.length,
      rate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
    });
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
            <Text style={[styles.initials, { color: HERO_COLOR }]}>{getInitials(info.name)}</Text>
          </View>
          <Text style={styles.heroName}>{info.name || 'Worker'}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>Field Worker</Text>
          </View>
          {info.email ? <Text style={styles.heroEmail}>{info.email}</Text> : null}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon={ClipboardList} label="Active" value={stats.active} color={colors.info} />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color={colors.success} />
          <StatCard icon={TrendingUp} label="Success" value={`${stats.rate}%`} color={HERO_COLOR} />
        </View>

        {/* Menu */}
        <Card style={styles.menuCard}>
          <MenuItem title="My Tasks" onPress={() => router.push('/worker')} />
          <MenuItem title="Task Map" onPress={() => router.push('/worker/map')} last />
        </Card>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

      </ScrollView>
      <BottomNav role="worker" />
    </Screen>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Icon size={16} color="#fff" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: -spacing.md,
  },
  statCard: {
    flex: 1,
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
