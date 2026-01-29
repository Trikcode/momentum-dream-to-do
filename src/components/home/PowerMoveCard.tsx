import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
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

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3

interface PowerMoveCardProps {
  id: string
  title: string
  dreamTitle: string
  category: DreamCategory
  sparkReward: number
  difficulty: 'easy' | 'medium' | 'hard'
  onComplete: (id: string) => void
  onSkip: (id: string) => void
}

export function PowerMoveCard({
  id,
  title,
  dreamTitle,
  category,
  sparkReward,
  difficulty,
  onComplete,
  onSkip,
}: PowerMoveCardProps) {
  const translateX = useSharedValue(0)
  const cardHeight = useSharedValue(100)
  const cardOpacity = useSharedValue(1)
  const cardScale = useSharedValue(1)

  const difficultyConfig = {
    easy: {
      label: 'Quick win',
      color: COLORS.success[500],
      sparks: sparkReward,
    },
    medium: {
      label: 'Power up',
      color: COLORS.accent[500],
      sparks: sparkReward,
    },
    hard: {
      label: 'Level up',
      color: COLORS.primary[500],
      sparks: sparkReward,
    },
  }

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onComplete(id)
  }

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSkip(id)
  }

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  const panGesture = Gesture.Pan()
    .onStart(() => {
      cardScale.value = withSpring(0.98, SPRING_CONFIGS.snappy)
    })
    .onUpdate((event) => {
      translateX.value = event.translationX

      if (
        Math.abs(event.translationX) > SWIPE_THRESHOLD - 10 &&
        Math.abs(event.translationX) < SWIPE_THRESHOLD + 10
      ) {
        runOnJS(triggerHaptic)()
      }
    })
    .onEnd((event) => {
      cardScale.value = withSpring(1, SPRING_CONFIGS.snappy)

      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right = Complete
        translateX.value = withSpring(SCREEN_WIDTH, SPRING_CONFIGS.snappy)
        cardOpacity.value = withTiming(0, { duration: 200 })
        cardHeight.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(handleComplete)()
        })
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left = Skip
        translateX.value = withSpring(-SCREEN_WIDTH, SPRING_CONFIGS.snappy)
        cardOpacity.value = withTiming(0, { duration: 200 })
        cardHeight.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(handleSkip)()
        })
      } else {
        // Reset
        translateX.value = withSpring(0, SPRING_CONFIGS.snappy)
      }
    })

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: cardScale.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-15, 0, 15],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
    opacity: cardOpacity.value,
  }))

  const containerStyle = useAnimatedStyle(() => ({
    height: cardHeight.value,
    marginBottom: interpolate(cardHeight.value, [0, 100], [0, SPACING.md]),
    overflow: 'hidden',
  }))

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SWIPE_THRESHOLD],
          [0.5, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }))

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-SWIPE_THRESHOLD, 0],
          [1, 0.5],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }))

  return (
    <Animated.View style={containerStyle}>
      {/* Background actions */}
      <View style={styles.actionsContainer}>
        {/* Complete action (right swipe) */}
        <Animated.View style={[styles.actionLeft, leftActionStyle]}>
          <LinearGradient
            colors={COLORS.gradients.success as [string, string]}
            style={styles.actionGradient}
          >
            <Ionicons name='checkmark-circle' size={32} color='#FFF' />
            <Text style={styles.actionText}>Crushed it!</Text>
          </LinearGradient>
        </Animated.View>

        {/* Skip action (left swipe) */}
        <Animated.View style={[styles.actionRight, rightActionStyle]}>
          <View style={styles.skipAction}>
            <Ionicons
              name='time-outline'
              size={32}
              color={COLORS.neutral[400]}
            />
            <Text style={styles.skipText}>Not now</Text>
          </View>
        </Animated.View>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <View
            style={[styles.categoryAccent, { backgroundColor: category.color }]}
          />

          <View style={styles.cardContent}>
            {/* Top row */}
            <View style={styles.topRow}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color + '15' },
                ]}
              >
                <Ionicons
                  name={category.icon.name as any}
                  size={18}
                  color={category.color}
                />
              </View>

              <View style={styles.sparkBadge}>
                <Ionicons
                  name='sparkles'
                  size={12}
                  color={COLORS.accent[500]}
                />
                <Text style={styles.sparkText}>+{sparkReward}</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>

            {/* Bottom row */}
            <View style={styles.bottomRow}>
              <Text style={styles.dreamName} numberOfLines={1}>
                {dreamTitle}
              </Text>

              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor: difficultyConfig[difficulty].color + '15',
                  },
                ]}
              >
                <View
                  style={[
                    styles.difficultyDot,
                    { backgroundColor: difficultyConfig[difficulty].color },
                  ]}
                />
                <Text
                  style={[
                    styles.difficultyText,
                    { color: difficultyConfig[difficulty].color },
                  ]}
                >
                  {difficultyConfig[difficulty].label}
                </Text>
              </View>
            </View>
          </View>

          {/* Swipe hint */}
          <View style={styles.swipeHint}>
            <Ionicons
              name='chevron-back'
              size={16}
              color={COLORS.neutral[300]}
            />
            <View style={styles.swipeBar} />
            <Ionicons
              name='chevron-forward'
              size={16}
              color={COLORS.neutral[300]}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  actionsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  actionLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  actionRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  actionText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFF',
  },
  skipAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.neutral[400],
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  categoryAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
  },
  cardContent: {
    padding: SPACING.md,
    paddingLeft: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accent[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sparkText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.accent[600],
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
    lineHeight: 24,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dreamName: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.neutral[400],
    flex: 1,
    marginRight: SPACING.sm,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  swipeBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 2,
  },
})
