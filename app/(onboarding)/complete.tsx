// app/(onboarding)/complete.tsx
import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'

// Components & Logic
import { Confetti } from '@/src/components/celebrations/Confetti'
import { SuccessCheck } from '@/src/components/celebrations/SuccessCheck'
import { Button } from '@/src/components/ui/Button' // Assuming this supports variants or we style it manually
import { useAuthStore } from '@/src/store/authStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

// HELPER COMPONENTS

const StatItem = ({ icon, value, label, color, delay }: any) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    style={styles.statItem}
  >
    <View
      style={[
        styles.statIconBox,
        { backgroundColor: color + '20', borderColor: color + '40' },
      ]}
    >
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Animated.View>
)

const VerticalDivider = () => <View style={styles.statDivider} />

// MAIN SCREEN

export default function CompleteScreen() {
  const insets = useSafeAreaInsets()
  const profile = useAuthStore((s) => s.profile)
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)

  const glowScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.3)

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    ;(async () => {
      try {
        await completeOnboarding()
      } catch (e) {
        console.warn('[Complete] completeOnboarding failed:', e)
      }
    })()

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000 }),
        withTiming(1, { duration: 2000 }),
      ),
      -1,
      true,
    )
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 }),
      ),
      -1,
      true,
    )
  }, [])

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.replace('/(tabs)')
  }

  // Animated styles
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }))

  const firstName = profile?.full_name?.split(' ')[0] || 'Dreamer'

  const dreamsCount = 1
  const momentumDays = profile?.current_streak ?? 0
  const xp = profile?.total_xp ?? 0

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        {/* Subtle Ambient Light */}
        <View style={styles.ambientLight} />
      </View>

      {/* CONFETTI LAYER (Z-Index High) */}
      <View
        style={[StyleSheet.absoluteFill, { zIndex: 50, pointerEvents: 'none' }]}
      >
        <Confetti count={100} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        {/* SUCCESS CHECKMARK */}
        <View style={styles.checkWrapper}>
          {/* Glow Effect */}
          <Animated.View style={[styles.glowRing, glowStyle]} />

          {/* The Actual Check Component */}
          <Animated.View entering={ZoomIn.duration(600).springify()}>
            <SuccessCheck size={100} delay={300} />
          </Animated.View>
        </View>

        {/* TEXT CONTENT */}
        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          style={styles.textContainer}
        >
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Welcome to Momentum,{' '}
            <Text style={{ color: DARK.accent.rose }}>{firstName}</Text>
          </Text>
          <Text style={styles.description}>
            Your journey begins now. We've set up your profile and credited your
            first XP.
          </Text>
        </Animated.View>

        {/* STATS CARD (Glassmorphism) */}
        <Animated.View
          entering={FadeInUp.delay(900).springify()}
          style={styles.statsCardWrapper}
        >
          <BlurView
            intensity={30}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.statsBorder} />

          <View style={styles.statsContent}>
            <StatItem
              icon='sparkles'
              value={String(dreamsCount)}
              label='Dream'
              color={DARK.accent.rose}
              delay={1000}
            />
            <VerticalDivider />
            <StatItem
              icon='flame'
              value={String(momentumDays)}
              label='Days'
              color={DARK.accent.gold}
              delay={1100}
            />
            <VerticalDivider />
            <StatItem
              icon='trophy'
              value={String(xp)}
              label='XP'
              color={DARK.accent.violet}
              delay={1200}
            />
          </View>
        </Animated.View>
      </View>

      {/* BOTTOM BUTTON */}
      <Animated.View
        entering={FadeInDown.delay(1400).springify()}
        style={[
          styles.bottomSection,
          { paddingBottom: insets.bottom + SPACING.lg },
        ]}
      >
        {/* Custom Button Style for maximum polish */}
        <Button
          title="Let's Start Dreaming"
          onPress={handleStart}
          size='lg'
          fullWidth
          icon={<Ionicons name='arrow-forward' size={20} color='#FFF' />}
          iconPosition='right'
          style={styles.actionButton}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },
  ambientLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: DARK.accent.rose,
    opacity: 0.15,
    // Web support
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },

  // Checkmark Section
  checkWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['3xl'],
    marginTop: SPACING.xl,
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: DARK.accent.rose,
  },

  // Typography
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
    gap: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 34,
    color: DARK.text.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: DARK.text.secondary,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: DARK.text.tertiary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '85%',
    marginTop: SPACING.xs,
  },

  // Stats Card
  statsCardWrapper: {
    width: '100%',
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  statsBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS['2xl'],
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: DARK.text.primary,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: DARK.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  actionButton: {
    backgroundColor: DARK.accent.rose,
    shadowColor: DARK.accent.rose,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
})
