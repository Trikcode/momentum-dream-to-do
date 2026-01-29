// src/components/celebrations/SuccessCheck.tsx
import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '@/src/constants/theme'

interface SuccessCheckProps {
  size?: number
  delay?: number
}

export function SuccessCheck({ size = 120, delay = 0 }: SuccessCheckProps) {
  const scale = useSharedValue(0)
  const checkScale = useSharedValue(0)
  const ringScale = useSharedValue(0)
  const ringOpacity = useSharedValue(1)

  useEffect(() => {
    // Circle animation
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 100,
      }),
    )

    // Check animation
    checkScale.value = withDelay(
      delay + 300,
      withSpring(1, {
        damping: 10,
        stiffness: 150,
      }),
    )

    // Ring animation
    ringScale.value = withDelay(
      delay + 200,
      withTiming(2, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      }),
    )

    ringOpacity.value = withDelay(
      delay + 200,
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      }),
    )
  }, [])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }))

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }))

  return (
    <View style={styles.container}>
      {/* Expanding ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          ringStyle,
        ]}
      />

      {/* Main circle */}
      <Animated.View style={containerStyle}>
        <LinearGradient
          colors={[COLORS.success[400], COLORS.success[600]]}
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Animated.View style={checkStyle}>
            <Ionicons name='checkmark' size={size * 0.5} color='#FFF' />
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
    shadowColor: COLORS.success[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: COLORS.success[400],
  },
})
