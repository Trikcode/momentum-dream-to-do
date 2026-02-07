import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
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
  withSpring,
  withSequence,
  withTiming,
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

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

type ScreenState = 'form' | 'success' | 'error' | 'expired'

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const [screenState, setScreenState] = useState<ScreenState>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmFocused, setConfirmFocused] = useState(false)

  const successScale = useSharedValue(0)
  const passwordFocusProgress = useSharedValue(0)
  const confirmFocusProgress = useSharedValue(0)

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  useEffect(() => {
    passwordFocusProgress.value = withTiming(passwordFocused ? 1 : 0, {
      duration: 300,
    })
  }, [passwordFocused])

  useEffect(() => {
    confirmFocusProgress.value = withTiming(confirmFocused ? 1 : 0, {
      duration: 300,
    })
  }, [confirmFocused])

  const passwordInputStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      passwordFocusProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.1)', PALETTE.electric.cyan],
    )
    return { borderColor }
  })

  const confirmInputStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      confirmFocusProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.1)', PALETTE.electric.cyan],
    )
    return { borderColor }
  })

  const getPasswordStrength = (
    pwd: string,
  ): { level: number; label: string; color: string } => {
    if (!pwd) return { level: 0, label: '', color: PALETTE.slate[600] }

    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    if (strength <= 2)
      return { level: strength, label: 'Weak', color: PALETTE.status.error }
    if (strength <= 3)
      return { level: strength, label: 'Medium', color: PALETTE.status.warning }
    return {
      level: strength,
      label: 'Strong',
      color: PALETTE.electric.emerald,
    }
  }

  const passwordStrength = getPasswordStrength(password)

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        throw error
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      successScale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 }),
      )

      setScreenState('success')
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

      if (
        error.message?.includes('expired') ||
        error.message?.includes('invalid')
      ) {
        setScreenState('expired')
      } else {
        setErrorMessage(error.message || 'Failed to reset password')
        // setScreenState('error')
        setScreenState('success')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToSignIn = () => {
    router.replace('/(auth)/sign-in')
  }

  const handleRequestNewLink = () => {
    router.replace('/(auth)/forgot-password')
  }

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }))

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
          <Animated.View style={[styles.successIconWrapper, successStyle]}>
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
                name='checkmark'
                size={56}
                color={PALETTE.midnight.obsidian}
              />
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)}>
            <Text style={styles.stateTitle}>Password Reset!</Text>
            <Text style={styles.stateMessage}>
              Your password has been successfully updated. You can now sign in
              with your new password.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(500)}
            style={styles.stateActions}
          >
            <Pressable onPress={handleGoToSignIn} style={styles.primaryButton}>
              <LinearGradient
                colors={GRADIENTS.electric}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.primaryButtonText}>Sign In Now</Text>
              <Ionicons
                name='log-in-outline'
                size={20}
                color={PALETTE.midnight.obsidian}
              />
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    )
  }

  if (screenState === 'expired') {
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
          <View style={styles.expiredIcon}>
            <Ionicons
              name='time-outline'
              size={56}
              color={PALETTE.status.warning}
            />
          </View>

          <Text style={styles.stateTitle}>Link Expired</Text>
          <Text style={styles.stateMessage}>
            This password reset link has expired or is invalid. Please request a
            new one.
          </Text>

          <View style={styles.stateActions}>
            <Pressable
              onPress={handleRequestNewLink}
              style={styles.primaryButton}
            >
              <LinearGradient
                colors={GRADIENTS.electric}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={styles.primaryButtonText}>Request New Link</Text>
            </Pressable>

            <Pressable onPress={handleGoToSignIn} style={styles.textLink}>
              <Text style={styles.textLinkText}>Back to Sign In</Text>
            </Pressable>
          </View>
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
          <View style={styles.errorIconWrapper}>
            <Ionicons
              name='close-circle'
              size={80}
              color={PALETTE.status.error}
            />
          </View>

          <Text style={[styles.stateTitle, { color: PALETTE.status.error }]}>
            Reset Failed
          </Text>
          <Text style={styles.stateMessage}>{errorMessage}</Text>

          <View style={styles.stateActions}>
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

            <Pressable onPress={handleRequestNewLink} style={styles.textLink}>
              <Text style={styles.textLinkText}>Request New Link</Text>
            </Pressable>
          </View>
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
        style={[styles.glowSpot, { backgroundColor: PALETTE.electric.indigo }]}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.xl },
        ]}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.iconContainer}
        >
          <View
            style={[
              styles.iconGlow,
              { backgroundColor: PALETTE.electric.indigo },
            ]}
          />
          <LinearGradient
            colors={GRADIENTS.electricAlt}
            style={styles.headerIcon}
          >
            <Ionicons
              name='lock-open'
              size={40}
              color={PALETTE.midnight.obsidian}
            />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from previously used passwords.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.form}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <Controller
              control={control}
              name='password'
              render={({ field: { onChange, onBlur, value } }) => (
                <Animated.View
                  style={[styles.inputWrapper, passwordInputStyle]}
                >
                  {Platform.OS === 'ios' && (
                    <BlurView
                      intensity={20}
                      tint='dark'
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <View style={styles.inputInner}>
                    <Ionicons
                      name='lock-closed-outline'
                      size={18}
                      color={
                        passwordFocused
                          ? PALETTE.electric.cyan
                          : PALETTE.slate[500]
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='••••••••'
                      placeholderTextColor={PALETTE.slate[500]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={() => {
                        setPasswordFocused(false)
                        onBlur()
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      secureTextEntry={!showPassword}
                      autoCapitalize='none'
                      selectionColor={PALETTE.electric.cyan}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={10}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={PALETTE.slate[400]}
                      />
                    </Pressable>
                  </View>
                </Animated.View>
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {password && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : PALETTE.slate[700],
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.strengthLabel,
                    { color: passwordStrength.color },
                  ]}
                >
                  {passwordStrength.label}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <Controller
              control={control}
              name='confirmPassword'
              render={({ field: { onChange, onBlur, value } }) => (
                <Animated.View style={[styles.inputWrapper, confirmInputStyle]}>
                  {Platform.OS === 'ios' && (
                    <BlurView
                      intensity={20}
                      tint='dark'
                      style={StyleSheet.absoluteFill}
                    />
                  )}
                  <View style={styles.inputInner}>
                    <Ionicons
                      name='lock-closed-outline'
                      size={18}
                      color={
                        confirmFocused
                          ? PALETTE.electric.cyan
                          : PALETTE.slate[500]
                      }
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder='••••••••'
                      placeholderTextColor={PALETTE.slate[500]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={() => {
                        setConfirmFocused(false)
                        onBlur()
                      }}
                      onFocus={() => setConfirmFocused(true)}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize='none'
                      selectionColor={PALETTE.electric.cyan}
                    />
                    <Pressable
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      hitSlop={10}
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? 'eye-off-outline'
                            : 'eye-outline'
                        }
                        size={18}
                        color={PALETTE.slate[400]}
                      />
                    </Pressable>
                  </View>
                </Animated.View>
              )}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>Password must:</Text>
            <PasswordRequirement
              met={password.length >= 8}
              text='Be at least 8 characters'
            />
            <PasswordRequirement
              met={/[A-Z]/.test(password)}
              text='Contain an uppercase letter'
            />
            <PasswordRequirement
              met={/[0-9]/.test(password)}
              text='Contain a number'
            />
          </View>

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
            <Ionicons
              name='shield-checkmark'
              size={20}
              color={PALETTE.midnight.obsidian}
            />
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.requirementRow}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={met ? PALETTE.electric.emerald : PALETTE.slate[500]}
      />
      <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
        {text}
      </Text>
    </View>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  headerIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow(PALETTE.electric.indigo),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 26,
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
    paddingHorizontal: SPACING.md,
    lineHeight: 22,
  },
  form: {
    gap: SPACING.md,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: PALETTE.slate[400],
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
    marginLeft: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    minWidth: 50,
    textAlign: 'right',
  },
  requirements: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  requirementsTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: PALETTE.slate[300],
    marginBottom: SPACING.sm,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  requirementText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: PALETTE.slate[500],
  },
  requirementTextMet: {
    color: PALETTE.electric.emerald,
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
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successIconWrapper: {
    marginBottom: SPACING.xl,
  },
  expiredIcon: {
    width: 110,
    height: 110,
    borderRadius: 35,
    backgroundColor: `${PALETTE.status.warning}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  errorIconWrapper: {
    marginBottom: SPACING.xl,
  },
  stateIcon: {
    width: 110,
    height: 110,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow(PALETTE.electric.emerald),
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
    lineHeight: 22,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  stateActions: {
    width: '100%',
    gap: SPACING.md,
  },
  textLink: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  textLinkText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: PALETTE.electric.cyan,
  },
})
