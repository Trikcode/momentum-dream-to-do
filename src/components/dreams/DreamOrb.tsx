// src/components/dreams/DreamOrb.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
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
import { DreamCategory } from '@/src/constants/dreamCategories'

interface DreamOrbProps {
  id: string
  title: string
  category: DreamCategory
  progress: number // 0-100
  completedActions: number
  totalActions: number
  isActive?: boolean
  onPress: () => void
  index: number
}

const { width } = Dimensions.get('window')
const ORB_SIZE = (width - SPACING.lg * 2 - SPACING.md) / 2

export function DreamOrb({
  id,
  title,
  category,
  progress,
  completedActions,
  totalActions,
  isActive = true,
  onPress,
  index,
}: DreamOrbProps) {
  const scale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.3)
  const floatY = useSharedValue(0)
  const progressWidth = useSharedValue(0)

  useEffect(() => {
    // Floating animation
    floatY.value = withDelay(
      index * 200,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 }),
      ),
      -1,
      true,
    )

    // Progress animation
    progressWidth.value = withDelay(
      300 + index * 100,
      withSpring(progress, { damping: 15, stiffness: 80 }),
    )
  }, [progress])

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    scale.value = withSequence(
      withSpring(0.95, SPRING_CONFIGS.snappy),
      withSpring(1, SPRING_CONFIGS.snappy),
    )
    onPress()
  }

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { scale: scale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }))

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Outer glow */}
        <Animated.View
          style={[styles.glow, glowStyle, { backgroundColor: category.color }]}
        />

        {/* Main orb */}
        <LinearGradient
          colors={[category.gradient[0] + '20', category.gradient[1] + '40']}
          style={styles.orb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glass overlay */}
          <View style={styles.glassOverlay}>
            {/* Category icon */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: category.color },
              ]}
            >
              <Ionicons
                name={category.icon.name as any}
                size={24}
                color='#FFF'
              />
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>

            {/* Progress section */}
            <View style={styles.progressSection}>
              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { backgroundColor: category.color },
                    progressStyle,
                  ]}
                />
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <Text style={styles.statsText}>
                  {completedActions}/{totalActions} moves
                </Text>
                <Text
                  style={[styles.progressPercent, { color: category.color }]}
                >
                  {progress}%
                </Text>
              </View>
            </View>
          </View>

          {/* Decorative particles */}
          <View
            style={[
              styles.particle,
              styles.particle1,
              { backgroundColor: category.color },
            ]}
          />
          <View
            style={[
              styles.particle,
              styles.particle2,
              { backgroundColor: category.color },
            ]}
          />
          <View
            style={[
              styles.particle,
              styles.particle3,
              { backgroundColor: category.color + '60' },
            ]}
          />
        </LinearGradient>

        {/* Active indicator */}
        {isActive && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: category.color },
            ]}
          >
            <Ionicons name='flash' size={10} color='#FFF' />
          </View>
        )}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE,
    height: ORB_SIZE * 1.2,
    marginBottom: SPACING.md,
  },
  glow: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    borderRadius: RADIUS.xl,
    opacity: 0.3,
  },
  orb: {
    flex: 1,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  glassOverlay: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
    flex: 1,
  },
  progressSection: {
    gap: SPACING.xs,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  progressPercent: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  particle1: {
    width: 8,
    height: 8,
    top: 10,
    right: 15,
    opacity: 0.6,
  },
  particle2: {
    width: 6,
    height: 6,
    top: 30,
    right: 8,
    opacity: 0.4,
  },
  particle3: {
    width: 4,
    height: 4,
    bottom: 20,
    right: 20,
    opacity: 0.5,
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
    ...SHADOWS.sm,
  },
})
