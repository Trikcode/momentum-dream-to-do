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
  ZoomIn,
} from 'react-native-reanimated'
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Circle,
} from 'react-native-svg'
import * as Haptics from 'expo-haptics'

// NEW: Import new theme system
import { useTheme } from '@/src/context/ThemeContext'
import {
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'

const { width, height } = Dimensions.get('window')

// ============================================================================
// AMBIENT BACKGROUND
// ============================================================================
const BreathingBlob = ({
  color,
  size,
  top,
  left,
  delay = 0,
}: {
  color: string
  size: number
  top: number
  left: number
  delay?: number
}) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, {
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 4000 }),
          withTiming(0.4, { duration: 4000 }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
        },
        animatedStyle,
      ]}
    />
  )
}

// ============================================================================
// HERO VISUAL: THE ASCENT
// ============================================================================
const MomentumVisual = () => {
  const { colors } = useTheme()
  const progress = useSharedValue(0)
  const AnimatedPath = Animated.createAnimatedComponent(Path)
  const AnimatedCircle = Animated.createAnimatedComponent(Circle)

  useEffect(() => {
    progress.value = withDelay(
      600,
      withTiming(1, { duration: 2500, easing: Easing.out(Easing.cubic) }),
    )
  }, [])

  const pathProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [1000, 0]),
    opacity: progress.value,
  }))

  const circleProps = useAnimatedProps(() => {
    const t = progress.value
    const x = interpolate(t, [0, 1], [40, 260])
    const y = interpolate(t, [0, 0.4, 1], [140, 100, 40], Extrapolation.CLAMP)
    return { cx: x, cy: y, opacity: t > 0.05 ? 1 : 0 }
  })

  return (
    <View style={styles.visualWrapper}>
      <Svg width={300} height={180} viewBox='0 0 300 180'>
        <Defs>
          <SvgGradient id='chartGrad' x1='0' y1='0' x2='1' y2='0'>
            <Stop
              offset='0'
              stopColor={PALETTE.electric.cyan}
              stopOpacity='0.4'
            />
            <Stop
              offset='1'
              stopColor={PALETTE.electric.emerald}
              stopOpacity='1'
            />
          </SvgGradient>
          <SvgGradient id='fillGrad' x1='0' y1='0' x2='0' y2='1'>
            <Stop
              offset='0'
              stopColor={PALETTE.electric.cyan}
              stopOpacity='0.15'
            />
            <Stop offset='1' stopColor='transparent' stopOpacity='0' />
          </SvgGradient>
        </Defs>

        {/* Glow Fill */}
        <AnimatedPath
          d='M 40 140 C 120 140, 160 100, 260 40 L 260 180 L 40 180 Z'
          fill='url(#fillGrad)'
        />

        {/* The Line */}
        <AnimatedPath
          d='M 40 140 C 120 140, 160 100, 260 40'
          stroke='url(#chartGrad)'
          strokeWidth='6'
          strokeLinecap='round'
          fill='none'
          strokeDasharray={1000}
          animatedProps={pathProps}
        />
        <AnimatedPath
          d='M 40 140 C 120 140, 160 100, 260 40 L 260 180 L 40 180 Z'
          fill='url(#fillGrad)'
          animatedProps={useAnimatedProps(() => ({
            opacity: progress.value,
          }))}
        />

        {/* The Spark */}
        <AnimatedCircle
          r='8'
          fill={colors.background}
          stroke={PALETTE.electric.emerald}
          strokeWidth='3'
          animatedProps={circleProps}
        />
      </Svg>
    </View>
  )
}

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(auth)/sign-up' as Href)
  }

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push('/(auth)/sign-in' as Href)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle='light-content' />

      {/* --- BACKGROUND LAYERS --- */}
      <View style={StyleSheet.absoluteFill}>
        {/* Base gradient */}
        <LinearGradient
          colors={GRADIENTS.midnight}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* Animated Orbs - Electric colors */}

        <BreathingBlob
          color={PALETTE.electric.indigo}
          size={280}
          top={height * 0.3}
          left={width * 0.4}
          delay={2000}
        />

        {/* Blur Overlay */}
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={50}
            style={StyleSheet.absoluteFill}
            tint='dark'
          />
        )}
      </View>

      {/* --- FOREGROUND CONTENT --- */}
      <View style={[styles.content, { paddingTop: insets.top + SPACING.lg }]}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.header}
        >
          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${PALETTE.electric.cyan}15`,
                borderColor: `${PALETTE.electric.cyan}40`,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: PALETTE.electric.cyan }]}>
              DREAM TO DO
            </Text>
          </View>
          <Text style={styles.appName}>Momentum</Text>
        </Animated.View>

        {/* Visual Centerpiece */}
        <Animated.View
          entering={ZoomIn.delay(500).springify()}
          style={styles.visualContainer}
        >
          <MomentumVisual />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          entering={FadeInDown.delay(800).springify().damping(18)}
          style={styles.bottomSection}
        >
          <View
            style={[
              styles.glassCard,
              {
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            ]}
          >
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={30}
                tint='dark'
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={styles.glassBorder} />

            <View
              style={[
                styles.cardContent,
                { paddingBottom: insets.bottom + 20 },
              ]}
            >
              <Text style={styles.headline}>
                Design a life{'\n'}
                <Text
                  style={[styles.highlight, { color: PALETTE.electric.cyan }]}
                >
                  you love.
                </Text>
              </Text>

              <Text style={[styles.subheadline, { color: PALETTE.slate[400] }]}>
                Turn "one day" into "today". The daily coach for ambitious women
                ready to rise.
              </Text>

              {/* Primary Button - Electric gradient */}
              <Pressable
                onPress={handleGetStarted}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <LinearGradient
                  colors={GRADIENTS.electric}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: PALETTE.midnight.obsidian },
                  ]}
                >
                  Start My Journey
                </Text>
                <View style={styles.flare} />
              </Pressable>

              {/* Secondary Button */}
              <Pressable onPress={handleSignIn} style={styles.secondaryButton}>
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: PALETTE.slate[400] },
                  ]}
                >
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
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    alignItems: 'center',
    marginTop: SPACING['2xl'],
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONTS.semiBold,
    letterSpacing: 2,
  },
  appName: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: FONTS.bold,
    letterSpacing: -0.5,
  },

  // Visual
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 250,
  },
  visualWrapper: {
    width: 300,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Card
  bottomSection: {
    width: '100%',
  },
  glassCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  glassBorder: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    padding: 32,
    paddingTop: 40,
  },
  headline: {
    fontSize: 34,
    fontFamily: FONTS.bold,
    color: '#FFF',
    lineHeight: 40,
    marginBottom: 12,
    textAlign: 'center',
  },
  highlight: {},
  subheadline: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },

  // Buttons
  primaryButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.glow(PALETTE.electric.cyan),
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    zIndex: 1,
  },
  flare: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }, { translateX: 20 }],
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
})
