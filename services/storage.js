import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getJSON(key, defaultValue = []) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setJSON(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
