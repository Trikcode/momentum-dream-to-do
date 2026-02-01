// app/(auth)/sign-up.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Haptics from 'expo-haptics'
import { useAuthStore, AUTH_CANCELLED_MESSAGE } from '@/src/store/authStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

// =============================================================================
// COMPONENTS
// =============================================================================

const GlassInput = ({ label, icon, error, isPassword, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const borderColor = error
    ? DARK.error
    : isFocused
      ? DARK.accent.rose
      : 'rgba(255,255,255,0.1)'

  const iconColor = error
    ? DARK.error
    : isFocused
      ? DARK.accent.rose
      : DARK.text.secondary

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor }]}>
        <BlurView intensity={10} tint='dark' style={StyleSheet.absoluteFill} />

        <Ionicons
          name={icon}
          size={18}
          color={iconColor}
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor={DARK.text.muted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            props.onBlur?.()
          }}
          secureTextEntry={isPassword && !showPassword}
          selectionColor={DARK.accent.rose}
          {...props}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            hitSlop={10}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={DARK.text.secondary}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Animated.Text entering={FadeInUp} style={styles.errorText}>
          {error}
        </Animated.Text>
      )}
    </View>
  )
}

// =============================================================================
// LOGIC
// =============================================================================

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpScreen() {
  const insets = useSafeAreaInsets()
  const [isLoading, setIsLoading] = useState(false)

  const signUp = useAuthStore((state) => state.signUp)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)
  const signInWithApple = useAuthStore((state) => state.signInWithApple)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  const routeAfterAuth = () => {
    const { hasOnboarded } = useAuthStore.getState()
    router.replace(hasOnboarded ? '/(tabs)' : '/(onboarding)/intro')
  }

  const onSubmit = async (data: SignUpForm) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Keyboard.dismiss()
    try {
      setIsLoading(true)
      await signUp(data.email, data.password, data.fullName)
      router.replace('/(onboarding)/intro')
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert(
        'Registration Failed',
        error.message || 'Something went wrong',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      setIsLoading(true)
      await signInWithGoogle()
      routeAfterAuth()
    } catch (error: any) {
      if (error?.message === AUTH_CANCELLED_MESSAGE) return
      Alert.alert('Google Sign-In Failed', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApple = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      setIsLoading(true)
      await signInWithApple()
      routeAfterAuth()
    } catch (error: any) {
      if (error?.message === AUTH_CANCELLED_MESSAGE) return
      Alert.alert('Apple Sign-In Failed', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* Background */}
      <LinearGradient
        colors={[DARK.bg.primary, '#1A1E29', DARK.bg.primary]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient Glow */}
      <View style={styles.orb} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 10 },
          ]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={24} color='#FFF' />
            </Pressable>

            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Start building your momentum today.
              </Text>
            </View>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.card}
          >
            {/* Glass Background for Card */}
            <BlurView
              intensity={30}
              tint='dark'
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.cardContent}>
              <Controller
                control={control}
                name='fullName'
                render={({ field: { onChange, onBlur, value } }) => (
                  <GlassInput
                    label='Full Name'
                    placeholder='Jane Doe'
                    icon='person-outline'
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.fullName?.message}
                    autoCapitalize='words'
                  />
                )}
              />

              <Controller
                control={control}
                name='email'
                render={({ field: { onChange, onBlur, value } }) => (
                  <GlassInput
                    label='Email'
                    placeholder='jane@example.com'
                    icon='mail-outline'
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    keyboardType='email-address'
                    autoCapitalize='none'
                  />
                )}
              />

              <Controller
                control={control}
                name='password'
                render={({ field: { onChange, onBlur, value } }) => (
                  <GlassInput
                    label='Password'
                    placeholder='••••••••'
                    icon='lock-closed-outline'
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    isPassword
                    autoCapitalize='none'
                  />
                )}
              />

              {/* Main Button */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                ]}
              >
                <LinearGradient
                  colors={DARK.gradients.primary as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color='#FFF' />
                  ) : (
                    <Text style={styles.primaryButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>

          {/* Social & Footer */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.footerSection}
          >
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <Pressable style={styles.socialButton} onPress={handleGoogle}>
                <Ionicons name='logo-google' size={22} color='#FFF' />
              </Pressable>

              {/* Only show Apple Login on iOS */}
              {Platform.OS === 'ios' && (
                <Pressable style={styles.socialButton} onPress={handleApple}>
                  <Ionicons name='logo-apple' size={24} color='#FFF' />
                </Pressable>
              )}
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable
                onPress={() => router.push('/(auth)/sign-in')}
                hitSlop={10}
              >
                <Text style={styles.footerLink}>Sign In</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Spacer to ensure scrolling past keyboard */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },
  orb: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: DARK.accent.rose,
    opacity: 0.15,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center', // Helps center content on large screens
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: DARK.text.secondary,
  },

  // Card Style
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 17, 21, 0.4)',
  },
  cardContent: {
    padding: 20,
    gap: 16,
  },

  // Inputs
  inputContainer: {
    gap: 6,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: DARK.text.secondary,
    marginLeft: 4,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFF',
    fontFamily: FONTS.regular,
    fontSize: 15,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: DARK.error,
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },

  // Button
  primaryButton: {
    height: 52,
    borderRadius: 26,
    marginTop: 8,
    shadowColor: DARK.accent.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnGradient: {
    flex: 1,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFF',
  },

  // Footer Section
  footerSection: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.tertiary,
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: DARK.text.secondary,
  },
  footerLink: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: DARK.accent.rose,
  },
})
