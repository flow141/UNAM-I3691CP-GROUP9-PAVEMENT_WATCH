import { View, Text, StyleSheet } from 'react-native';
import { Layers } from 'lucide-react-native';
import { colors, spacing, radius } from '../../constants/theme';

export function AppLogo() {
  return (
    <View style={styles.logoWrap}>
      <Layers size={40} color="#FFFFFF" />
    </View>
  );
}

export function AuthHeader({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <AppLogo />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
