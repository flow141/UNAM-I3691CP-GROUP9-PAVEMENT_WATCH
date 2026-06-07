import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Home, FileText, Bell, User, MapPin, ClipboardList } from 'lucide-react-native';
import { colors } from '../../constants/theme';

const navItems = {
  user: [
    { icon: MapPin, label: 'Home', path: '/user' },
    { icon: FileText, label: 'Reports', path: '/user/my-reports' },
    { icon: Bell, label: 'Alerts', path: '/user/notifications' },
    { icon: User, label: 'Profile', path: '/user/profile' },
  ],
  admin: [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
    { icon: Bell, label: 'Alerts', path: '/admin/notifications' },
    { icon: User, label: 'Profile', path: '/admin/profile' },
  ],
  worker: [
    { icon: ClipboardList, label: 'Tasks', path: '/worker' },
    { icon: MapPin, label: 'Map', path: '/worker/map' },
    { icon: Bell, label: 'Alerts', path: '/worker/notifications' },
    { icon: User, label: 'Profile', path: '/worker/profile' },
  ],
};

export function BottomNav({ role }) {
  const router = useRouter();
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        const tint = isActive ? colors.primary : colors.textMuted;

        return (
          <Pressable key={item.path} style={styles.item} onPress={() => router.push(item.path)}>
            <Icon size={22} color={tint} />
            <Text style={[styles.label, { color: tint }, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 12,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
  },
  labelActive: {
    fontWeight: '600',
  },
});
