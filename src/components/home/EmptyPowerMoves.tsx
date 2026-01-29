// src/components/home/EmptyPowerMoves.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  SPRING_CONFIGS,
} from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

interface EmptyPowerMovesProps {
  variant?: 'no-moves' | 'all-done'
}

export function EmptyPowerMoves({
  variant = 'no-moves',
}: EmptyPowerMovesProps) {
  const floatY = useSharedValue(0)
  const rotate = useSharedValue(0)
  const sparkle1 = useSharedValue(0)
  const sparkle2 = useSharedValue(0)
  const sparkle3 = useSharedValue(0)
  const pulseScale = useSharedValue(1)

  useEffect(() => {
    // Float animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )

    // Subtle rotation
    rotate.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )

    // Sparkle animations (staggered)
    sparkle1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 }),
      ),
      -1,
      true,
    )

    sparkle2.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(0, { duration: 1200 }),
        ),
        -1,
        true,
      ),
    )

    sparkle3.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1400 }),
          withTiming(0, { duration: 1400 }),
        ),
        -1,
        true,
      ),
    )

    // Pulse for "all done" variant
    if (variant === 'all-done') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 }),
        ),
        -1,
        true,
      )
    }
  }, [variant])

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { rotate: `${rotate.value}deg` }],
  }))

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const sparkle1Style = useAnimatedStyle(() => ({
    opacity: sparkle1.value,
    transform: [{ scale: 0.5 + sparkle1.value * 0.5 }],
  }))

  const sparkle2Style = useAnimatedStyle(() => ({
    opacity: sparkle2.value,
    transform: [{ scale: 0.5 + sparkle2.value * 0.5 }],
  }))

  const sparkle3Style = useAnimatedStyle(() => ({
    opacity: sparkle3.value,
    transform: [{ scale: 0.5 + sparkle3.value * 0.5 }],
  }))

  const handleAddMove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(modals)/new-action')
  }

  if (variant === 'all-done') {
    return (
      <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
        <Animated.View style={[styles.iconWrapper, pulseStyle]}>
          {/* Glow effect */}
          <View
            style={[styles.glow, { backgroundColor: COLORS.success[400] }]}
          />

          <LinearGradient
            colors={COLORS.gradients.success as [string, string]}
            style={styles.iconCircle}
          >
            <Ionicons name='checkmark-done' size={48} color='#FFF' />
          </LinearGradient>

          {/* Sparkles */}
          <Animated.View
            style={[styles.sparkle, styles.sparkle1, sparkle1Style]}
          >
            <Ionicons name='sparkles' size={16} color={COLORS.accent[400]} />
          </Animated.View>
          <Animated.View
            style={[styles.sparkle, styles.sparkle2, sparkle2Style]}
          >
            <Ionicons name='star' size={12} color={COLORS.primary[400]} />
          </Animated.View>
          <Animated.View
            style={[styles.sparkle, styles.sparkle3, sparkle3Style]}
          >
            <Ionicons name='sparkles' size={14} color={COLORS.secondary[400]} />
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <Text style={styles.title}>You crushed it! 🔥</Text>
          <Text style={styles.subtitle}>
            All power moves complete for today.{'\n'}
            Your momentum is unstoppable!
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Pressable onPress={handleAddMove} style={styles.addMoreButton}>
            <Ionicons
              name='add-circle-outline'
              size={20}
              color={COLORS.primary[500]}
            />
            <Text style={styles.addMoreText}>Add more power moves</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    )
  }

  // Default: No moves scheduled
  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
      <Animated.View style={[styles.iconWrapper, floatStyle]}>
        {/* Glow effect */}
        <View
          style={[styles.glow, { backgroundColor: COLORS.secondary[400] }]}
        />

        <LinearGradient
          colors={COLORS.gradients.dream as [string, string]}
          style={styles.iconCircle}
        >
          <Ionicons name='flash' size={48} color='#FFF' />
        </LinearGradient>

        {/* Sparkles */}
        <Animated.View style={[styles.sparkle, styles.sparkle1, sparkle1Style]}>
          <Ionicons name='sparkles' size={16} color={COLORS.accent[400]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle2, sparkle2Style]}>
          <Ionicons name='star' size={12} color={COLORS.primary[400]} />
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle3, sparkle3Style]}>
          <Ionicons name='sparkles' size={14} color={COLORS.secondary[400]} />
        </Animated.View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(500)}>
        <Text style={styles.title}>Ready for action?</Text>
        <Text style={styles.subtitle}>
          Add your first {LANGUAGE.powerMoves.singular.toLowerCase()} for today
          {'\n'}
          and start building momentum!
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(500)}>
        <Pressable onPress={handleAddMove}>
          <LinearGradient
            colors={COLORS.gradients.primary as [string, string]}
            style={styles.addButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name='add' size={22} color='#FFF' />
            <Text style={styles.addButtonText}>
              Add {LANGUAGE.powerMoves.singular}
            </Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  glow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 50,
    opacity: 0.3,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -5,
    right: -10,
  },
  sparkle2: {
    bottom: 10,
    left: -15,
  },
  sparkle3: {
    top: 20,
    right: -20,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
  },
  addButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFF',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  addMoreText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
  },
})
