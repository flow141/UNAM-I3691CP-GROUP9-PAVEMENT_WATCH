import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { DEFAULT_MAP_REGION } from '../../constants/maps';
import { buildGeoapifyMapHtml, hasGeoapifyMapsApiKey } from '../../services/geoapify';
import { colors, spacing, radius } from '../../constants/theme';

export function GeoapifyMapView({
  style,
  region,
  initialRegion,
  markers = [],
  showsUserLocation = false,
  onMarkerPress,
  scrollEnabled = true,
  zoomEnabled = true,
}) {
  const mapRegion = initialRegion || region || DEFAULT_MAP_REGION;
  const zoom = estimateZoom(mapRegion.latitudeDelta);
  const interactive = scrollEnabled || zoomEnabled;

  const html = useMemo(
    () =>
      buildGeoapifyMapHtml({
        center: {
          latitude: mapRegion.latitude,
          longitude: mapRegion.longitude,
        },
        zoom,
        markers,
        interactive,
      }),
    [mapRegion.latitude, mapRegion.longitude, zoom, markers, interactive]
  );

  if (!hasGeoapifyMapsApiKey()) {
    return (
      <View style={[styles.map, styles.placeholder, style]}>
        <Text style={styles.placeholderTitle}>Map unavailable</Text>
        <Text style={styles.placeholderText}>
          Add EXPO_PUBLIC_GEOAPIFY_MAPS_API_KEY to .env with a Geoapify key restricted to Map Tiles.
        </Text>
        {showsUserLocation ? (
          <Text style={styles.placeholderHint}>
            Reverse geocoding uses EXPO_PUBLIC_GEOAPIFY_GEOCODING_API_KEY separately.
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onMessage={(event) => {
          if (!onMarkerPress) return;

          try {
            const payload = JSON.parse(event.nativeEvent.data);
            if (payload.type === 'markerPress') {
              const marker = markers.find((item) => String(item.id) === String(payload.id));
              if (marker) {
                onMarkerPress(marker);
              }
            }
          } catch {
            // Ignore malformed WebView messages.
          }
        }}
      />
    </View>
  );
}

function estimateZoom(latitudeDelta = 0.05) {
  if (latitudeDelta <= 0.01) return 15;
  if (latitudeDelta <= 0.05) return 13;
  if (latitudeDelta <= 0.1) return 12;
  return 11;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: '#E5E7EB',
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  placeholderHint: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
