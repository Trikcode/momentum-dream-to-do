// app/(auth)/reset-password.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Haptics from 'expo-haptics'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { supabase } from '@/src/lib/supabase'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'

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

  const successScale = useSharedValue(0)

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

  // Password strength indicator
  const getPasswordStrength = (
    pwd: string,
  ): { level: number; label: string; color: string } => {
    if (!pwd) return { level: 0, label: '', color: COLORS.neutral[200] }

    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    if (strength <= 2)
      return { level: strength, label: 'Weak', color: COLORS.error }
    if (strength <= 3)
      return { level: strength, label: 'Medium', color: COLORS.warning }
    return { level: strength, label: 'Strong', color: COLORS.success[500] }
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

      // Animate success
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
        setScreenState('error')
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

  // Success state
  if (screenState === 'success') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[COLORS.success[50], COLORS.background.primary]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.stateContainer}
        >
          <Animated.View style={[styles.successIconWrapper, successStyle]}>
            <LinearGradient
              colors={COLORS.gradients.success as [string, string]}
              style={styles.stateIcon}
            >
              <Ionicons name='checkmark' size={56} color='#FFF' />
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
            <Button
              title='Sign In Now'
              onPress={handleGoToSignIn}
              fullWidth
              size='lg'
              icon={<Ionicons name='log-in-outline' size={20} color='#FFF' />}
              iconPosition='right'
            />
          </Animated.View>
        </Animated.View>
      </View>
    )
  }

  // Expired state
  if (screenState === 'expired') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[COLORS.accent[50], COLORS.background.primary]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.stateContainer}
        >
          <View style={styles.expiredIconWrapper}>
            <View style={styles.expiredIcon}>
              <Ionicons
                name='time-outline'
                size={56}
                color={COLORS.accent[500]}
              />
            </View>
          </View>

          <Text style={styles.stateTitle}>Link Expired</Text>
          <Text style={styles.stateMessage}>
            This password reset link has expired or is invalid. Please request a
            new one.
          </Text>

          <View style={styles.stateActions}>
            <Button
              title='Request New Link'
              onPress={handleRequestNewLink}
              fullWidth
              size='lg'
            />

            <TouchableOpacity
              onPress={handleGoToSignIn}
              style={styles.textLink}
            >
              <Text style={styles.textLinkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    )
  }

  // Error state
  if (screenState === 'error') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#FEE2E2', COLORS.background.primary]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.stateContainer}
        >
          <View style={styles.errorIconWrapper}>
            <Ionicons name='close-circle' size={80} color={COLORS.error} />
          </View>

          <Text style={[styles.stateTitle, { color: COLORS.error }]}>
            Reset Failed
          </Text>
          <Text style={styles.stateMessage}>{errorMessage}</Text>

          <View style={styles.stateActions}>
            <Button
              title='Try Again'
              onPress={() => setScreenState('form')}
              fullWidth
              size='lg'
            />

            <TouchableOpacity
              onPress={handleRequestNewLink}
              style={styles.textLink}
            >
              <Text style={styles.textLinkText}>Request New Link</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    )
  }

  // Form state
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[COLORS.secondary[50], COLORS.background.primary]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.xl },
        ]}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.iconContainer}
        >
          <LinearGradient
            colors={COLORS.gradients.secondary as [string, string]}
            style={styles.headerIcon}
          >
            <Ionicons name='lock-open' size={40} color='#FFF' />
          </LinearGradient>
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from previously used passwords.
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.form}
        >
          <Controller
            control={control}
            name='password'
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  label='New Password'
                  placeholder='••••••••'
                  leftIcon='lock-closed-outline'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  autoCapitalize='none'
                />

                {/* Password strength indicator */}
                {value && (
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
                                  : COLORS.neutral[200],
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
            )}
          />

          <Controller
            control={control}
            name='confirmPassword'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label='Confirm Password'
                placeholder='••••••••'
                leftIcon='lock-closed-outline'
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                secureTextEntry
                autoCapitalize='none'
              />
            )}
          />

          {/* Password requirements */}
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

          <Button
            title='Reset Password'
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            size='lg'
            style={{ marginTop: SPACING.lg }}
            icon={<Ionicons name='shield-checkmark' size={20} color='#FFF' />}
            iconPosition='left'
          />
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
        color={met ? COLORS.success[500] : COLORS.neutral[400]}
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
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
    lineHeight: 22,
  },
  form: {
    gap: SPACING.sm,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
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
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  requirementsTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.neutral[700],
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
    color: COLORS.neutral[500],
  },
  requirementTextMet: {
    color: COLORS.success[600],
  },

  // State screens
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successIconWrapper: {
    marginBottom: SPACING.xl,
  },
  expiredIconWrapper: {
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
    ...SHADOWS.lg,
  },
  expiredIcon: {
    width: 110,
    height: 110,
    borderRadius: 35,
    backgroundColor: COLORS.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stateMessage: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[500],
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
    color: COLORS.primary[500],
  },
})
