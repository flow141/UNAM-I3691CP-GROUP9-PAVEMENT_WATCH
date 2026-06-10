import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { Screen } from '../../components/shared/Screen';
import { GeoapifyMapView } from '../../components/shared/GeoapifyMapView';
import { PrimaryButton } from '../../components/shared/ui';
import { getJSON, setJSON } from '../../services/storage';
import { auth, submitReport } from '../../services/firebase';
import { reverseGeocode } from '../../services/geoapify';
import { DEFAULT_MAP_REGION } from '../../constants/maps';
import { colors, spacing, radius } from '../../constants/theme';

const ISSUE_TYPES = ['Pothole', 'Broken Sidewalk', 'Road Crack', 'Damaged Sign', 'Street Light Out'];

export default function ReportIssue() {
  const router = useRouter();
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState('Getting location...');
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Location permission denied');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const nextCoords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setCoords(nextCoords);
      setLocation('Looking up address...');

      const address = await reverseGeocode(nextCoords.latitude, nextCoords.longitude);
      setLocation(address);
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to attach a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagePreview(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!issueType || !description.trim()) {
      Alert.alert('Missing fields', 'Please select an issue type and add a description.');
      return;
    }

    if (!coords) {
      Alert.alert('Location required', 'Waiting for GPS location. Please try again in a moment.');
      return;
    }

    const user = auth.currentUser;
    const newReport = {
      id: Date.now(),
      title: issueType,
      description: description.trim(),
      location,
      latitude: coords.latitude,
      longitude: coords.longitude,
      status: 'pending',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      image: imagePreview,
      userName: user?.displayName ?? user?.email?.split('@')[0] ?? 'Anonymous',
      userEmail: user?.email ?? '',
    };

    // Save to Firestore (source of truth) and AsyncStorage (local cache)
    await Promise.all([
      submitReport(newReport, user?.uid ?? 'anonymous'),
      (async () => {
        const pendingReports = await getJSON('pendingReports');
        pendingReports.push(newReport);
        await setJSON('pendingReports', pendingReports);
      })(),
      (async () => {
        const userReports = await getJSON('userReports');
        userReports.push({ ...newReport, status: 'pending' });
        await setJSON('userReports', userReports);
      })(),
    ]);

    Alert.alert('Success', 'Report submitted! Waiting for admin approval.', [
      { text: 'OK', onPress: () => router.replace('/user') },
    ]);
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Report Issue</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Photo</Text>
        {imagePreview ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imagePreview }} style={styles.preview} />
            <Pressable style={styles.removeBtn} onPress={() => setImagePreview(null)}>
              <Text style={styles.removeText}>✕</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.cameraBox} onPress={pickImage}>
            <Camera size={48} color={colors.textMuted} />
            <Text style={styles.cameraText}>Tap to take photo</Text>
          </Pressable>
        )}

        <Text style={styles.label}>Location</Text>
        <View style={styles.mapPreview}>
          <GeoapifyMapView
            style={styles.map}
            initialRegion={
              coords
                ? {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
                : DEFAULT_MAP_REGION
            }
            markers={
              coords
                ? [
                    {
                      id: 'report-location',
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                      title: 'Report location',
                      pinColor: colors.primary,
                    },
                  ]
                : []
            }
            showsUserLocation
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          />
        </View>
        <View style={styles.locationBox}>
          <Text style={styles.locationText}>📍 {location}</Text>
        </View>

        <Text style={styles.label}>Issue Type</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={issueType} onValueChange={setIssueType}>
            <Picker.Item label="Select issue type" value="" />
            {ISSUE_TYPES.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInputMultiline
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue in detail..."
        />

        <PrimaryButton title="Submit Report" onPress={handleSubmit} style={styles.submitBtn} />
      </ScrollView>
    </Screen>
  );
}

function TextInputMultiline(props) {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      style={styles.textarea}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      placeholderTextColor={colors.textMuted}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  previewWrap: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 192,
    borderRadius: radius.lg,
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.surface,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 16,
    color: colors.text,
  },
  cameraBox: {
    height: 192,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cameraText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  mapPreview: {
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  map: {
    flex: 1,
  },
  locationBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 120,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  submitBtn: {
    marginTop: spacing.lg,
  },
});
