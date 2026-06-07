import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { MapPin, Calendar, Search } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Card } from '../../components/shared/ui';
import { colors, spacing, radius } from '../../constants/theme';

const reports = [
  { id: 1, title: 'Large Pothole', location: 'Main St & 5th Ave', status: 'in_progress', date: 'Apr 28, 2026', reportedBy: 'John Doe' },
  { id: 2, title: 'Broken Sidewalk', location: 'Oak Street', status: 'pending', date: 'Apr 29, 2026', reportedBy: 'Jane Smith' },
  { id: 3, title: 'Road Crack', location: 'Elm Avenue', status: 'completed', date: 'Apr 25, 2026', reportedBy: 'Mike Johnson' },
];

const filters = ['all', 'pending', 'in_progress', 'completed'];

export default function AdminReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filterLabel = (status) => {
    if (status === 'all') return 'All';
    if (status === 'in_progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
          {filters.map((status) => (
            <Pressable
              key={status}
              style={[styles.filterBtn, statusFilter === status && styles.filterBtnActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>
                {filterLabel(status)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {filteredReports.map((report) => (
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
            <Text style={styles.byline}>By: {report.reportedBy}</Text>
          </Card>
        ))}
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
    fontSize: 14,
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
  byline: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
