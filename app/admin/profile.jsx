import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../../components/shared/Screen';
import { BottomNav } from '../../components/shared/BottomNav';
import { PageHeader, Card } from '../../components/shared/ui';
import { colors, spacing } from '../../constants/theme';

export default function AdminProfile() {
  return (
    <Screen edges={['top']}>
      <PageHeader title="Admin Profile" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.text}>Admin profile page</Text>
        </Card>
      </ScrollView>
      <BottomNav role="admin" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
  },
  text: {
    color: colors.textSecondary,
  },
});
