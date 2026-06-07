import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MapPin, Calendar } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { PageHeader, Card } from '../../components/shared/ui';
import { getJSON } from '../../services/storage';
import { colors, spacing } from '../../constants/theme';

export default function MyReports() {
  const router = useRouter();
  const [reports, setReports] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getJSON('userReports').then(setReports);
    }, [])
  );

  return (
    <Screen edges={['top']}>
      <PageHeader title="My Reports" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {reports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No reports yet</Text>
            <Pressable onPress={() => router.push('/user/report')}>
              <Text style={styles.link}>Report an Issue</Text>
            </Pressable>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <StatusBadge status={report.status} size="sm" />
              </View>
              <View style={styles.row}>
                <MapPin size={16} color={colors.textSecondary} />
                <Text style={styles.meta}>{report.location}</Text>
              </View>
              <View style={styles.row}>
                <Calendar size={16} color={colors.textMuted} />
                <Text style={styles.metaMuted}>{report.date}</Text>
              </View>
            </Card>
          ))
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
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  reportCard: {
    marginBottom: spacing.sm,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  reportTitle: {
    flex: 1,
    fontSize: 16,
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
});
