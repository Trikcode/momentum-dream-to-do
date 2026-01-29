// src/components/celebrations/LevelUpModal.tsx
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
  withRepeat,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated'
import { Confetti } from './Confetti'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'
import { useHaptics } from '@/src/hooks/useHaptics'

const { width, height } = Dimensions.get('window')

interface LevelUpData {
  previousChapter: number
  newChapter: number
  unlockedFeatures?: string[]
}

interface LevelUpModalProps {
  data: LevelUpData
  onDismiss: () => void
}

export function LevelUpModal({ data, onDismiss }: LevelUpModalProps) {
  const { trigger } = useHaptics()

  const numberScale = useSharedValue(0)
  const numberRotate = useSharedValue(0)
  const glowPulse = useSharedValue(0)
  const raysRotate = useSharedValue(0)
  const oldNumberOpacity = useSharedValue(1)
  const newNumberY = useSharedValue(50)
  const newNumberOpacity = useSharedValue(0)

  useEffect(() => {
    trigger('levelUp')

    // Number transition - old fades up, new comes in
    setTimeout(() => {
      oldNumberOpacity.value = withTiming(0, { duration: 400 })
      newNumberY.value = withSpring(0, { damping: 12, stiffness: 100 })
      newNumberOpacity.value = withTiming(1, { duration: 400 })
    }, 1000)

    // Scale entrance
    numberScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.2, { damping: 6 }),
        withSpring(1, { damping: 10 }),
      ),
    )

    // Celebration shake
    numberRotate.value = withDelay(
      1400,
      withSequence(
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 50 }),
      ),
    )

    // Glow pulse
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 }),
      ),
      -1,
      true,
    )

    // Rotating rays
    raysRotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    )
  }, [])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: numberScale.value },
      { rotate: `${numberRotate.value}deg` },
    ],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glowPulse.value * 0.3,
    transform: [{ scale: 1 + glowPulse.value * 0.1 }],
  }))

  const raysStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${raysRotate.value}deg` }],
  }))

  const oldNumberStyle = useAnimatedStyle(() => ({
    opacity: oldNumberOpacity.value,
    transform: [{ translateY: -30 * (1 - oldNumberOpacity.value) }],
  }))

  const newNumberStyle = useAnimatedStyle(() => ({
    opacity: newNumberOpacity.value,
    transform: [{ translateY: newNumberY.value }],
  }))

  return (
    <View style={styles.container}>
      <BlurView intensity={40} style={StyleSheet.absoluteFill} tint='dark' />

      <Confetti count={100} />

      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      <Animated.View
        entering={FadeInUp.springify().damping(15)}
        style={styles.modal}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.delay(200)}>
          <Text style={styles.headerLabel}>NEW CHAPTER UNLOCKED</Text>
        </Animated.View>

        {/* Chapter number with effects */}
        <Animated.View style={[styles.chapterContainer, containerStyle]}>
          {/* Rotating rays */}
          <Animated.View style={[styles.raysContainer, raysStyle]}>
            {Array.from({ length: 12 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.ray,
                  {
                    transform: [{ rotate: `${i * 30}deg` }],
                  },
                ]}
              />
            ))}
          </Animated.View>

          {/* Glow */}
          <Animated.View style={[styles.glow, glowStyle]} />

          {/* Circle background */}
          <LinearGradient
            colors={['#9333EA', '#7C3AED', '#6B21A8']}
            style={styles.chapterCircle}
          >
            {/* Old number (fading out) */}
            <Animated.Text style={[styles.chapterNumber, oldNumberStyle]}>
              {data.previousChapter}
            </Animated.Text>

            {/* New number (fading in) */}
            <Animated.Text
              style={[styles.chapterNumber, styles.newNumber, newNumberStyle]}
            >
              {data.newChapter}
            </Animated.Text>
          </LinearGradient>

          {/* Book icon overlay */}
          <View style={styles.bookIcon}>
            <Ionicons name='book' size={20} color={COLORS.secondary[200]} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeIn.delay(1600)}>
          <Text style={styles.title}>Chapter {data.newChapter}</Text>
          <Text style={styles.subtitle}>Your story continues...</Text>
        </Animated.View>

        {/* Unlocked features (if any) */}
        {data.unlockedFeatures && data.unlockedFeatures.length > 0 && (
          <Animated.View
            entering={FadeIn.delay(1800)}
            style={styles.featuresContainer}
          >
            <Text style={styles.featuresTitle}>Unlocked:</Text>
            {data.unlockedFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name='checkmark-circle'
                  size={18}
                  color={COLORS.success[500]}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Continue button */}
        <Animated.View entering={FadeIn.delay(2200)}>
          <Pressable onPress={onDismiss} style={styles.continueButton}>
            <LinearGradient
              colors={['#9333EA', '#7C3AED']}
              style={styles.continueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueText}>Continue Journey</Text>
              <Ionicons name='arrow-forward' size={20} color='#FFF' />
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
    width: width * 0.88,
    maxWidth: 360,
    ...SHADOWS.xl,
  },
  headerLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.secondary[500],
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: SPACING.xl,
  },
  chapterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  raysContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 2,
    height: 100,
    backgroundColor: COLORS.secondary[200],
    opacity: 0.3,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.secondary[400],
  },
  chapterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  chapterNumber: {
    fontFamily: FONTS.bold,
    fontSize: 64,
    color: '#FFF',
    position: 'absolute',
  },
  newNumber: {
    // Positioned absolutely, animated in
  },
  bookIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  featuresContainer: {
    backgroundColor: COLORS.success[50],
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  featuresTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.success[700],
    marginBottom: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  featureText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  continueButton: {
    ...SHADOWS.md,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  continueText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFF',
  },
})
