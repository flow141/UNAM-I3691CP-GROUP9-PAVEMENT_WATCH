import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Eye, EyeOff } from 'lucide-react-native';
import { signUp } from '../services/firebase';
import { Screen } from '../components/shared/Screen';
import { AuthHeader } from '../components/auth/AuthHeader';
import { Input, PrimaryButton, ErrorBanner } from '../components/shared/ui';
import { colors, spacing, radius } from '../constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await signUp(formData.email.trim(), formData.password, {
      fullName: formData.fullName.trim(),
      role: formData.role,
    });

    if (result.success) {
      Alert.alert('Success', 'Account created successfully! Please login.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Create Account" subtitle="Join Pavement-Watch today" />

          <Input
            label="Full Name"
            value={formData.fullName}
            onChangeText={(value) => updateField('fullName', value)}
            placeholder="Enter your full name"
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>I want to sign up as</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) => updateField('role', value)}
              >
                <Picker.Item label="Community Reporter (User)" value="user" />
                <Picker.Item label="Field Worker" value="worker" />
              </Picker>
            </View>
            <Text style={styles.hint}>Admin accounts can only be created by existing admins</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInputLike
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                placeholder="Create a password (min 6 characters)"
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={20} color={colors.textMuted} /> : <Eye size={20} color={colors.textMuted} />}
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordRow}>
              <TextInputLike
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textMuted} />
                ) : (
                  <Eye size={20} color={colors.textMuted} />
                )}
              </Pressable>
            </View>
          </View>

          <ErrorBanner message={error} />

          <PrimaryButton
            title={loading ? 'Creating Account...' : 'Sign Up'}
            onPress={handleSubmit}
            disabled={loading}
          />

          <Text style={styles.footer}>
            Already have an account?{' '}
            <Link href="/" asChild>
              <Pressable>
                <Text style={styles.link}>Login</Text>
              </Pressable>
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function TextInputLike({ style, ...props }) {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      style={[styles.input, { flex: 1 }, style]}
      placeholderTextColor={colors.textMuted}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#F0FDF4',
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingVertical: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingRight: spacing.sm,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  eyeBtn: {
    padding: 8,
  },
  footer: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
