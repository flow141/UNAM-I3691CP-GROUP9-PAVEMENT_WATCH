import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Wrench, Mail, LogOut, ChevronRight } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { PageHeader, Card } from '../../components/shared/ui';
import { auth } from '../../services/firebase';
import { getJSON } from '../../services/storage';
import { colors, spacing, radius } from '../../constants/theme';

export default function WorkerProfile() {
  const router = useRouter();
  const [workerInfo, setWorkerInfo] = useState({ email: '', displayName: '' });
  const [stats, setStats] = useState({ active: 0, completed: 0, rate: 0 });

  const loadData = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      setWorkerInfo({
        email: user.email ?? '',
        displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Worker',
      });
    }

    const [tasks, completed] = await Promise.all([
      getJSON('workerTasks'),
      getJSON('completedTasks'),
    ]);

    const total = tasks.length + completed.length;
    const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

    setStats({ active: tasks.length, completed: completed.length, rate });
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  return (
    <Screen edges={['top']}>
      <PageHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.scroll}>

        <Card>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Wrench size={40} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {workerInfo.displayName || 'Field Worker'}
              </Text>
              <Text style={styles.role}>Field Worker</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Mail size={18} color={colors.textMuted} />
            <Text style={styles.infoText}>{workerInfo.email || 'worker@pavement.com'}</Text>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.info }]}>{stats.rate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </Card>
        </View>

        <Card style={styles.menuCard}>
          <MenuItem title="My Tasks" onPress={() => router.push('/worker')} />
          <MenuItem title="Task Map" onPress={() => router.push('/worker/map')} last />
        </Card>

        <Pressable style={styles.logoutBtn} onPress={() => router.replace('/')}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
      <BottomNav role="worker" />
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
    backgroundColor: colors.warning,
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
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
