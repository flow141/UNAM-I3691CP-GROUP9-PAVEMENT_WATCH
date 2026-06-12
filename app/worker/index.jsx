import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MapPin, Calendar, CheckCircle, ChevronRight } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Header, Card } from '../../components/shared/ui';
import { getJSON, setJSON } from '../../services/storage';
import { getReportsByStatuses } from '../../services/firebase';
import { colors, spacing, radius } from '../../constants/theme';

export default function WorkerDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState([]);

  const loadTasks = useCallback(async () => {
    const [firestoreResult, localTasks, localCompleted] = await Promise.all([
      getReportsByStatuses(['approved', 'in_progress']),
      getJSON('workerTasks'),
      getJSON('completedTasks'),
    ]);

    // Merge Firestore tasks with local cache, Firestore wins on dedup
    const map = new Map();
    firestoreResult.data.forEach((r) => map.set(String(r.id), r));
    localTasks.forEach((r) => { if (!map.has(String(r.id))) map.set(String(r.id), r); });
    const merged = [...map.values()];

    // Sync back to local cache
    await setJSON('workerTasks', merged);

    setTasks(merged);
    setCompleted(localCompleted);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleComplete = async (task) => {
    let workerTasks = await getJSON('workerTasks');
    workerTasks = workerTasks.filter((t) => t.id !== task.id);
    await setJSON('workerTasks', workerTasks);

    const completedTasks = await getJSON('completedTasks');
    completedTasks.push({
      ...task,
      status: 'completed',
      completedDate: new Date().toLocaleDateString(),
    });
    await setJSON('completedTasks', completedTasks);

    const userReports = await getJSON('userReports');
    const updatedUserReports = userReports.map((r) =>
      r.id === task.id ? { ...r, status: 'completed' } : r
    );
    await setJSON('userReports', updatedUserReports);

    await loadTasks();
    Alert.alert('Complete', 'Task completed! Great job!');
  };

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Header title="My Tasks" subtitle="Tasks assigned to you" />

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Active Tasks</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>{completed.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Assigned Tasks</Text>

        {tasks.length === 0 ? (
          <Card style={styles.emptyCard}>
            <CheckCircle size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>No tasks assigned</Text>
            <Text style={styles.emptySub}>When admin approves reports, tasks will appear here.</Text>
          </Card>
        ) : (
          tasks.map((task) => (
            <Pressable key={task.id} onPress={() => router.push(`/worker/task/${task.id}`)}>
              <Card style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>
                <View style={styles.row}>
                  <MapPin size={16} color={colors.textSecondary} />
                  <Text style={styles.meta}>{task.location}</Text>
                </View>
                <View style={styles.row}>
                  <Calendar size={16} color={colors.textMuted} />
                  <Text style={styles.metaMuted}>Assigned: {task.assignedDate}</Text>
                </View>
                {task.description ? (
                  <Text style={styles.desc} numberOfLines={2}>{task.description}</Text>
                ) : null}
                <View style={styles.taskFooter}>
                  <StatusBadge status={task.status || 'pending'} size="sm" />
                  <Pressable
                    style={styles.completeBtn}
                    onPress={(e) => { e.stopPropagation?.(); handleComplete(task); }}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text style={styles.completeText}>Mark Complete</Text>
                  </Pressable>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
      <BottomNav role="worker" />
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
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    marginHorizontal: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.textSecondary,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  taskCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaMuted: {
    fontSize: 14,
    color: colors.textMuted,
  },
  desc: {
    fontSize: 14,
    color: colors.text,
    marginVertical: spacing.sm,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  completeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
