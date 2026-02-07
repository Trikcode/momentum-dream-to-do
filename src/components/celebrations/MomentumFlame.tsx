import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { FONTS, SPACING, PALETTE } from '@/src/constants/new-theme'

interface MomentumFlameProps {
  days: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

export function MomentumFlame({
  days,
  size = 'md',
  showLabel = true,
  animated = true,
}: MomentumFlameProps) {
  const flicker = useSharedValue(0)
  const glow = useSharedValue(0)
  const scale = useSharedValue(1)

  const sizeConfig = {
    sm: { container: 40, icon: 20, font: 12 },
    md: { container: 56, icon: 28, font: 16 },
    lg: { container: 80, icon: 40, font: 24 },
  }

  const config = sizeConfig[size]

  const getFlameColors = (): [string, string, string] => {
    if (days >= 30)
      return [
        PALETTE.electric.cyan,
        PALETTE.electric.emerald,
        PALETTE.status.warning,
      ]
    if (days >= 14)
      return [
        PALETTE.electric.indigo,
        PALETTE.electric.cyan,
        PALETTE.electric.emerald,
      ]
    if (days >= 7)
      return [
        PALETTE.electric.cyan,
        PALETTE.electric.cyanLight,
        PALETTE.status.warning,
      ]
    if (days >= 3)
      return [
        PALETTE.electric.emerald,
        PALETTE.electric.emeraldLight,
        PALETTE.status.warning,
      ]
    return [
      PALETTE.electric.cyanLight,
      PALETTE.electric.emeraldLight,
      PALETTE.status.warningLight,
    ]
  }

  const flameColors = getFlameColors()

  useEffect(() => {
    if (!animated) return

    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 200 }),
        withTiming(1, { duration: 250 }),
        withTiming(0.8, { duration: 300 }),
      ),
      -1,
      true,
    )

    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 }),
      ),
      -1,
      true,
    )

    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
      true,
    )
  }, [animated])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animated ? scale.value : 1 }],
  }))

  const flameStyle = useAnimatedStyle(() => ({
    opacity: animated ? interpolate(flicker.value, [0, 1], [0.85, 1]) : 1,
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: animated ? interpolate(glow.value, [0, 1], [0.2, 0.5]) : 0.3,
    transform: [{ scale: 1 + (animated ? glow.value * 0.2 : 0) }],
  }))

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.View
          style={[
            styles.glow,
            {
              width: config.container * 1.8,
              height: config.container * 1.8,
              backgroundColor: flameColors[0],
            },
            glowStyle,
          ]}
        />

        <Animated.View style={flameStyle}>
          <LinearGradient
            colors={flameColors}
            style={[
              styles.flameContainer,
              {
                width: config.container,
                height: config.container,
                borderRadius: config.container / 2,
              },
            ]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          >
            <Ionicons
              name='flame'
              size={config.icon}
              color={PALETTE.midnight.obsidian}
            />
          </LinearGradient>
        </Animated.View>

        <View style={[styles.badge, { minWidth: config.container * 0.6 }]}>
          <Text style={[styles.badgeText, { fontSize: config.font * 0.75 }]}>
            {days}
          </Text>
        </View>
      </Animated.View>

      {showLabel && (
        <Text style={styles.label}>
          {days === 1 ? 'day' : 'days'} of momentum
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 100,
  },
  flameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.electric.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: PALETTE.midnight.obsidian,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PALETTE.midnight.slate,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    color: '#FFF',
    textAlign: 'center',
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: PALETTE.slate[500],
    marginTop: SPACING.sm,
  },
})
