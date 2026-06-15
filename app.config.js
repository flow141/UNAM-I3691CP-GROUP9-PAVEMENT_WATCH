export default {
  expo: {
    name: 'Pavement-Watch',
    slug: 'pavement-watch',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'pavement-watch',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.unam.pavementwatch',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#2E7D32',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      package: 'com.unam.pavementwatch',
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'CAMERA'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Allow Pavement-Watch to use your location for reporting road issues.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow Pavement-Watch to access your photos for issue reports.',
          cameraPermission: 'Allow Pavement-Watch to use your camera for issue reports.',
        },
      ],
    ],
  },
};
