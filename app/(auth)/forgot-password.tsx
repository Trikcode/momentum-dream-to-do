// app/(auth)/forgot-password.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Dimensions,
  Linking,
  TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Haptics from 'expo-haptics'
import { supabase } from '@/src/lib/supabase'
import {
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'
import * as ExpoLinking from 'expo-linking'

const { width } = Dimensions.get('window')

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

type ScreenState = 'form' | 'success' | 'error'

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets()
  const [screenState, setScreenState] = useState<ScreenState>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const iconFloat = useSharedValue(0)
  const focusProgress = useSharedValue(0)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  useEffect(() => {
    iconFloat.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )
  }, [])

  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, { duration: 300 })
  }, [isFocused])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconFloat.value }],
  }))

  const inputContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.1)', PALETTE.electric.cyan],
    )
    return { borderColor }
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const redirectUrl = ExpoLinking.createURL('reset-password')

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        throw error
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setSubmittedEmail(data.email)
      setScreenState('success')
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

      if (error.message?.includes('rate limit')) {
        setErrorMessage('Too many requests. Please try again later.')
        setScreenState('error')
      } else {
        setSubmittedEmail(data.email)
        setScreenState('success')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenEmail = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      await Linking.openURL('mailto:')
    } catch (e) {
      console.log('Could not open email app')
    }
  }

  if (screenState === 'success') {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: PALETTE.midnight.obsidian,
          },
        ]}
      >
        <LinearGradient
          colors={[
            PALETTE.midnight.obsidian,
            PALETTE.midnight.slate,
            PALETTE.midnight.obsidian,
          ]}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.glowSpot,
            { backgroundColor: PALETTE.electric.emerald },
          ]}
        />

        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.stateContainer}
        >
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.stateIconContainer}
          >
            <View
              style={[
                styles.iconGlow,
                { backgroundColor: PALETTE.electric.emerald },
              ]}
            />
            <LinearGradient
              colors={GRADIENTS.secondary}
              style={styles.stateIcon}
            >
              <Ionicons
                name='mail-open'
                size={48}
                color={PALETTE.midnight.obsidian}
              />
            </LinearGradient>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.stateContent}
          >
            <Text style={styles.stateTitle}>Check Your Email</Text>
            <Text style={styles.stateMessage}>
              We've sent password reset instructions to:
            </Text>
            <View style={styles.emailBadge}>
              <Ionicons name='mail' size={16} color={PALETTE.electric.cyan} />
              <Text style={styles.emailText}>{submittedEmail}</Text>
            </View>
            <Text style={styles.stateHint}>
              Didn't receive the email? Check your spam folder or try again.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            style={styles.stateActions}
          >
            <Pressable onPress={handleOpenEmail} style={styles.primaryButton}>
              <LinearGradient
                colors={GRADIENTS.electric}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.primaryButtonText}>Open Email App</Text>
              <Ionicons
                name='open-outline'
                size={20}
                color={PALETTE.midnight.obsidian}
              />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.backLink}
            >
              <Ionicons
                name='arrow-back'
                size={18}
                color={PALETTE.electric.cyan}
              />
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    )
  }

  if (screenState === 'error') {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: PALETTE.midnight.obsidian,
          },
        ]}
      >
        <LinearGradient
          colors={[
            PALETTE.midnight.obsidian,
            PALETTE.midnight.slate,
            PALETTE.midnight.obsidian,
          ]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.stateContainer}
        >
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.stateIconContainer}
          >
            <View style={styles.errorIcon}>
              <Ionicons name='warning' size={48} color={PALETTE.status.error} />
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.stateContent}
          >
            <Text style={[styles.stateTitle, { color: PALETTE.status.error }]}>
              Something Went Wrong
            </Text>
            <Text style={styles.stateMessage}>{errorMessage}</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            style={styles.stateActions}
          >
            <Pressable
              onPress={() => setScreenState('form')}
              style={styles.primaryButton}
            >
              <LinearGradient
                colors={GRADIENTS.electric}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.backLink}
            >
              <Ionicons
                name='arrow-back'
                size={18}
                color={PALETTE.electric.cyan}
              />
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: PALETTE.midnight.obsidian }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[
          PALETTE.midnight.obsidian,
          PALETTE.midnight.slate,
          PALETTE.midnight.obsidian,
        ]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[styles.glowSpot, { backgroundColor: PALETTE.electric.cyan }]}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.md },
        ]}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(100).duration(400)}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={24} color='#FFF' />
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.iconContainer}
        >
          <Animated.View style={iconStyle}>
            <View
              style={[
                styles.iconGlow,
                { backgroundColor: PALETTE.electric.cyan },
              ]}
            />
            <LinearGradient colors={GRADIENTS.electric} style={styles.lockIcon}>
              <Ionicons
                name='key'
                size={40}
                color={PALETTE.midnight.obsidian}
              />
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email and we'll send you instructions to
            reset your password.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.form}
        >
          <Text style={styles.label}>Email Address</Text>
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, onBlur, value } }) => (
              <Animated.View style={[styles.inputWrapper, inputContainerStyle]}>
                {Platform.OS === 'ios' && (
                  <BlurView
                    intensity={20}
                    tint='dark'
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <View style={styles.inputInner}>
                  <Ionicons
                    name='mail-outline'
                    size={18}
                    color={
                      isFocused ? PALETTE.electric.cyan : PALETTE.slate[500]
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder='jane@example.com'
                    placeholderTextColor={PALETTE.slate[500]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      setIsFocused(false)
                      onBlur()
                    }}
                    onFocus={() => setIsFocused(true)}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoComplete='email'
                    selectionColor={PALETTE.electric.cyan}
                  />
                </View>
              </Animated.View>
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={[styles.primaryButton, { marginTop: SPACING.lg }]}
          >
            <LinearGradient
              colors={
                isLoading
                  ? [PALETTE.slate[700], PALETTE.slate[600]]
                  : GRADIENTS.electric
              }
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Text>
            {!isLoading && (
              <Ionicons
                name='send'
                size={20}
                color={PALETTE.midnight.obsidian}
              />
            )}
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          style={styles.securityNote}
        >
          <View style={styles.noteCard}>
            <Ionicons
              name='shield-checkmark'
              size={20}
              color={PALETTE.electric.emerald}
            />
            <Text style={styles.noteText}>
              For your security, the reset link will expire in 1 hour.
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600).duration(500)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Remember your password? </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  glowSpot: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    height: 120,
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  lockIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow(PALETTE.electric.cyan),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#FFF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: PALETTE.slate[400],
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: PALETTE.slate[400],
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  inputWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#FFF',
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: PALETTE.status.error,
    marginTop: SPACING.xs,
    marginLeft: 4,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.glow(PALETTE.electric.cyan),
  },
  primaryButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: PALETTE.midnight.obsidian,
  },
  securityNote: {
    marginBottom: SPACING.xl,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${PALETTE.electric.emerald}10`,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${PALETTE.electric.emerald}20`,
  },
  noteText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: PALETTE.electric.emerald,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: PALETTE.slate[400],
  },
  footerLink: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: PALETTE.electric.cyan,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  stateIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  stateIcon: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow(PALETTE.electric.emerald),
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${PALETTE.status.error}20`,
  },
  stateContent: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stateTitle: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stateMessage: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: PALETTE.slate[400],
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: `${PALETTE.electric.cyan}15`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: `${PALETTE.electric.cyan}30`,
  },
  emailText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: PALETTE.electric.cyan,
  },
  stateHint: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: PALETTE.slate[500],
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  stateActions: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  backLinkText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: PALETTE.electric.cyan,
  },
})
