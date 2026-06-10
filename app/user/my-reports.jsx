import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MapPin, Calendar, ImageOff, X, ChevronRight } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { PageHeader, Card } from '../../components/shared/ui';
import { auth, getUserReports } from '../../services/firebase';
import { getJSON, setJSON } from '../../services/storage';
import { colors, spacing, radius } from '../../constants/theme';

const STATUS_MESSAGES = {
  pending: 'Awaiting admin review',
  approved: 'Approved — worker assigned',
  in_progress: 'Worker is on the way',
  completed: 'Issue resolved',
  rejected: 'Report was not approved',
};

export default function MyReports() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadReports = useCallback(async () => {
    const user = auth.currentUser;

    // Try Firestore first (has real image URLs), fall back to AsyncStorage
    let firestoreReports = [];
    if (user?.uid) {
      const result = await getUserReports(user.uid);
      if (result.success) firestoreReports = result.data;
    }

    const localReports = await getJSON('userReports');

    // Merge: Firestore wins on dedup, then fill with local-only entries
    const map = new Map();
    firestoreReports.forEach((r) => map.set(String(r.id), r));
    localReports.forEach((r) => { if (!map.has(String(r.id))) map.set(String(r.id), r); });

    const sorted = [...map.values()].sort((a, b) => b.id - a.id);

    // Sync back so the dashboard stays accurate
    await setJSON('userReports', sorted);
    setReports(sorted);
  }, []);

  useFocusEffect(useCallback(() => { loadReports(); }, [loadReports]));

  return (
    <Screen edges={['top']}>
      <PageHeader title="My Reports" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {reports.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No reports yet</Text>
            <Pressable onPress={() => router.push('/user/report')}>
              <Text style={styles.link}>Report an Issue →</Text>
            </Pressable>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              {report.image ? (
                <Pressable onPress={() => setSelectedImage(report.image)}>
                  <Image
                    source={{ uri: report.image }}
                    style={styles.reportImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageTapHint}>
                    <Text style={styles.imageTapText}>Tap to expand</Text>
                  </View>
                </Pressable>
              ) : (
                <View style={styles.noImageBox}>
                  <ImageOff size={28} color={colors.textMuted} />
                  <Text style={styles.noImageText}>No photo</Text>
                </View>
              )}

              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                  <StatusBadge status={report.status} size="sm" />
                </View>

                {report.description ? (
                  <Text style={styles.description} numberOfLines={2}>{report.description}</Text>
                ) : null}

                <View style={styles.metaRow}>
                  <MapPin size={13} color={colors.textMuted} />
                  <Text style={styles.metaText} numberOfLines={1}>{report.location}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Calendar size={13} color={colors.textMuted} />
                  <Text style={styles.metaText}>{report.date}</Text>
                </View>

                <View style={styles.statusMessage}>
                  <Text style={[
                    styles.statusText,
                    report.status === 'completed' && styles.statusTextSuccess,
                    report.status === 'rejected' && styles.statusTextError,
                  ]}>
                    {STATUS_MESSAGES[report.status] ?? 'Status unknown'}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Full-screen image viewer */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.closeBtn} onPress={() => setSelectedImage(null)}>
            <X size={24} color="#FFFFFF" />
          </Pressable>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>

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
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  reportCard: {
    marginBottom: 0,
    padding: 0,
    overflow: 'hidden',
  },
  reportImage: {
    width: '100%',
    height: 160,
  },
  imageTapHint: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.md,
  },
  imageTapText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  noImageBox: {
    height: 72,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  noImageText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  cardBody: {
    padding: spacing.md,
  },
  titleRow: {
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
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  metaText: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  statusMessage: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statusTextSuccess: {
    color: colors.success,
  },
  statusTextError: {
    color: colors.error,
  },
  // Full-screen image modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});
