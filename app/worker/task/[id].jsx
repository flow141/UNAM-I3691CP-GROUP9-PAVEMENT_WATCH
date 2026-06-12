import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, AlertCircle, CheckCircle2, User } from 'lucide-react-native';
import { Screen } from '../../../components/shared/Screen';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Card, PrimaryButton } from '../../../components/shared/ui';
import { getJSON, setJSON } from '../../../services/storage';
import { updateReportStatus } from '../../../services/firebase';
import { colors, spacing, radius } from '../../../constants/theme';

export default function TaskDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState(null);
  const [taskStatus, setTaskStatus] = useState('pending');

  useEffect(() => {
    (async () => {
      const tasks = await getJSON('workerTasks');
      const found = tasks.find((t) => String(t.id) === String(id));
      if (found) {
        setTask(found);
        setTaskStatus(found.status || 'pending');
      }
    })();
  }, [id]);

  const handleStartWork = async () => {
    await Promise.all([
      updateReportStatus(id, { status: 'in_progress' }),
      (async () => {
        const tasks = await getJSON('workerTasks');
        await setJSON('workerTasks', tasks.map((t) =>
          String(t.id) === String(id) ? { ...t, status: 'in_progress' } : t
        ));
      })(),
    ]);
    setTaskStatus('in_progress');
  };

  const handleComplete = async () => {
    const completedDate = new Date().toLocaleDateString();

    let workerTasks = await getJSON('workerTasks');
    const taskToComplete = workerTasks.find((t) => String(t.id) === String(id));
    workerTasks = workerTasks.filter((t) => String(t.id) !== String(id));

    await Promise.all([
      updateReportStatus(id, { status: 'completed', completedDate }),
      setJSON('workerTasks', workerTasks),
      (async () => {
        const completedTasks = await getJSON('completedTasks');
        completedTasks.push({ ...taskToComplete, status: 'completed', completedDate });
        await setJSON('completedTasks', completedTasks);
      })(),
      (async () => {
        const userReports = await getJSON('userReports');
        await setJSON('userReports', userReports.map((r) =>
          String(r.id) === String(id) ? { ...r, status: 'completed' } : r
        ));
      })(),
    ]);

    setTaskStatus('completed');
    setTimeout(() => router.replace('/worker'), 1500);
  };

  if (!task) {
    return (
      <Screen edges={['top']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.topTitle}>Task Details</Text>
        </View>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading task...</Text>
        </View>
      </Screen>
    );
  }

  const priorityColors = {
    high: { bg: '#FEE2E2', text: '#B91C1C' },
    medium: { bg: '#FFEDD5', text: '#C2410C' },
    low: { bg: '#DBEAFE', text: '#1D4ED8' },
  };
  const priorityStyle = priorityColors[task.priority] ?? null;

  return (
    <Screen edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Task Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{task.title}</Text>
            {priorityStyle ? (
              <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>
            ) : null}
          </View>

          <StatusBadge status={taskStatus} />

          <DetailRow icon={MapPin} label="Location" value={task.location} />
          {task.assignedDate ? (
            <DetailRow icon={Calendar} label="Assigned Date" value={task.assignedDate} />
          ) : null}
          <DetailRow icon={AlertCircle} label="Issue Type" value={task.title} />
          {task.userName ? (
            <DetailRow icon={User} label="Reported by" value={task.userName} />
          ) : null}

          <View style={styles.divider} />
          <Text style={styles.descLabel}>Description</Text>
          <Text style={styles.desc}>{task.description || 'No additional description provided.'}</Text>
        </Card>

        {taskStatus === 'pending' ? (
          <PrimaryButton title="Start Work" onPress={handleStartWork} style={styles.actionBtn} />
        ) : null}

        {taskStatus === 'in_progress' ? (
          <>
            <View style={styles.progressBanner}>
              <Text style={styles.progressTitle}>Work in Progress</Text>
              <Text style={styles.progressSub}>Complete the task when finished</Text>
            </View>
            <Pressable style={styles.completeBtn} onPress={handleComplete}>
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.completeText}>Mark as Completed</Text>
            </Pressable>
          </>
        ) : null}

        {taskStatus === 'completed' ? (
          <View style={styles.doneBanner}>
            <CheckCircle2 size={64} color={colors.success} />
            <Text style={styles.doneTitle}>Task Completed!</Text>
            <Text style={styles.doneSub}>Great job! Returning to tasks...</Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Icon size={20} color={colors.textMuted} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xl,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  descLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
    marginTop: spacing.md,
  },
  desc: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actionBtn: {
    marginTop: spacing.sm,
  },
  progressBanner: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  progressTitle: {
    fontWeight: '600',
    color: '#9A3412',
  },
  progressSub: {
    fontSize: 14,
    color: '#C2410C',
    marginTop: 4,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: radius.lg,
  },
  completeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  doneBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  doneTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14532D',
    marginTop: spacing.sm,
  },
  doneSub: {
    fontSize: 14,
    color: '#15803D',
    marginTop: 4,
  },
});
