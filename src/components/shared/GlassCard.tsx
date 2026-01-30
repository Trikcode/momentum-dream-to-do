// src/components/shared/GlassCard.tsx
import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { BlurView } from 'expo-blur'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import { RADIUS, SPACING } from '@/src/constants/theme'

interface GlassCardProps {
  children: React.ReactNode
  intensity?: number
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onPress?: () => void
  style?: ViewStyle
}

export function GlassCard({
  children,
  intensity = 40,
  padding = 'md',
  onPress,
  style,
}: GlassCardProps) {
  const scale = useSharedValue(1)

  const gesture = Gesture.Tap()
    .onBegin(() => {
      if (onPress) scale.value = withSpring(0.98)
    })
    .onFinalize(() => {
      if (onPress) {
        scale.value = withSpring(1)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const paddingMap = { none: 0, sm: SPACING.sm, md: SPACING.md, lg: SPACING.lg }

  const content = (
    <View style={[styles.container, { padding: paddingMap[padding] }, style]}>
      <BlurView
        intensity={intensity}
        tint='dark'
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.border} />
      <View style={{ zIndex: 1 }}>{children}</View>
    </View>
  )

  if (onPress)
    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyle}>{content}</Animated.View>
      </GestureDetector>
    )
  return content
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 22, 30, 0.4)',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.xl,
  },
})
