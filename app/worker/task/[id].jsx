import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Screen } from '../../../components/shared/Screen';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { Card, PrimaryButton } from '../../../components/shared/ui';
import { colors, spacing, radius } from '../../../constants/theme';

export default function TaskDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [taskStatus, setTaskStatus] = useState('pending');

  const task = {
    id,
    title: 'Large Pothole',
    location: 'Main St & 5th Ave',
    description: 'Deep pothole approximately 2 feet wide and 6 inches deep. Requires immediate attention.',
    issueType: 'Pothole',
    priority: 'high',
    assignedDate: 'Apr 29, 2026',
    reportedBy: 'John Doe',
  };

  const priorityColors = {
    high: { bg: '#FEE2E2', text: '#B91C1C' },
    medium: { bg: '#FFEDD5', text: '#C2410C' },
    low: { bg: '#DBEAFE', text: '#1D4ED8' },
  };

  const priorityStyle = priorityColors[task.priority] || priorityColors.high;

  const handleComplete = () => {
    setTaskStatus('completed');
    setTimeout(() => router.replace('/worker'), 1500);
  };

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
            <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
              <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
          </View>

          <StatusBadge status={taskStatus} />

          <DetailRow icon={MapPin} label="Location" value={task.location} />
          <DetailRow icon={Calendar} label="Assigned Date" value={task.assignedDate} />
          <DetailRow icon={AlertCircle} label="Issue Type" value={task.issueType} />

          <View style={styles.divider} />
          <Text style={styles.descLabel}>Description</Text>
          <Text style={styles.desc}>{task.description}</Text>
          <Text style={styles.byline}>Reported by: {task.reportedBy}</Text>
        </Card>

        {taskStatus === 'pending' ? (
          <PrimaryButton
            title="Start Work"
            onPress={() => setTaskStatus('in_progress')}
            style={styles.actionBtn}
          />
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
  },
  desc: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  byline: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
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
