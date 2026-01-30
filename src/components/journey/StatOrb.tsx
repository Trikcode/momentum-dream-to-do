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
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { DARK, FONTS, SPACING } from '@/src/constants/theme'

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
    sm: { orb: 70, icon: 20, value: 16, label: 10 },
    md: { orb: 90, icon: 24, value: 20, label: 12 },
    lg: { orb: 110, icon: 30, value: 26, label: 13 },
  }

  const config = sizeConfig[size]

  useEffect(() => {
    if (!animated) {
      scale.value = 1
      glowOpacity.value = 0.3
      return
    }

    scale.value = withDelay(delay, withSpring(1, { damping: 12 }))
    glowOpacity.value = withDelay(
      delay + 200,
      withTiming(0.3, { duration: 800 }),
    )

    floatY.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
          withTiming(4, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
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
    transform: [{ scale: 1.4 }], // Constant scale for glow
  }))

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Glow */}
        <Animated.View
          style={[
            styles.glow,
            {
              width: config.orb,
              height: config.orb,
              borderRadius: config.orb / 2,
              backgroundColor: gradient[0],
            },
            glowStyle,
          ]}
        />

        {/* Orb */}
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
          <Text style={[styles.value, { fontSize: config.value }]}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Text style={[styles.label, { fontSize: config.label }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  container: { alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', filter: 'blur(20px)' },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconContainer: { opacity: 0.8 },
  value: { fontFamily: FONTS.bold, color: '#FFF' },
  label: {
    fontFamily: FONTS.medium,
    color: DARK.text.secondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
})
