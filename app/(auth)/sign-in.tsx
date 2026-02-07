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
import { useTheme } from '@/src/context/ThemeContext'
import {
  FONTS,
  SPACING,
  RADIUS,
  GRADIENTS,
  PALETTE,
  SHADOWS,
} from '@/src/constants/new-theme'

const GlassInput = ({
  label,
  icon,
  error,
  isPassword,
  colors,
  ...props
}: any) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const borderColor = error
    ? PALETTE.status.error
    : isFocused
      ? PALETTE.electric.cyan
      : 'rgba(255,255,255,0.1)'

  const iconColor = error
    ? PALETTE.status.error
    : isFocused
      ? PALETTE.electric.cyan
      : PALETTE.slate[400]

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: PALETTE.slate[400] }]}>{label}</Text>
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
          placeholderTextColor={PALETTE.slate[500]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            props.onBlur?.()
          }}
          secureTextEntry={isPassword && !showPassword}
          selectionColor={PALETTE.electric.cyan}
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
              color={PALETTE.slate[400]}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Animated.Text
          entering={FadeInUp}
          style={[styles.errorText, { color: PALETTE.status.error }]}
        >
          {error}
        </Animated.Text>
      )}
    </View>
  )
}

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInScreen() {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  const signIn = useAuthStore((s) => s.signIn)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const signInWithApple = useAuthStore((s) => s.signInWithApple)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const routeAfterAuth = () => {
    const { hasOnboarded } = useAuthStore.getState()
    router.replace(hasOnboarded ? '/(tabs)' : '/(onboarding)/intro')
  }

  const onSubmit = async (data: SignInForm) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Keyboard.dismiss()
    try {
      setIsLoading(true)
      await signIn(data.email, data.password)
      routeAfterAuth()
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Sign In Failed', error.message || 'Invalid credentials')
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
    <View
      style={[styles.container, { backgroundColor: PALETTE.midnight.obsidian }]}
    >
      <StatusBar barStyle='light-content' />

      <LinearGradient
        colors={[
          PALETTE.midnight.obsidian,
          PALETTE.midnight.slate,
          PALETTE.midnight.obsidian,
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[styles.orb, { backgroundColor: PALETTE.electric.indigo }]}
      />

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
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={24} color='#FFF' />
            </Pressable>

            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: PALETTE.slate[400] }]}>
                Let's get back to building your empire.
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.card}
          >
            <BlurView
              intensity={30}
              tint='dark'
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.cardContent}>
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
                    autoComplete='email'
                    colors={colors}
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
                    colors={colors}
                  />
                )}
              />

              <Pressable
                style={styles.forgotButton}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text
                  style={[styles.forgotText, { color: PALETTE.electric.cyan }]}
                >
                  Forgot password?
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
                ]}
              >
                <LinearGradient
                  colors={GRADIENTS.electric}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color={PALETTE.midnight.obsidian} />
                  ) : (
                    <Text
                      style={[
                        styles.primaryButtonText,
                        { color: PALETTE.midnight.obsidian },
                      ]}
                    >
                      Sign In
                    </Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.footerSection}
          >
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={[styles.dividerText, { color: PALETTE.slate[500] }]}>
                or continue with
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <Pressable style={styles.socialButton} onPress={handleGoogle}>
                <Ionicons name='logo-google' size={22} color='#FFF' />
              </Pressable>

              {Platform.OS === 'ios' && (
                <Pressable style={styles.socialButton} onPress={handleApple}>
                  <Ionicons name='logo-apple' size={24} color='#FFF' />
                </Pressable>
              )}
            </View>

            <View style={styles.loginRow}>
              <Text style={[styles.footerText, { color: PALETTE.slate[400] }]}>
                Don't have an account?{' '}
              </Text>
              <Pressable
                onPress={() => router.push('/(auth)/sign-up')}
                hitSlop={10}
              >
                <Text
                  style={[styles.footerLink, { color: PALETTE.electric.cyan }]}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.15,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
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
  },
  card: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  cardContent: {
    padding: 20,
    gap: 16,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
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
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    marginTop: 8,
    ...SHADOWS.glow(PALETTE.electric.cyan),
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
  },
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
  },
  footerLink: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
})
