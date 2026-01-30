// src/components/home/AICoachFab.tsx
import React, { useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { DARK, RADIUS, SHADOWS, SPACING } from '@/src/constants/theme'

export function AICoachFab() {
  const glowScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.5)
  const pressScale = useSharedValue(1)

  useEffect(() => {
    // Breathing animation
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2500 }),
        withTiming(1, { duration: 2500 }),
      ),
      -1,
      true,
    )
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 2500 }),
        withTiming(0.5, { duration: 2500 }),
      ),
      -1,
      true,
    )
  }, [])

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }))

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
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
      {/* Outer Glow Ring */}
      <Animated.View style={[styles.glow, glowStyle]} />

      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.button, buttonStyle]}>
          <LinearGradient
            colors={[DARK.accent.violet, '#7C3AED']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name='sparkles' size={24} color='#FFF' />
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150, // Sits above the Tab Bar
    right: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  glow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DARK.accent.violet,
    shadowColor: DARK.accent.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
})
