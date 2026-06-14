import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const screenOptions = {
    headerShown: false,
    animation: 'slide_from_right',
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={screenOptions} />
    </SafeAreaProvider>
  );
}
