import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, Filter, Navigation } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { GeoapifyMapView } from '../../components/shared/GeoapifyMapView';
import { getJSON } from '../../services/storage';
import { openDirections } from '../../services/maps';
import {
  DEFAULT_MAP_REGION,
  STATUS_PIN_COLORS,
  getRegionForCoordinates,
  parseCoordinates,
  reportToMapMarker,
} from '../../constants/maps';
import { colors, spacing, radius } from '../../constants/theme';

export default function WorkerMap() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState(null);
  const [markers, setMarkers] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const workerTasks = await getJSON('workerTasks');
        const nextMarkers = workerTasks
          .map((task) =>
            reportToMapMarker({
              ...task,
              location: task.address || task.location,
            })
          )
          .filter(Boolean);
        setMarkers(nextMarkers);
      })();
    }, [])
  );

  const mapRegion =
    markers.length > 0
      ? getRegionForCoordinates(markers)
      : DEFAULT_MAP_REGION;

  const handleNavigate = () => {
    if (!selectedTask) return;

    const coords = parseCoordinates(
      selectedTask.address || selectedTask.location,
      selectedTask.latitude,
      selectedTask.longitude
    );

    if (!coords) return;

    openDirections({
      ...coords,
      label: selectedTask.title,
    });
  };

  return (
    <Screen edges={['top']} style={styles.screen}>
      <View style={styles.mapWrap}>
        <GeoapifyMapView
          style={StyleSheet.absoluteFill}
          initialRegion={mapRegion}
          markers={markers}
          showsUserLocation
          onMarkerPress={(marker) => setSelectedTask(marker.data || marker)}
        />

        <View style={styles.topBar}>
          <View style={styles.searchRow}>
            <Search size={20} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Search tasks...</Text>
          </View>
          <Pressable style={styles.filterBtn}>
            <Filter size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Status</Text>
          <LegendItem color={STATUS_PIN_COLORS.pending} label="Pending" />
          <LegendItem color={STATUS_PIN_COLORS.in_progress} label="In Progress" />
          <LegendItem color={STATUS_PIN_COLORS.completed} label="Completed" />
        </View>

        {selectedTask ? (
          <View style={styles.popup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>{selectedTask.title}</Text>
              <Pressable onPress={() => setSelectedTask(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.popupAddress}>
              {selectedTask.address || selectedTask.location}
            </Text>
            <View style={styles.popupActions}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>
                  {selectedTask.status === 'pending' ? 'Pending' : 'In Progress'}
                </Text>
              </View>
              <Pressable
                style={styles.viewBtn}
                onPress={() => router.push(`/worker/task/${selectedTask.id}`)}
              >
                <Navigation size={16} color="#FFFFFF" />
                <Text style={styles.viewBtnText}>View Task</Text>
              </Pressable>
            </View>
            <Pressable style={styles.navigateBtn} onPress={handleNavigate}>
              <Text style={styles.navigateBtnText}>Get Directions</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      <BottomNav role="worker" />
    </Screen>
  );
}

function LegendItem({ color, label }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  mapWrap: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    zIndex: 1,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: {
    color: colors.textMuted,
    fontSize: 16,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legend: {
    position: 'absolute',
    top: 88,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  popup: {
    position: 'absolute',
    bottom: 16,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    fontSize: 18,
    color: colors.textMuted,
    padding: 4,
  },
  popupAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  popupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xl,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B91C1C',
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  navigateBtn: {
    marginTop: spacing.sm,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navigateBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
