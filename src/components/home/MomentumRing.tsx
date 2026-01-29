// src/components/home/MomentumRing.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface MomentumRingProps {
  currentMomentum: number
  todayProgress: number // 0-1
  totalSparks: number
  userName: string
  avatarUrl?: string
}

const SIZE = 200
const STROKE_WIDTH = 12
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function MomentumRing({
  currentMomentum,
  todayProgress,
  totalSparks,
  userName,
}: MomentumRingProps) {
  const progress = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.5)
  const sparkScale = useSharedValue(1)

  useEffect(() => {
    // Animate progress
    progress.value = withDelay(
      300,
      withTiming(todayProgress, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      }),
    )

    // Subtle pulse animation
    pulseScale.value = withSequence(
      withTiming(1.02, { duration: 1500 }),
      withTiming(1, { duration: 1500 }),
    )

    // Glow animation
    glowOpacity.value = withSequence(
      withTiming(0.7, { duration: 1500 }),
      withTiming(0.5, { duration: 1500 }),
    )
  }, [todayProgress])

  // Spark counter animation
  useEffect(() => {
    sparkScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 }),
    )
  }, [totalSparks])

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }))

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const sparkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkScale.value }],
  }))

  // Determine color based on momentum
  const getMomentumColor = () => {
    if (currentMomentum >= 30) return COLORS.accent[500]
    if (currentMomentum >= 14) return COLORS.primary[500]
    if (currentMomentum >= 7) return COLORS.secondary[500]
    return COLORS.success[500]
  }

  const momentumColor = getMomentumColor()

  return (
    <View style={styles.container}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glowOuter,
          glowStyle,
          {
            backgroundColor: momentumColor,
            shadowColor: momentumColor,
          },
        ]}
      />

      {/* Main ring */}
      <Animated.View style={[styles.ringContainer, pulseStyle]}>
        <Svg width={SIZE} height={SIZE} style={styles.svg}>
          <Defs>
            <LinearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
              <Stop offset='0%' stopColor={COLORS.primary[400]} />
              <Stop offset='50%' stopColor={COLORS.primary[500]} />
              <Stop offset='100%' stopColor={COLORS.secondary[500]} />
            </LinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={COLORS.neutral[100]}
            strokeWidth={STROKE_WIDTH}
            fill='none'
          />

          {/* Progress circle */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke='url(#gradient)'
            strokeWidth={STROKE_WIDTH}
            fill='none'
            strokeLinecap='round'
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedCircleProps}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          {/* Avatar placeholder or initials */}
          <View
            style={[styles.avatar, { backgroundColor: momentumColor + '20' }]}
          >
            <Text style={[styles.avatarText, { color: momentumColor }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Momentum badge */}
      <View style={[styles.momentumBadge, { backgroundColor: momentumColor }]}>
        <Ionicons name='flame' size={14} color='#FFF' />
        <Text style={styles.momentumText}>{currentMomentum}</Text>
      </View>

      {/* Stats below */}
      <View style={styles.statsContainer}>
        {/* Spark counter */}
        <Animated.View style={[styles.sparkContainer, sparkStyle]}>
          <View style={styles.sparkIcon}>
            <Ionicons name='sparkles' size={18} color={COLORS.accent[500]} />
          </View>
          <Text style={styles.sparkValue}>{totalSparks.toLocaleString()}</Text>
          <Text style={styles.sparkLabel}>{LANGUAGE.spark.plural}</Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  glowOuter: {
    position: 'absolute',
    width: SIZE + 40,
    height: SIZE + 40,
    borderRadius: (SIZE + 40) / 2,
    top: SPACING.lg - 20,
    opacity: 0.15,
  },
  ringContainer: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: SIZE * 0.55,
    height: SIZE * 0.55,
    borderRadius: SIZE * 0.275,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 48,
  },
  momentumBadge: {
    position: 'absolute',
    top: SPACING.lg + 10,
    right: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  momentumText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFF',
  },
  statsContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  sparkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.accent[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  sparkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.neutral[900],
  },
  sparkLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[500],
  },
})
