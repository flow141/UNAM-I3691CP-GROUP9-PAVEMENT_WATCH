import { Linking, Platform } from 'react-native';

export function openDirections({ latitude, longitude, label }) {
  const name = label ? encodeURIComponent(label) : 'Destination';
  const coords = `${latitude},${longitude}`;

  const geoUrl = Platform.select({
    ios: `maps://?daddr=${coords}&dirflg=d`,
    android: `geo:${coords}?q=${coords}(${name})`,
    default: `https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`,
  });

  const fallbackUrl = `https://www.openstreetmap.org/directions?to=${latitude}%2C${longitude}`;

  if (!geoUrl || Platform.OS === 'web') {
    Linking.openURL(fallbackUrl);
    return;
  }

  Linking.canOpenURL(geoUrl)
    .then((supported) => Linking.openURL(supported ? geoUrl : fallbackUrl))
    .catch(() => Linking.openURL(fallbackUrl));
}
