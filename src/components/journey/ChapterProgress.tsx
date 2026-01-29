// src/components/journey/ChapterProgress.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

interface ChapterProgressProps {
  currentChapter: number
  currentXP: number
  xpForNextChapter: number
}

export function ChapterProgress({
  currentChapter,
  currentXP,
  xpForNextChapter,
}: ChapterProgressProps) {
  const progressWidth = useSharedValue(0)
  const shimmer = useSharedValue(0)
  const badgeScale = useSharedValue(0)

  const progress = Math.min(currentXP / xpForNextChapter, 1)
  const remaining = xpForNextChapter - currentXP

  useEffect(() => {
    progressWidth.value = withDelay(
      300,
      withSpring(progress * 100, { damping: 15, stiffness: 80 }),
    )

    badgeScale.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 100 }),
    )

    // Shimmer on progress bar
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false,
    )
  }, [progress])

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }))

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -100 + shimmer.value * 400 }],
  }))

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }))

  return (
    <View style={styles.container}>
      {/* Chapter badge */}
      <Animated.View style={[styles.chapterBadge, badgeStyle]}>
        <LinearGradient
          colors={[COLORS.secondary[500], COLORS.secondary[600]]}
          style={styles.badgeGradient}
        >
          <Ionicons name='book' size={20} color='#FFF' />
          <Text style={styles.chapterNumber}>{currentChapter}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Progress section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.label}>{LANGUAGE.chapter.current}</Text>
          <Text style={styles.xpText}>
            <Text style={styles.xpCurrent}>{currentXP.toLocaleString()}</Text>
            <Text style={styles.xpTotal}>
              {' '}
              / {xpForNextChapter.toLocaleString()} sparks
            </Text>
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]}>
            <LinearGradient
              colors={[COLORS.secondary[400], COLORS.secondary[500]]}
              style={styles.progressGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {/* Shimmer effect */}
              <Animated.View style={[styles.shimmer, shimmerStyle]}>
                <LinearGradient
                  colors={[
                    'transparent',
                    'rgba(255,255,255,0.4)',
                    'transparent',
                  ]}
                  style={styles.shimmerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Remaining */}
        <Text style={styles.remainingText}>
          {remaining.toLocaleString()} sparks to Chapter {currentChapter + 1}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  chapterBadge: {
    ...SHADOWS.md,
  },
  badgeGradient: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumber: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#FFF',
    marginTop: 2,
  },
  progressSection: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.neutral[900],
  },
  xpText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  xpCurrent: {
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary[600],
  },
  xpTotal: {
    color: COLORS.neutral[400],
  },
  progressTrack: {
    height: 10,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
    borderRadius: 5,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
  },
  shimmerGradient: {
    flex: 1,
    width: 100,
  },
  remainingText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: SPACING.xs,
  },
})
