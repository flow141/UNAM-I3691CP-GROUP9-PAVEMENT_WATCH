import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../../constants/theme';

const statusStyles = {
  pending: { bg: '#FEE2E2', text: '#B91C1C' },
  in_progress: { bg: '#FFEDD5', text: '#C2410C' },
  completed: { bg: '#DCFCE7', text: '#15803D' },
  approved: { bg: '#DCFCE7', text: '#15803D' },
  rejected: { bg: '#FEE2E2', text: '#B91C1C' },
};

const labels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function StatusBadge({ status, size = 'md' }) {
  const style = statusStyles[status] || statusStyles.pending;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }, isSmall && styles.badgeSm]}>
      <Text style={[styles.text, { color: style.text }, isSmall && styles.textSm]}>
        {labels[status] || status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.xl,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 12,
  },
});
