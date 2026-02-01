// src/components/home/PowerMoveCard.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25

interface PowerMoveCardProps {
  id: string
  title: string
  dreamTitle: string
  category: any
  sparkReward: number
  difficulty?: string | null
  onComplete: (id: string) => Promise<void> | void
  onSkip: (id: string) => Promise<void> | void
  showHint?: boolean
}

export function PowerMoveCard({
  id,
  title,
  dreamTitle,
  category,
  sparkReward,
  onComplete,
  onSkip,
  showHint = false,
}: PowerMoveCardProps) {
  const translateX = useSharedValue(0)
  const itemHeight = useSharedValue(90)
  const opacity = useSharedValue(1)
  const hintOpacity = useSharedValue(showHint ? 1 : 0)

  // prevents double-fire if gesture ends twice / rerenders
  const hasTriggered = useSharedValue(false)

  const handleComplete = () => {
    Promise.resolve(onComplete(id)).catch((e) => {
      console.error('Complete action failed:', e)
    })
  }

  const handleSkip = () => {
    Promise.resolve(onSkip(id)).catch((e) => {
      console.error('Skip action failed:', e)
    })
  }

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
  }

  useEffect(() => {
    if (!showHint) return

    const timeout = setTimeout(() => {
      translateX.value = withSequence(
        withTiming(30, { duration: 300 }),
        withTiming(-30, { duration: 400 }),
        withTiming(0, { duration: 300 }),
      )
    }, 1000)

    const hideHint = setTimeout(() => {
      hintOpacity.value = withTiming(0, { duration: 500 })
    }, 4000)

    return () => {
      clearTimeout(timeout)
      clearTimeout(hideHint)
    }
  }, [showHint])

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onChange((event) => {
      if (hasTriggered.value) return

      translateX.value = event.translationX
      if (Math.abs(event.translationX) > 10) {
        hintOpacity.value = withTiming(0, { duration: 200 })
      }
    })
    .onEnd((event) => {
      if (hasTriggered.value) return

      const shouldTrigger = Math.abs(event.translationX) > SWIPE_THRESHOLD

      if (!shouldTrigger) {
        translateX.value = withSpring(0)
        return
      }

      hasTriggered.value = true

      // IMPORTANT: haptics must run on JS thread
      runOnJS(triggerHaptic)()

      const direction = event.translationX > 0 ? 1 : -1

      translateX.value = withTiming(direction * SCREEN_WIDTH, { duration: 250 })
      opacity.value = withTiming(0, { duration: 200 })

      itemHeight.value = withTiming(0, { duration: 300 }, (finished) => {
        if (!finished) return
        if (direction > 0) runOnJS(handleComplete)()
        else runOnJS(handleSkip)()
      })
    })

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const containerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    opacity: opacity.value,
    marginBottom: opacity.value === 0 ? 0 : SPACING.sm,
  }))

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.3, 1],
      Extrapolation.CLAMP,
    ),
  }))

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0.3],
      Extrapolation.CLAMP,
    ),
  }))

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }))

  return (
    <Animated.View style={[styles.containerWrapper, containerStyle]}>
      <View style={styles.actionBg}>
        <Animated.View
          style={[styles.actionSide, styles.completeAction, leftActionStyle]}
        >
          <Ionicons name='checkmark-circle' size={24} color='#FFF' />
          <Text style={styles.actionLabel}>Done</Text>
        </Animated.View>

        <Animated.View
          style={[styles.actionSide, styles.skipAction, rightActionStyle]}
        >
          <Text style={styles.actionLabel}>Tomorrow</Text>
          <Ionicons name='time' size={24} color='#FFF' />
        </Animated.View>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, cardStyle]}>
          <View
            style={[
              styles.colorBar,
              { backgroundColor: category?.color || DARK.accent.rose },
            ]}
          />

          <View style={styles.content}>
            <View style={styles.header}>
              <View
                style={[
                  styles.catBadge,
                  { backgroundColor: (category?.color || '#FFF') + '15' },
                ]}
              >
                <Text
                  style={[styles.catText, { color: category?.color || '#FFF' }]}
                >
                  {category?.name || 'Task'}
                </Text>
              </View>

              <View style={styles.xpBadge}>
                <Ionicons name='sparkles' size={10} color={DARK.accent.gold} />
                <Text style={styles.xpText}>+{sparkReward}</Text>
              </View>
            </View>

            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>

            <View style={styles.footer}>
              <Ionicons
                name='planet-outline'
                size={12}
                color={DARK.text.tertiary}
              />
              <Text style={styles.dreamTitle} numberOfLines={1}>
                {dreamTitle}
              </Text>
            </View>
          </View>

          {showHint && (
            <Animated.View style={[styles.hintContainer, hintStyle]}>
              <View style={styles.hintContent}>
                <Ionicons name='arrow-back' size={14} color={DARK.text.muted} />
                <Text style={styles.hintText}>Swipe</Text>
                <Ionicons
                  name='arrow-forward'
                  size={14}
                  color={DARK.text.muted}
                />
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  containerWrapper: {
    overflow: 'hidden',
  },
  actionBg: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  actionSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  completeAction: {
    backgroundColor: '#10B981',
    justifyContent: 'flex-start',
  },
  skipAction: {
    backgroundColor: '#F59E0B',
    justifyContent: 'flex-end',
  },
  actionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: '#FFF',
  },

  card: {
    height: 90,
    backgroundColor: '#1E232E', // Hardcoded fallback
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  colorBar: {
    width: 4,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  xpText: {
    color: DARK.accent.gold,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  title: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: DARK.text.primary,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dreamTitle: {
    fontSize: 12,
    color: DARK.text.tertiary,
    fontFamily: FONTS.medium,
  },
  hintContainer: {
    position: 'absolute',
    right: SPACING.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  hintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  hintText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: DARK.text.muted,
  },
})
