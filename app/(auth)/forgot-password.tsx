// app/(auth)/forgot-password.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
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
} from 'react-native-reanimated'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Haptics from 'expo-haptics'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { GlassCard } from '@/src/components/shared/GlassCard'
import { supabase } from '@/src/lib/supabase'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'

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

  // Animation values
  const iconFloat = useSharedValue(0)
  const iconRotate = useSharedValue(0)
  const successScale = useSharedValue(0)

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

  React.useEffect(() => {
    // Floating animation for the icon
    iconFloat.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )

    // Subtle rotation
    iconRotate.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )
  }, [])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: iconFloat.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }))

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: 'dreamdo://reset-password',
      })

      if (error) {
        throw error
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setSubmittedEmail(data.email)
      setScreenState('success')
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

      // Don't reveal if email exists or not for security
      // Still show success to prevent email enumeration
      if (error.message?.includes('rate limit')) {
        setErrorMessage('Too many requests. Please try again later.')
        setScreenState('error')
      } else {
        // For security, show success even if email doesn't exist
        setSubmittedEmail(data.email)
        setScreenState('success')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSignIn = () => {
    router.back()
  }

  const handleTryAgain = () => {
    setScreenState('form')
    setErrorMessage('')
  }

  const handleOpenEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // Could integrate with expo-linking to open email app
  }

  // Render success state
  if (screenState === 'success') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[COLORS.success[50], COLORS.background.primary]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.successContainer}
        >
          {/* Success icon */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.successIconContainer}
          >
            <LinearGradient
              colors={COLORS.gradients.success as [string, string]}
              style={styles.successIcon}
            >
              <Ionicons name='mail-open' size={48} color='#FFF' />
            </LinearGradient>

            {/* Decorative circles */}
            <View style={[styles.decorCircle, styles.decorCircle1]} />
            <View style={[styles.decorCircle, styles.decorCircle2]} />
            <View style={[styles.decorCircle, styles.decorCircle3]} />
          </Animated.View>

          {/* Success message */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.successContent}
          >
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to:
            </Text>
            <View style={styles.emailBadge}>
              <Ionicons name='mail' size={16} color={COLORS.primary[500]} />
              <Text style={styles.emailText}>{submittedEmail}</Text>
            </View>
            <Text style={styles.successHint}>
              Didn't receive the email? Check your spam folder or try again.
            </Text>
          </Animated.View>

          {/* Actions */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            style={styles.successActions}
          >
            <Button
              title='Open Email App'
              onPress={handleOpenEmail}
              fullWidth
              size='lg'
              icon={<Ionicons name='open-outline' size={20} color='#FFF' />}
              iconPosition='right'
            />

            <TouchableOpacity
              onPress={handleBackToSignIn}
              style={styles.backLink}
            >
              <Ionicons
                name='arrow-back'
                size={18}
                color={COLORS.primary[500]}
              />
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    )
  }

  // Render error state
  if (screenState === 'error') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#FEE2E2', COLORS.background.primary]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.successContainer}
        >
          {/* Error icon */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.successIconContainer}
          >
            <View style={styles.errorIcon}>
              <Ionicons name='warning' size={48} color={COLORS.error} />
            </View>
          </Animated.View>

          {/* Error message */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.successContent}
          >
            <Text style={styles.errorTitle}>Something Went Wrong</Text>
            <Text style={styles.successMessage}>{errorMessage}</Text>
          </Animated.View>

          {/* Actions */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            style={styles.successActions}
          >
            <Button
              title='Try Again'
              onPress={handleTryAgain}
              fullWidth
              size='lg'
            />

            <TouchableOpacity
              onPress={handleBackToSignIn}
              style={styles.backLink}
            >
              <Ionicons
                name='arrow-back'
                size={18}
                color={COLORS.primary[500]}
              />
              <Text style={styles.backLinkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    )
  }

  // Render form state
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[COLORS.primary[50], COLORS.background.primary]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.md },
        ]}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Animated.View entering={FadeIn.delay(100).duration(400)}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name='arrow-back' size={24} color={COLORS.neutral[900]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Animated Icon */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.iconContainer}
        >
          <Animated.View style={iconStyle}>
            <LinearGradient
              colors={COLORS.gradients.primary as [string, string]}
              style={styles.lockIcon}
            >
              <Ionicons name='key' size={40} color='#FFF' />
            </LinearGradient>
          </Animated.View>

          {/* Decorative elements */}
          <View style={[styles.floatingDot, styles.floatingDot1]} />
          <View style={[styles.floatingDot, styles.floatingDot2]} />
          <View style={[styles.floatingDot, styles.floatingDot3]} />
        </Animated.View>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email and we'll send you instructions to
            reset your password.
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.form}
        >
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label='Email Address'
                placeholder='jane@example.com'
                leftIcon='mail-outline'
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                autoFocus
              />
            )}
          />

          <Button
            title='Send Reset Link'
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            size='lg'
            style={{ marginTop: SPACING.md }}
            icon={<Ionicons name='send' size={20} color='#FFF' />}
            iconPosition='right'
          />
        </Animated.View>

        {/* Security note */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          style={styles.securityNote}
        >
          <GlassCard padding='md' style={styles.noteCard}>
            <View style={styles.noteContent}>
              <Ionicons
                name='shield-checkmark'
                size={20}
                color={COLORS.success[500]}
              />
              <Text style={styles.noteText}>
                For your security, the reset link will expire in 1 hour.
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Back to sign in link */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(500)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    height: 120,
    justifyContent: 'center',
  },
  lockIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: COLORS.primary[300],
  },
  floatingDot1: {
    width: 12,
    height: 12,
    top: 10,
    right: width * 0.25,
  },
  floatingDot2: {
    width: 8,
    height: 8,
    bottom: 20,
    left: width * 0.2,
    backgroundColor: COLORS.secondary[300],
  },
  floatingDot3: {
    width: 6,
    height: 6,
    top: 30,
    left: width * 0.3,
    backgroundColor: COLORS.accent[300],
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
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
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  securityNote: {
    marginBottom: SPACING.xl,
  },
  noteCard: {
    backgroundColor: COLORS.success[50],
    borderColor: COLORS.success[100],
    borderWidth: 1,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.success[700],
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
    color: COLORS.neutral[500],
  },
  footerLink: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.primary[500],
  },

  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: COLORS.success[200],
  },
  decorCircle1: {
    width: 130,
    height: 130,
    opacity: 0.5,
  },
  decorCircle2: {
    width: 160,
    height: 160,
    opacity: 0.3,
  },
  decorCircle3: {
    width: 190,
    height: 190,
    opacity: 0.15,
  },
  successContent: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  errorTitle: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  successMessage: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  emailText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.primary[700],
  },
  successHint: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.neutral[400],
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  successActions: {
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
    color: COLORS.primary[500],
  },
})
