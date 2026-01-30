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
  withDelay,
  Easing,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

interface EmptyPowerMovesProps {
  variant?: 'no-moves' | 'all-done'
}

export function EmptyPowerMoves({
  variant = 'no-moves',
}: EmptyPowerMovesProps) {
  const floatY = useSharedValue(0)
  const rotate = useSharedValue(0)
  const pulseScale = useSharedValue(1)

  useEffect(() => {
    // Float animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
        withTiming(8, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    )

    // Subtle rotation
    rotate.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )

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

  const handleAddMove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(modals)/new-action')
  }

  // ============================================================================
  // VARIANT: ALL DONE (Success State)
  // ============================================================================
  if (variant === 'all-done') {
    return (
      <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
        <Animated.View style={[styles.iconWrapper, pulseStyle]}>
          {/* Neon Glow */}
          <View style={[styles.glow, { backgroundColor: DARK.accent.gold }]} />

          <LinearGradient
            colors={[DARK.accent.gold, '#B45309']}
            style={styles.iconCircle}
          >
            <Ionicons name='trophy' size={48} color='#FFF' />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <Text style={styles.title}>You crushed it! 🔥</Text>
          <Text style={styles.subtitle}>
            All power moves complete.{'\n'}
            Your momentum is unstoppable!
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Pressable onPress={handleAddMove} style={styles.secondaryButton}>
            <Ionicons name='add' size={18} color={DARK.accent.rose} />
            <Text style={styles.secondaryButtonText}>Add bonus move</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    )
  }

  // ============================================================================
  // VARIANT: NO MOVES (Empty State)
  // ============================================================================
  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
      <Animated.View style={[styles.iconWrapper, floatStyle]}>
        {/* Neon Glow */}
        <View style={[styles.glow, { backgroundColor: DARK.accent.rose }]} />

        <LinearGradient
          colors={DARK.gradients.primary as [string, string]}
          style={styles.iconCircle}
        >
          <Ionicons name='flash' size={48} color='#FFF' />
        </LinearGradient>
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
          {({ pressed }) => (
            <Animated.View
              style={[
                styles.primaryButton,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={DARK.gradients.primary as [string, string]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Ionicons name='add' size={22} color='#FFF' />
              <Text style={styles.primaryButtonText}>
                Add {LANGUAGE.powerMoves.singular}
              </Text>
            </Animated.View>
          )}
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  glow: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    borderRadius: 50,
    opacity: 0.5,
    filter: 'blur(30px)', // Web support
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: DARK.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: DARK.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  // Primary Gradient Button
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    ...DARK.glow.rose,
  },
  primaryButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFF',
  },

  // Secondary Button (Outline/Ghost)
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  secondaryButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.secondary,
  },
})
