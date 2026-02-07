// src/components/celebrations/SparkBurst.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { FONTS, PALETTE } from '@/src/constants/new-theme'
import { useHaptics } from '@/src/hooks/useHaptics'

interface SparkParticle {
  id: number
  angle: number
  distance: number
  delay: number
  size: number
}

const generateParticles = (count: number): SparkParticle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * 30 - 15,
    distance: 60 + Math.random() * 40,
    delay: Math.random() * 200,
    size: 8 + Math.random() * 8,
  }))
}

interface SparkBurstProps {
  amount: number
  position: { x: number; y: number }
  onComplete?: () => void
}

export function SparkBurst({ amount, position, onComplete }: SparkBurstProps) {
  const particles = generateParticles(12)
  const { trigger } = useHaptics()

  useEffect(() => {
    trigger('spark')
  }, [])

  return (
    <View style={[styles.container, { left: position.x, top: position.y }]}>
      <CenterSpark amount={amount} onComplete={onComplete} />

      {particles.map((particle) => (
        <SparkParticleView key={particle.id} particle={particle} />
      ))}
    </View>
  )
}

function CenterSpark({
  amount,
  onComplete,
}: {
  amount: number
  onComplete?: () => void
}) {
  const scale = useSharedValue(0)
  const opacity = useSharedValue(1)
  const translateY = useSharedValue(0)

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10 }),
    )

    translateY.value = withDelay(
      800,
      withTiming(-50, { duration: 600, easing: Easing.out(Easing.cubic) }),
    )

    opacity.value = withDelay(
      1000,
      withTiming(0, { duration: 400 }, () => {
        if (onComplete) {
          runOnJS(onComplete)()
        }
      }),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={[styles.centerSpark, animatedStyle]}>
      <View style={styles.sparkIconBg}>
        <Ionicons name='sparkles' size={24} color={PALETTE.electric.emerald} />
      </View>
      <Text style={styles.sparkAmount}>+{amount}</Text>
    </Animated.View>
  )
}

function SparkParticleView({ particle }: { particle: SparkParticle }) {
  const progress = useSharedValue(0)
  const opacity = useSharedValue(1)

  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    )

    opacity.value = withDelay(
      particle.delay + 400,
      withTiming(0, { duration: 200 }),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    const radians = (particle.angle * Math.PI) / 180
    const x = Math.cos(radians) * particle.distance * progress.value
    const y = Math.sin(radians) * particle.distance * progress.value

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: 1 - progress.value * 0.5 },
      ],
      opacity: opacity.value,
    }
  })

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
        },
        animatedStyle,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  centerSpark: {
    alignItems: 'center',
    zIndex: 10,
  },
  sparkIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${PALETTE.electric.emerald}20`,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.electric.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  sparkAmount: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: PALETTE.electric.emerald,
    marginTop: 4,
  },
  particle: {
    position: 'absolute',
    backgroundColor: PALETTE.electric.cyan,
    shadowColor: PALETTE.electric.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
})
