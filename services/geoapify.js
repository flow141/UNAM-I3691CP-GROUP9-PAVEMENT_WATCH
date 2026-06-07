const MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GEOAPIFY_MAPS_API_KEY ??
  process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY ??
  '';
const GEOCODING_API_KEY =
  process.env.EXPO_PUBLIC_GEOAPIFY_GEOCODING_API_KEY ??
  process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY ??
  '';
const GEOAPIFY_MAP_STYLE = 'osm-bright';

export function hasGeoapifyMapsApiKey() {
  return MAPS_API_KEY.length > 0;
}

export function hasGeoapifyGeocodingApiKey() {
  return GEOCODING_API_KEY.length > 0;
}

export function getGeoapifyMapsApiKey() {
  return MAPS_API_KEY;
}

export async function reverseGeocode(latitude, longitude) {
  if (!GEOCODING_API_KEY) {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }

  try {
    const url =
      `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}` +
      `&format=json&apiKey=${GEOCODING_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Reverse geocode failed');
    }

    const data = await response.json();
    const formatted = data?.results?.[0]?.formatted;
    return formatted || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

export function buildGeoapifyMapHtml({
  center,
  zoom = 14,
  markers = [],
  interactive = true,
}) {
  const markerScripts = markers
    .map((marker) => {
      const popup = marker.title ? `.bindPopup(${JSON.stringify(marker.title)})` : '';
      const clickHandler = `.on('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'markerPress',
          id: ${JSON.stringify(String(marker.id))},
        }));
      })`;

      return `L.circleMarker([${marker.latitude}, ${marker.longitude}], {
        radius: 10,
        color: '#ffffff',
        weight: 2,
        fillColor: ${JSON.stringify(marker.pinColor || '#2E7D32')},
        fillOpacity: 0.95,
      })${popup}${clickHandler}.addTo(map);`;
    })
    .join('\n');

  const dragZoom = interactive ? 'true' : 'false';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <style>
      html, body, #map {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        background: #e5e7eb;
      }
      .leaflet-control-attribution {
        font-size: 9px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossorigin=""
    ></script>
    <script>
      const map = L.map('map', {
        zoomControl: ${interactive ? 'true' : 'false'},
        dragging: ${dragZoom},
        scrollWheelZoom: ${dragZoom},
        doubleClickZoom: ${dragZoom},
        boxZoom: ${dragZoom},
        keyboard: ${dragZoom},
        tap: ${dragZoom},
      }).setView([${center.latitude}, ${center.longitude}], ${zoom});

      L.tileLayer(
        'https://maps.geoapify.com/v1/tile/${GEOAPIFY_MAP_STYLE}/{z}/{x}/{y}.png?apiKey=${MAPS_API_KEY}',
        {
          maxZoom: 20,
          attribution: '&copy; <a href="https://www.geoapify.com/">Geoapify</a> &copy; OpenStreetMap contributors',
        }
      ).addTo(map);

      ${markerScripts}
    </script>
  </body>
</html>`;
}
