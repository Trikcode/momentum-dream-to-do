import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'

import { Confetti } from '@/src/components/celebrations/Confetti'
import { SuccessCheck } from '@/src/components/celebrations/SuccessCheck'
import { Button } from '@/src/components/ui/Button'
import { useAuthStore } from '@/src/store/authStore'
import {
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'

const StatItem = ({ icon, value, label, color, delay }: any) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    style={styles.statItem}
  >
    <View
      style={[
        styles.statIconBox,
        { backgroundColor: color + '15', borderColor: color + '30' },
      ]}
    >
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Animated.View>
)

const VerticalDivider = () => <View style={styles.statDivider} />

export default function CompleteScreen() {
  const insets = useSafeAreaInsets()
  const { profile, completeOnboarding } = useAuthStore()

  const glowScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.3)

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    const finishSetup = async () => {
      try {
        await completeOnboarding()
      } catch (e) {
        console.warn('[Complete] completeOnboarding failed:', e)
      }
    }
    finishSetup()

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )
  }, [])

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.replace('/(tabs)')
  }

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }))

  const firstName = profile?.full_name?.split(' ')[0] || 'Dreamer'
  const dreamsCount = 1
  const momentumDays = 1
  const xp = 50

  return (
    <View
      style={[styles.container, { backgroundColor: PALETTE.midnight.obsidian }]}
    >
      <StatusBar barStyle='light-content' />

      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            PALETTE.midnight.obsidian,
            PALETTE.midnight.slate,
            PALETTE.midnight.obsidian,
          ]}
          style={StyleSheet.absoluteFill}
        />

        {Platform.OS === 'ios' && (
          <BlurView
            intensity={40}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      <View
        style={[StyleSheet.absoluteFill, { zIndex: 50, pointerEvents: 'none' }]}
      >
        <Confetti count={60} duration={3000} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <View style={styles.checkWrapper}>
          <Animated.View
            style={[
              styles.glowRing,
              glowStyle,
              { backgroundColor: PALETTE.electric.cyan },
            ]}
          />
          <Animated.View entering={ZoomIn.duration(600).springify()}>
            <SuccessCheck size={100} delay={200} />
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          style={styles.textContainer}
        >
          <Text style={styles.title}>You're Ready.</Text>
          <Text style={styles.subtitle}>
            Welcome to the club,{' '}
            <Text style={{ color: PALETTE.electric.cyan }}>{firstName}.</Text>
          </Text>
          <Text style={styles.description}>
            Your system is live. Your first dream is set. {'\n'}
            It's time to build your legacy.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          style={styles.statsCardWrapper}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={40}
              tint='dark'
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.statsBorder} />
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.statsContent}>
            <StatItem
              icon='sparkles'
              value={String(dreamsCount)}
              label='Dream'
              color={PALETTE.electric.cyan}
              delay={900}
            />
            <VerticalDivider />
            <StatItem
              icon='flame'
              value={String(momentumDays)}
              label='Day 1'
              color={PALETTE.electric.emerald}
              delay={1000}
            />
            <VerticalDivider />
            <StatItem
              icon='trophy'
              value={`+${xp}`}
              label='XP Earned'
              color={PALETTE.electric.indigo}
              delay={1100}
            />
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(1200).springify()}
        style={[
          styles.bottomSection,
          { paddingBottom: insets.bottom + SPACING.lg },
        ]}
      >
        <Button
          title="Let's Start Dreaming"
          onPress={handleStart}
          size='lg'
          variant='dark-accent'
          fullWidth
          icon={
            <Ionicons
              name='arrow-forward'
              size={20}
              color={PALETTE.midnight.obsidian}
            />
          }
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
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  checkWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['3xl'],
    marginTop: SPACING.xl,
    height: 160,
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
    gap: SPACING.xs,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 36,
    color: '#FFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: PALETTE.slate[400],
    textAlign: 'center',
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: PALETTE.slate[500],
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '85%',
    marginTop: SPACING.sm,
  },
  statsCardWrapper: {
    width: '100%',
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#FFF',
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: PALETTE.slate[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bottomSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    width: '100%',
  },
  actionButton: {
    ...SHADOWS.glow(PALETTE.electric.cyan),
  },
})
