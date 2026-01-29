// src/components/celebrations/VictoryModal.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated'
import { Confetti } from './Confetti'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'
import { useHaptics } from '@/src/hooks/useHaptics'

const { width, height } = Dimensions.get('window')

interface Victory {
  id: string
  slug: string
  name: string
  description: string
  iconName: string
  category: string
  sparkReward: number
}

interface VictoryModalProps {
  victory: Victory
  onDismiss: () => void
  showConfetti?: boolean
}

export function VictoryModal({
  victory,
  onDismiss,
  showConfetti = true,
}: VictoryModalProps) {
  const { trigger } = useHaptics()
  const badgeScale = useSharedValue(0)
  const badgeRotate = useSharedValue(-30)
  const shimmer = useSharedValue(0)
  const sparkScale = useSharedValue(0)

  useEffect(() => {
    trigger('celebration')

    // Badge entrance animation
    badgeScale.value = withDelay(
      300,
      withSpring(1, { damping: 8, stiffness: 100 }),
    )

    badgeRotate.value = withDelay(
      300,
      withSequence(
        withSpring(10, { damping: 4 }),
        withSpring(0, { damping: 8 }),
      ),
    )

    // Shimmer effect
    shimmer.value = withDelay(
      800,
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
    )

    // Spark reward animation
    sparkScale.value = withDelay(1200, withSpring(1, { damping: 10 }))
  }, [])

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotate.value}deg` },
    ],
  }))

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value * 0.5,
    transform: [{ translateX: -150 + shimmer.value * 300 }],
  }))

  const sparkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkScale.value }],
    opacity: sparkScale.value,
  }))

  const getCategoryColors = (): [string, string] => {
    switch (victory.category) {
      case 'streak':
        return ['#FF6B6B', '#FF8E53']
      case 'dreams':
        return COLORS.gradients.dream as [string, string]
      case 'actions':
        return COLORS.gradients.success as [string, string]
      case 'special':
        return COLORS.gradients.accent as [string, string]
      default:
        return COLORS.gradients.primary as [string, string]
    }
  }

  return (
    <View style={styles.container}>
      {/* Background blur */}
      <BlurView intensity={30} style={StyleSheet.absoluteFill} tint='dark' />

      {/* Confetti */}
      {showConfetti && <Confetti count={80} />}

      {/* Backdrop tap to dismiss */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      {/* Modal content */}
      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        style={styles.modal}
      >
        {/* Victory text */}
        <Animated.View entering={FadeIn.delay(200)}>
          <Text style={styles.victoryLabel}>{LANGUAGE.victories.unlocked}</Text>
        </Animated.View>

        {/* Badge */}
        <Animated.View style={[styles.badgeContainer, badgeStyle]}>
          <LinearGradient
            colors={getCategoryColors()}
            style={styles.badge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Shimmer effect */}
            <Animated.View style={[styles.shimmer, shimmerStyle]} />

            <Ionicons name={victory.iconName as any} size={64} color='#FFF' />
          </LinearGradient>

          {/* Glow rings */}
          <View style={[styles.glowRing, styles.glowRing1]} />
          <View style={[styles.glowRing, styles.glowRing2]} />
        </Animated.View>

        {/* Victory name */}
        <Animated.View entering={FadeIn.delay(600)}>
          <Text style={styles.victoryName}>{victory.name}</Text>
          <Text style={styles.victoryDescription}>{victory.description}</Text>
        </Animated.View>

        {/* Spark reward */}
        <Animated.View style={[styles.sparkReward, sparkStyle]}>
          <View style={styles.sparkIcon}>
            <Ionicons name='sparkles' size={20} color={COLORS.accent[500]} />
          </View>
          <Text style={styles.sparkAmount}>+{victory.sparkReward}</Text>
          <Text style={styles.sparkLabel}>{LANGUAGE.spark.plural}</Text>
        </Animated.View>

        {/* Dismiss button */}
        <Animated.View entering={FadeIn.delay(1500)}>
          <Pressable onPress={onDismiss} style={styles.dismissButton}>
            <LinearGradient
              colors={getCategoryColors()}
              style={styles.dismissGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.dismissText}>Amazing!</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl * 1.5,
    padding: SPACING.xl,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 340,
    ...SHADOWS.xl,
  },
  victoryLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.accent[500],
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: SPACING.lg,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  badge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  shimmer: {
    position: 'absolute',
    width: 60,
    height: '200%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ rotate: '25deg' }],
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
  },
  glowRing1: {
    width: 160,
    height: 160,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  glowRing2: {
    width: 180,
    height: 180,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  victoryName: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  victoryDescription: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sparkReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent[50],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xl,
  },
  sparkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkAmount: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.accent[600],
  },
  sparkLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  dismissButton: {
    ...SHADOWS.md,
  },
  dismissGradient: {
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  dismissText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFF',
  },
})
