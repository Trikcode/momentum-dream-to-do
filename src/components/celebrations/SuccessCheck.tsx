// src/components/celebrations/SuccessCheck.tsx
import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { PALETTE, GRADIENTS, SHADOWS } from '@/src/constants/new-theme'

interface SuccessCheckProps {
  size?: number
  delay?: number
}

export function SuccessCheck({ size = 100, delay = 0 }: SuccessCheckProps) {
  const scale = useSharedValue(0)
  const checkScale = useSharedValue(0)
  const ringScale = useSharedValue(0.5)
  const ringOpacity = useSharedValue(0)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 100 }),
    )

    ringOpacity.value = withDelay(
      delay + 100,
      withTiming(0.6, { duration: 100 }),
    )
    ringScale.value = withDelay(
      delay + 100,
      withTiming(2, { duration: 600, easing: Easing.out(Easing.ease) }),
    )
    ringOpacity.value = withDelay(delay + 300, withTiming(0, { duration: 400 }))

    checkScale.value = withDelay(
      delay + 250,
      withSpring(1, { damping: 12, stiffness: 150 }),
    )
  }, [])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }))

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }))

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2 },
          ringStyle,
        ]}
      />

      <Animated.View style={[StyleSheet.absoluteFill, containerStyle]}>
        <LinearGradient
          colors={GRADIENTS.electric}
          style={[
            styles.circle,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Animated.View style={checkStyle}>
            <Ionicons
              name='checkmark'
              size={size * 0.5}
              color={PALETTE.midnight.obsidian}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.electric.cyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: PALETTE.electric.cyan,
  },
})
