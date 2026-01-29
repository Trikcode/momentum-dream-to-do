// src/components/shared/GlassCard.tsx
import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import {
  COLORS,
  RADIUS,
  SPACING,
  SHADOWS,
  SPRING_CONFIGS,
} from '@/src/constants/theme'

interface GlassCardProps {
  children: React.ReactNode
  intensity?: number
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onPress?: () => void
  glowColor?: string
  style?: ViewStyle
  animated?: boolean
}

export function GlassCard({
  children,
  intensity = 60,
  padding = 'md',
  onPress,
  glowColor,
  style,
  animated = true,
}: GlassCardProps) {
  const scale = useSharedValue(1)
  const pressed = useSharedValue(false)

  const gesture = Gesture.Tap()
    .onBegin(() => {
      if (onPress && animated) {
        scale.value = withSpring(0.97, SPRING_CONFIGS.snappy)
        pressed.value = true
      }
    })
    .onFinalize(() => {
      if (animated) {
        scale.value = withSpring(1, SPRING_CONFIGS.snappy)
        pressed.value = false
      }
      if (onPress) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const paddingValue = {
    none: 0,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
  }

  const content = (
    <View style={[styles.container, { padding: paddingValue[padding] }, style]}>
      {/* Glass background */}
      <BlurView intensity={intensity} style={styles.blur} tint='light' />

      {/* Gradient border effect */}
      <LinearGradient
        colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGradient}
      />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  )

  if (onPress) {
    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyle}>{content}</Animated.View>
      </GestureDetector>
    )
  }

  return content
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.glass.medium,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  borderGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.xl,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
})
