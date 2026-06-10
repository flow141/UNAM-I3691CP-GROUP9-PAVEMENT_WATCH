import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { GeoapifyMapView } from '../../components/shared/GeoapifyMapView';
import { Header, Card, PrimaryButton } from '../../components/shared/ui';
import { getJSON } from '../../services/storage';
import { getRegionForCoordinates, reportToMapMarker } from '../../constants/maps';
import { colors, spacing, radius } from '../../constants/theme';

export default function UserDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [markers, setMarkers] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const userReports = await getJSON('userReports');
        setReports(userReports);
        setMarkers(
          userReports.map((report) => reportToMapMarker(report)).filter(Boolean)
        );
      })();
    }, [])
  );

  const activeCount = reports.filter((r) => r.status !== 'completed' && r.status !== 'rejected').length;
  const resolvedCount = reports.filter((r) => r.status === 'completed').length;
  const mapRegion = markers.length ? getRegionForCoordinates(markers) : undefined;

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Header title="Welcome, User!" subtitle="Report and track road issues" />

        <View style={styles.body}>
          <PrimaryButton
            title="+ Report an Issue"
            onPress={() => router.push('/user/report')}
            style={styles.reportBtn}
          />

          <Card style={styles.mapCard}>
            <Text style={styles.sectionTitle}>Nearby Reports</Text>
            <View style={styles.mapWrap}>
              <GeoapifyMapView
                style={styles.map}
                initialRegion={mapRegion}
                markers={markers}
                showsUserLocation
              />
            </View>
            {markers.length === 0 ? (
              <Text style={styles.mapHint}>Your submitted reports will appear on the map.</Text>
            ) : null}
          </Card>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{activeCount}</Text>
              <Text style={styles.statLabel}>Active Reports</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{resolvedCount}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </Card>
          </View>

          <Card>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {reports.length === 0 ? (
              <Text style={styles.emptyText}>
                No recent reports. Tap the button above to report an issue!
              </Text>
            ) : (
              reports
                .slice(-3)
                .reverse()
                .map((report) => (
                  <View key={report.id} style={styles.activityRow}>
                    <Text style={styles.activityTitle}>{report.title}</Text>
                    <Text style={styles.activityMeta}>{report.date}</Text>
                  </View>
                ))
            )}
          </Card>
        </View>
      </ScrollView>
      <BottomNav role="user" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.lg,
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  reportBtn: {
    marginBottom: spacing.sm,
  },
  mapCard: {
    padding: spacing.sm,
  },
  mapWrap: {
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapHint: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    paddingVertical: spacing.md,
  },
  activityRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  activityMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
