// src/components/home/MomentumRing.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { DARK, FONTS, SPACING } from '@/src/constants/theme'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const SIZE = 220
const STROKE_WIDTH = 16
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function MomentumRing({
  currentMomentum,
  todayProgress,
  totalSparks,
  userName,
}: any) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(todayProgress, {
      duration: 1500,
      easing: Easing.out(Easing.exp),
    })
  }, [todayProgress])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }))

  return (
    <View style={styles.container}>
      {/* GLOW BACKGROUND */}
      <View style={styles.glowBg} />

      {/* SVG RING */}
      <View style={styles.ringWrapper}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id='grad' x1='0' y1='0' x2='1' y2='1'>
              <Stop offset='0' stopColor={DARK.accent.rose} />
              <Stop offset='1' stopColor={DARK.accent.gold} />
            </LinearGradient>
          </Defs>
          {/* Track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke='rgba(255,255,255,0.05)'
            strokeWidth={STROKE_WIDTH}
            fill='none'
          />
          {/* Progress */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke='url(#grad)'
            strokeWidth={STROKE_WIDTH}
            fill='none'
            strokeLinecap='round'
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>

        {/* INNER CONTENT */}
        <View style={styles.innerContent}>
          <View style={styles.initialCircle}>
            <Text style={styles.initialText}>{userName.charAt(0)}</Text>
          </View>
        </View>
      </View>

      {/* STATS BADGE */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Ionicons name='flame' size={14} color={DARK.accent.rose} />
          <Text style={styles.statText}>{currentMomentum} Days</Text>
        </View>
        <View style={styles.statPill}>
          <Ionicons name='sparkles' size={14} color={DARK.accent.gold} />
          <Text style={styles.statText}>{totalSparks} XP</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: SPACING.md },
  glowBg: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    backgroundColor: DARK.accent.rose,
    borderRadius: SIZE / 2,
    opacity: 0.1,
    filter: 'blur(50px)',
  },
  ringWrapper: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  initialText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: DARK.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -20,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DARK.bg.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARK.border.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statText: {
    color: DARK.text.secondary,
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
})
