// app/(auth)/welcome.tsx
import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  StatusBar,
  Platform,
} from 'react-native'
import { router, Href } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedProps,
  Extrapolation,
} from 'react-native-reanimated'
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Circle,
} from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const { width, height } = Dimensions.get('window')

// ============================================================================
// ANIMATED BACKGROUND BLOB
// ============================================================================
interface BlobProps {
  color: string
  size: number
  top: number
  left: number
  delay?: number
}

const BreathingBlob = ({ color, size, top, left, delay = 0 }: BlobProps) => {
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, {
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, {
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.5,
        },
        animatedStyle,
      ]}
    />
  )
}

// ============================================================================
// MOMENTUM VISUAL
// ============================================================================
const MomentumVisual = () => {
  const progress = useSharedValue(0)
  const AnimatedPath = Animated.createAnimatedComponent(Path)
  const AnimatedCircle = Animated.createAnimatedComponent(Circle)

  useEffect(() => {
    progress.value = withDelay(
      300,
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) }),
    )
  }, [])

  const pathProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [1000, 0]),
  }))

  const circleProps = useAnimatedProps(() => {
    const t = progress.value
    const x = interpolate(t, [0, 1], [20, 280])
    const y = interpolate(t, [0, 0.5, 1], [120, 90, 20], Extrapolation.CLAMP)
    return { cx: x, cy: y, opacity: t > 0.1 ? 1 : 0 }
  })

  return (
    <View style={styles.visualWrapper}>
      <Svg width={300} height={150} viewBox='0 0 300 150'>
        <Defs>
          <SvgGradient id='lineGradient' x1='0' y1='0' x2='1' y2='0'>
            <Stop offset='0' stopColor={DARK.accent.rose} stopOpacity={0.3} />
            <Stop offset='1' stopColor={DARK.accent.gold} stopOpacity={1} />
          </SvgGradient>
        </Defs>

        <AnimatedPath
          d='M 20 120 C 100 120, 150 80, 280 20'
          stroke='url(#lineGradient)'
          strokeWidth='6'
          strokeLinecap='round'
          fill='none'
          strokeDasharray={1000}
          animatedProps={pathProps}
        />

        <AnimatedCircle
          r='8'
          fill={DARK.bg.primary}
          stroke={DARK.accent.gold}
          strokeWidth='3'
          animatedProps={circleProps}
        />
      </Svg>
    </View>
  )
}

// ============================================================================
// WELCOME SCREEN
// ============================================================================
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets()

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(auth)/sign-up' as Href)
  }

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push('/(auth)/sign-in' as Href)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: DARK.bg.primary },
          ]}
        />

        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />

        <BreathingBlob
          color={DARK.accent.rose}
          size={300}
          top={-50}
          left={-100}
          delay={0}
        />
        <BreathingBlob
          color={DARK.accent.violet}
          size={250}
          top={height * 0.4}
          left={width * 0.5}
          delay={1000}
        />

        {Platform.OS === 'ios' && (
          <BlurView
            intensity={60}
            style={StyleSheet.absoluteFill}
            tint='dark'
          />
        )}
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top }]}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DREAM TO DO</Text>
          </View>
          <Text style={styles.appName}>Momentum</Text>
        </Animated.View>

        {/* Visual */}
        <View style={styles.visualContainer}>
          <MomentumVisual />
        </View>

        {/* Bottom Card */}
        <Animated.View
          entering={FadeInDown.delay(500).springify().damping(15)}
          style={styles.bottomSection}
        >
          <View style={styles.glassCard}>
            <BlurView
              intensity={40}
              tint='dark'
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.glassBorder} />

            <View
              style={[
                styles.cardContent,
                { paddingBottom: insets.bottom + 20 },
              ]}
            >
              <Text style={styles.headline}>
                Ignite your{'\n'}
                <Text style={{ color: DARK.accent.rose }}>ambition.</Text>
              </Text>

              <Text style={styles.subheadline}>
                Transform big dreams into unstoppable daily progress. Join the
                movement.
              </Text>

              {/* Primary Button */}
              <Pressable onPress={handleGetStarted}>
                {({ pressed }) => (
                  <Animated.View
                    style={[
                      styles.primaryButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={DARK.gradients.primary as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                  </Animated.View>
                )}
              </Pressable>

              {/* Secondary Button */}
              <Pressable onPress={handleSignIn} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>
                  I already have an account
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  )
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: SPACING['4xl'],
  },
  badge: {
    backgroundColor: DARK.badge.gold.bg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: DARK.badge.gold.border,
  },
  badgeText: {
    color: DARK.badge.gold.text,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    letterSpacing: 1.5,
  },
  appName: {
    color: DARK.text.primary,
    fontSize: 40,
    fontFamily: FONTS.bold,
    letterSpacing: -1,
  },

  // Visual
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  visualWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },

  // Bottom Card
  bottomSection: {
    width: '100%',
  },
  glassCard: {
    borderTopLeftRadius: RADIUS['3xl'],
    borderTopRightRadius: RADIUS['3xl'],
    overflow: 'hidden',
    backgroundColor: DARK.bg.card,
  },
  glassBorder: {
    height: 1,
    width: '100%',
    backgroundColor: DARK.border.light,
  },
  cardContent: {
    padding: SPACING['3xl'],
    paddingTop: SPACING['4xl'],
  },
  headline: {
    fontSize: 34,
    fontFamily: FONTS.bold,
    color: DARK.text.primary,
    lineHeight: 42,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: DARK.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING['3xl'],
  },

  primaryButton: {
    height: 56,
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...DARK.glow.rose,
  },
  primaryButtonText: {
    color: DARK.text.primary,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    zIndex: 1,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  secondaryButton: {
    height: 48,
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: DARK.text.tertiary,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
})
