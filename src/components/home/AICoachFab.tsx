// src/components/home/AICoachFab.tsx

import React, { useEffect } from 'react'
import { Pressable, StyleSheet, View, Text } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { SPACING, PALETTE, GRADIENTS } from '@/src/constants/new-theme'

export function AICoachFab() {
  const glowScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.4)
  const pressScale = useSharedValue(1)
  const pulseRing = useSharedValue(0)

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 2000 }),
        withTiming(0.5, { duration: 2000 }),
      ),
      -1,
      true,
    )

    pulseRing.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    )
  }, [])

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }))

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }))

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulseRing.value, [0, 0.5, 1], [0.6, 0.2, 0]),
    transform: [{ scale: interpolate(pulseRing.value, [0, 1], [1, 1.8]) }],
  }))

  const handlePressIn = () => {
    pressScale.value = withSpring(0.9)
  }

  const handlePressOut = () => {
    pressScale.value = withSpring(1)
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(modals)/ai-coach')
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseRing,
          { borderColor: PALETTE.electric.indigo },
          pulseStyle,
        ]}
      />

      <Animated.View
        style={[
          styles.glow,
          { backgroundColor: PALETTE.electric.indigo },
          glowStyle,
        ]}
      />

      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.button, buttonStyle]}>
          <LinearGradient
            colors={[
              PALETTE.electric.indigo,
              PALETTE.electric.indigoDark,
              '#5b21b6',
            ]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.aiText}>AI</Text>
              <View
                style={[
                  styles.sparkle,
                  { backgroundColor: PALETTE.electric.cyan },
                ]}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    right: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  glow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  button: {
    shadowColor: PALETTE.electric.indigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  gradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
  },
  sparkle: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
})
