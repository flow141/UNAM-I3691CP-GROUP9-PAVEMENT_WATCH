import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MapPin, Calendar, Search, User } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Card } from '../../components/shared/ui';
import { getJSON, setJSON } from '../../services/storage';
import { getAllReports } from '../../services/firebase';
import { colors, spacing, radius } from '../../constants/theme';

const filters = ['all', 'pending', 'approved', 'in_progress', 'completed', 'rejected'];

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadReports = useCallback(async () => {
    // Load from Firestore (source of truth) and AsyncStorage (local cache)
    const [firestoreResult, localPending, localTasks, localCompleted, localRejected] = await Promise.all([
      getAllReports(),
      getJSON('pendingReports'),
      getJSON('workerTasks'),
      getJSON('completedTasks'),
      getJSON('rejectedReports'),
    ]);

    // Firestore wins on dedup, then fill in with any local-only data
    const map = new Map();
    firestoreResult.data.forEach((r) => map.set(String(r.id), r));

    // Local fallback: highest-status sources first
    const addLocal = (list, statusOverride) => {
      list.forEach((r) => {
        if (!map.has(String(r.id))) {
          map.set(String(r.id), statusOverride ? { ...r, status: statusOverride } : r);
        }
      });
    };
    addLocal(localCompleted, 'completed');
    addLocal(localTasks);
    addLocal(localRejected, 'rejected');
    addLocal(localPending, 'pending');

    const sorted = [...map.values()].sort((a, b) => b.id - a.id);
    setReports(sorted);
  }, []);

  useFocusEffect(useCallback(() => { loadReports(); }, [loadReports]));

  const filtered = reports.filter((r) => {
    const matchesSearch = (r.title ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filterLabel = (s) => {
    if (s === 'all') return 'All';
    if (s === 'in_progress') return 'In Progress';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const counts = filters.reduce((acc, s) => {
    acc[s] = s === 'all' ? reports.length : reports.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>All Reports</Text>
        <View style={styles.searchRow}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((s) => (
            <Pressable
              key={s}
              style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterText, statusFilter === s && styles.filterTextActive]}>
                {filterLabel(s)}
                {counts[s] > 0 ? ` (${counts[s]})` : ''}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No reports found</Text>
          </Card>
        ) : (
          filtered.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                <StatusBadge status={report.status} size="sm" />
              </View>
              <View style={styles.row}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={styles.meta} numberOfLines={1}>{report.location}</Text>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.row}>
                  <Calendar size={14} color={colors.textMuted} />
                  <Text style={styles.metaMuted}>{report.date}</Text>
                </View>
                {report.userName ? (
                  <View style={styles.row}>
                    <User size={14} color={colors.textMuted} />
                    <Text style={styles.metaMuted}>{report.userName}</Text>
                  </View>
                ) : null}
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
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  filters: {
    gap: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
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
    color: colors.textMuted,
    fontSize: 15,
  },
  reportCard: {
    marginBottom: 0,
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
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  metaMuted: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
