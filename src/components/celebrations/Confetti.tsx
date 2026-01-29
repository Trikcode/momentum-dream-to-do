// src/components/celebrations/Confetti.tsx
import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { COLORS } from '@/src/constants/theme'

const { width, height } = Dimensions.get('window')

const CONFETTI_COLORS = [
  COLORS.primary[400],
  COLORS.primary[500],
  COLORS.secondary[400],
  COLORS.secondary[500],
  COLORS.accent[400],
  COLORS.accent[500],
  COLORS.success[400],
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
]

interface ConfettiPieceProps {
  index: number
  startDelay: number
}

function ConfettiPiece({ index, startDelay }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50)
  const translateX = useSharedValue(0)
  const rotate = useSharedValue(0)
  const opacity = useSharedValue(1)
  const scale = useSharedValue(1)

  const startX = Math.random() * width
  const endX = startX + (Math.random() - 0.5) * 200
  const duration = 2500 + Math.random() * 1500
  const size = 8 + Math.random() * 8
  const color =
    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
  const isCircle = Math.random() > 0.5

  useEffect(() => {
    translateY.value = withDelay(
      startDelay,
      withTiming(height + 100, {
        duration,
        easing: Easing.out(Easing.quad),
      }),
    )

    translateX.value = withDelay(
      startDelay,
      withSequence(
        withTiming(endX - startX, { duration: duration / 2 }),
        withTiming((endX - startX) * 0.5, { duration: duration / 2 }),
      ),
    )

    rotate.value = withDelay(
      startDelay,
      withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false,
      ),
    )

    opacity.value = withDelay(
      startDelay + duration - 500,
      withTiming(0, { duration: 500 }),
    )

    scale.value = withDelay(
      startDelay,
      withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 200 }),
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          width: size,
          height: isCircle ? size : size * 2,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  )
}

interface ConfettiProps {
  count?: number
  duration?: number
  onComplete?: () => void
}

export function Confetti({
  count = 50,
  duration = 4000,
  onComplete,
}: ConfettiProps) {
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onComplete])

  return (
    <View style={styles.container} pointerEvents='none'>
      {Array.from({ length: count }).map((_, index) => (
        <ConfettiPiece
          key={index}
          index={index}
          startDelay={Math.random() * 500}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
})
