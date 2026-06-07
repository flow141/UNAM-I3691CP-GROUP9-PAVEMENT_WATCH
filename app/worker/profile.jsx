import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Wrench, Mail, Phone, MapPin, LogOut, ChevronRight } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { PageHeader, Card } from '../../components/shared/ui';
import { colors, spacing, radius } from '../../constants/theme';

export default function WorkerProfile() {
  const router = useRouter();

  return (
    <Screen edges={['top']}>
      <PageHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Wrench size={40} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.name}>Mike Wilson</Text>
              <Text style={styles.role}>Field Worker</Text>
              <Text style={styles.id}>ID: #W12345</Text>
            </View>
          </View>

          <InfoRow icon={Mail} text="worker@pavement.com" />
          <InfoRow icon={Phone} text="+1 (555) 777-8888" />
          <InfoRow icon={MapPin} text="San Francisco, CA" />
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>3</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.info }]}>98%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </Card>
        </View>

        <Card style={styles.menuCard}>
          <MenuItem title="Work Schedule" />
          <MenuItem title="Task History" last />
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

function InfoRow({ icon: Icon, text }) {
  return (
    <View style={styles.infoRow}>
      <Icon size={20} color={colors.textMuted} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function MenuItem({ title, last }) {
  return (
    <Pressable style={[styles.menuItem, !last && styles.menuBorder]}>
      <Text style={styles.menuText}>{title}</Text>
      <ChevronRight size={20} color={colors.textMuted} />
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
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  id: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 15,
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
    color: colors.primary,
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
    color: colors.textSecondary,
    fontSize: 15,
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
