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
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3

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
  const itemHeight = useSharedValue(100) // Slightly taller for better spacing
  const opacity = useSharedValue(1)
  const hintOpacity = useSharedValue(showHint ? 1 : 0)
  const hasTriggered = useSharedValue(false)

  // Handlers
  const handleComplete = () => {
    Promise.resolve(onComplete(id)).catch(console.error)
  }
  const handleSkip = () => {
    Promise.resolve(onSkip(id)).catch(console.error)
  }
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
  }

  // Hint Animation
  useEffect(() => {
    if (!showHint) return
    const timeout = setTimeout(() => {
      translateX.value = withSequence(
        withTiming(40, {
          duration: 400,
          easing: require('react-native-reanimated').Easing.out(
            require('react-native-reanimated').Easing.ease,
          ),
        }),
        withTiming(0, {
          duration: 400,
          easing: require('react-native-reanimated').Easing.out(
            require('react-native-reanimated').Easing.ease,
          ),
        }),
      )
    }, 1500)

    const fadeOut = setTimeout(() => {
      hintOpacity.value = withTiming(0, { duration: 500 })
    }, 5000)

    return () => {
      clearTimeout(timeout)
      clearTimeout(fadeOut)
    }
  }, [showHint])

  // Gesture
  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onChange((event) => {
      if (hasTriggered.value) return
      translateX.value = event.translationX
      if (Math.abs(event.translationX) > 10) {
        hintOpacity.value = withTiming(0)
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
      runOnJS(triggerHaptic)()

      const direction = event.translationX > 0 ? 1 : -1
      translateX.value = withTiming(direction * SCREEN_WIDTH, { duration: 300 })
      opacity.value = withTiming(0, { duration: 250 })
      itemHeight.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          if (direction > 0) runOnJS(handleComplete)()
          else runOnJS(handleSkip)()
        }
      })
    })

  // Styles
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))
  const containerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    opacity: opacity.value,
    marginBottom: opacity.value === 0 ? 0 : SPACING.md,
  }))

  // Reveal Actions Opacity
  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 60],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, 60],
          [0.8, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }))
  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-60, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-60, 0],
          [1, 0.8],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }))
  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOpacity.value }))

  return (
    <Animated.View style={[styles.containerWrapper, containerStyle]}>
      {/* Background Actions Layer */}
      <View style={styles.actionBg}>
        <View style={[styles.actionSide, styles.completeAction]}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Animated.View style={[styles.actionContent, leftActionStyle]}>
            <Ionicons name='checkmark-circle' size={28} color='#10B981' />
            <Text style={[styles.actionLabel, { color: '#10B981' }]}>
              Complete
            </Text>
          </Animated.View>
        </View>

        <View style={[styles.actionSide, styles.skipAction]}>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.2)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Animated.View style={[styles.actionContent, rightActionStyle]}>
            <Text style={[styles.actionLabel, { color: '#F59E0B' }]}>
              Later
            </Text>
            <Ionicons name='time' size={28} color='#F59E0B' />
          </Animated.View>
        </View>
      </View>

      {/* Foreground Card */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Color Indicator */}
          <View
            style={[
              styles.colorBar,
              { backgroundColor: category?.color || DARK.accent.rose },
            ]}
          />

          <View style={styles.content}>
            {/* Header Row */}
            <View style={styles.header}>
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.catBadge,
                    {
                      backgroundColor: (category?.color || '#FFF') + '15',
                      borderColor: (category?.color || '#FFF') + '25',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catText,
                      { color: category?.color || '#FFF' },
                    ]}
                  >
                    {category?.name || 'Power Move'}
                  </Text>
                </View>
                <Text style={styles.dreamTitle} numberOfLines={1}>
                  {' '}
                  • {dreamTitle}
                </Text>
              </View>

              <View style={styles.xpBadge}>
                <Ionicons name='sparkles' size={10} color={DARK.accent.gold} />
                <Text style={styles.xpText}>+{sparkReward} XP</Text>
              </View>
            </View>

            {/* Main Title */}
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          </View>

          {/* Hint Overlay */}
          {showHint && (
            <Animated.View
              style={[styles.hintContainer, hintStyle]}
              pointerEvents='none'
            >
              <View style={styles.hintBubble}>
                <Text style={styles.hintText}>Swipe to complete</Text>
                <Ionicons
                  name='arrow-forward'
                  size={12}
                  color='rgba(255,255,255,0.7)'
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
    width: '100%',
  },
  actionBg: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionSide: {
    flex: 1,
    justifyContent: 'center',
  },
  completeAction: {
    alignItems: 'flex-start',
    paddingLeft: SPACING.xl,
  },
  skipAction: {
    alignItems: 'flex-end',
    paddingRight: SPACING.xl,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },

  // Card
  card: {
    height: '100%',
    backgroundColor: DARK.bg.card, // Using the theme variable
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  colorBar: {
    width: 6,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  catText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  dreamTitle: {
    fontSize: 12,
    color: DARK.text.tertiary,
    fontFamily: FONTS.medium,
    flexShrink: 1,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  xpText: {
    color: DARK.accent.gold,
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: DARK.text.primary,
    lineHeight: 24,
  },

  // Hint
  hintContainer: {
    position: 'absolute',
    right: SPACING.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  hintBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hintText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
})
