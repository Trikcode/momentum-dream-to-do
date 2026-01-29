// src/components/ui/Card.tsx
import React from 'react'
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/src/constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface CardProps {
  children: React.ReactNode
  variant?: 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onPress?: () => void
  style?: ViewStyle
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
}: CardProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98)
    }
  }

  const handlePressOut = () => {
    scale.value = withSpring(1)
  }

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }
  }

  const paddingValue = {
    none: 0,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
  }

  const Container = onPress ? AnimatedPressable : Animated.View

  return (
    <Container
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'filled' && styles.filled,
        { padding: paddingValue[padding] },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Container>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  elevated: {
    ...SHADOWS.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  filled: {
    backgroundColor: COLORS.neutral[50],
  },
})
