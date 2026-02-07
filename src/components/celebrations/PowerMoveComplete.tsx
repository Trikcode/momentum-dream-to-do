// src/components/celebrations/PowerMoveComplete.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Confetti } from './Confetti'
import {
  FONTS,
  SPACING,
  SHADOWS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'
import { useHaptics } from '@/src/hooks/useHaptics'
import { getRandomCelebration } from '@/src/constants/language'

const { width, height } = Dimensions.get('window')

interface PowerMoveCompleteProps {
  title: string
  sparksEarned: number
  onComplete: () => void
}

export function PowerMoveComplete({
  title,
  sparksEarned,
  onComplete,
}: PowerMoveCompleteProps) {
  const { trigger } = useHaptics()

  const checkScale = useSharedValue(0)
  const checkOpacity = useSharedValue(0)
  const ringScale = useSharedValue(0)
  const ringOpacity = useSharedValue(1)
  const contentOpacity = useSharedValue(0)
  const contentY = useSharedValue(20)
  const sparkScale = useSharedValue(0)
  const overlayOpacity = useSharedValue(0)

  useEffect(() => {
    trigger('success')

    overlayOpacity.value = withTiming(1, { duration: 400 })

    checkScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 100 }),
    )
    checkOpacity.value = withDelay(300, withTiming(1, { duration: 300 }))

    ringScale.value = withDelay(
      300,
      withTiming(3, { duration: 700, easing: Easing.out(Easing.cubic) }),
    )
    ringOpacity.value = withDelay(300, withTiming(0, { duration: 700 }))

    contentOpacity.value = withDelay(600, withTiming(1, { duration: 400 }))
    contentY.value = withDelay(
      600,
      withSpring(0, { damping: 18, stiffness: 100 }),
    )

    sparkScale.value = withDelay(
      900,
      withSpring(1, { damping: 14, stiffness: 100 }),
    )

    setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 400 }, () => {
        runOnJS(onComplete)()
      })
    }, 2500)
  }, [])

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }))

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }))

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }))

  const sparkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkScale.value }],
    opacity: sparkScale.value,
  }))

  const celebrationMessage = getRandomCelebration('powerMoveComplete')

  return (
    <Animated.View style={[styles.container, overlayStyle]}>
      <Confetti count={40} />

      <View style={styles.content}>
        <View style={styles.checkContainer}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <Animated.View style={[styles.checkCircle, checkStyle]}>
            <LinearGradient
              colors={GRADIENTS.electric}
              style={styles.checkGradient}
            >
              <Ionicons
                name='checkmark'
                size={48}
                color={PALETTE.midnight.obsidian}
              />
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.View style={[styles.textContent, contentStyle]}>
          <Text style={styles.celebrationText}>{celebrationMessage}</Text>
          <Text style={styles.moveTitle} numberOfLines={2}>
            {title}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.sparkContainer, sparkStyle]}>
          <View style={styles.sparkBadge}>
            <Ionicons
              name='sparkles'
              size={18}
              color={PALETTE.electric.emerald}
            />
            <Text style={styles.sparkText}>+{sparksEarned}</Text>
            <Text style={styles.sparkLabel}>sparks earned</Text>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: PALETTE.electric.cyan,
  },
  checkCircle: {
    ...SHADOWS.lg,
  },
  checkGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  celebrationText: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  moveTitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: 280,
  },
  sparkContainer: {
    marginTop: SPACING.md,
  },
  sparkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 25,
    ...SHADOWS.md,
  },
  sparkText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: PALETTE.electric.emeraldDark,
  },
  sparkLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: PALETTE.slate[500],
  },
})
