export const DEFAULT_MAP_REGION = {
  latitude: -22.5609,
  longitude: 17.0658,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export const STATUS_PIN_COLORS = {
  pending: '#DC2626',
  in_progress: '#F97316',
  approved: '#F97316',
  completed: '#16A34A',
  rejected: '#6B7280',
};

export function parseCoordinates(location, latitude, longitude) {
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return { latitude, longitude };
  }

  if (typeof location === 'string') {
    const match = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
      };
    }
  }

  return null;
}

export function getRegionForCoordinates(coordinates, delta = 0.05) {
  if (!coordinates.length) {
    return DEFAULT_MAP_REGION;
  }

  const latitude =
    coordinates.reduce((sum, point) => sum + point.latitude, 0) / coordinates.length;
  const longitude =
    coordinates.reduce((sum, point) => sum + point.longitude, 0) / coordinates.length;

  return {
    latitude,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export function reportToMapMarker(report) {
  const coords = parseCoordinates(report.location, report.latitude, report.longitude);
  if (!coords) return null;

  return {
    id: String(report.id),
    latitude: coords.latitude,
    longitude: coords.longitude,
    title: report.title,
    description: report.location,
    pinColor: STATUS_PIN_COLORS[report.status] || STATUS_PIN_COLORS.pending,
    data: report,
  };
}
