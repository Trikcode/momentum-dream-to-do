// src/components/journey/StatOrb.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING, SHADOWS } from '@/src/constants/theme'

interface StatOrbProps {
  value: number | string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  gradient: [string, string]
  delay?: number
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function StatOrb({
  value,
  label,
  icon,
  gradient,
  delay = 0,
  size = 'md',
  animated = true,
}: StatOrbProps) {
  const scale = useSharedValue(0)
  const glowOpacity = useSharedValue(0)
  const floatY = useSharedValue(0)

  const sizeConfig = {
    sm: { orb: 70, icon: 20, value: 18, label: 10 },
    md: { orb: 90, icon: 26, value: 24, label: 11 },
    lg: { orb: 110, icon: 32, value: 30, label: 12 },
  }

  const config = sizeConfig[size]

  useEffect(() => {
    if (!animated) {
      scale.value = 1
      glowOpacity.value = 0.4
      return
    }

    // Entry animation
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 10, stiffness: 100 }),
    )

    glowOpacity.value = withDelay(
      delay + 200,
      withTiming(0.4, { duration: 500 }),
    )

    // Float animation
    floatY.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
  }, [animated, delay])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: floatY.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1 + glowOpacity.value * 0.2 }],
  }))

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glow,
            {
              width: config.orb * 1.4,
              height: config.orb * 1.4,
              borderRadius: config.orb * 0.7,
              backgroundColor: gradient[0],
            },
            glowStyle,
          ]}
        />

        {/* Main orb */}
        <LinearGradient
          colors={gradient}
          style={[
            styles.orb,
            {
              width: config.orb,
              height: config.orb,
              borderRadius: config.orb / 2,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { marginBottom: size === 'sm' ? 2 : 4 },
            ]}
          >
            <Ionicons
              name={icon}
              size={config.icon}
              color='rgba(255,255,255,0.9)'
            />
          </View>

          {/* Value */}
          <Text style={[styles.value, { fontSize: config.value }]}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Label */}
      <Text style={[styles.label, { fontSize: config.label }]}>{label}</Text>
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
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  iconContainer: {
    opacity: 0.9,
  },
  value: {
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  label: {
    fontFamily: FONTS.medium,
    color: COLORS.neutral[500],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
})
