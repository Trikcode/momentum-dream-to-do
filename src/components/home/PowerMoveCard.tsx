// src/components/home/PowerMoveCard.tsx
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
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3

export function PowerMoveCard({
  title,
  dreamTitle,
  category,
  sparkReward,
  onComplete,
  onSkip,
  id,
}: any) {
  const translateX = useSharedValue(0)
  const itemHeight = useSharedValue(110) // Approx height
  const opacity = useSharedValue(1)

  const pan = Gesture.Pan()
    .onChange((event) => {
      translateX.value = event.translationX
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          Math.sign(event.translationX) * SCREEN_WIDTH,
        )
        itemHeight.value = withTiming(0)
        opacity.value = withTiming(0, {}, () => {
          if (event.translationX > 0) runOnJS(onComplete)(id)
          else runOnJS(onSkip)(id)
        })
      } else {
        translateX.value = withSpring(0)
      }
    })

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const containerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    opacity: opacity.value,
    marginBottom: itemHeight.value === 0 ? 0 : SPACING.md,
  }))

  return (
    <Animated.View style={[styles.containerWrapper, containerStyle]}>
      {/* Background Actions */}
      <View style={styles.actionBg}>
        <LinearGradient
          colors={['#EF4444', '#7f1d1d']}
          style={[styles.actionSide, { justifyContent: 'flex-start' }]}
        >
          <Ionicons
            name='time'
            size={24}
            color='white'
            style={{ marginLeft: 20 }}
          />
        </LinearGradient>
        <LinearGradient
          colors={['#10B981', '#065F46']}
          style={[styles.actionSide, { justifyContent: 'flex-end' }]}
        >
          <Ionicons
            name='checkmark-circle'
            size={24}
            color='white'
            style={{ marginRight: 20 }}
          />
        </LinearGradient>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, rStyle]}>
          {/* Left Color Bar */}
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
                  {category?.name}
                </Text>
              </View>
              <View style={styles.xpBadge}>
                <Ionicons name='sparkles' size={10} color={DARK.accent.gold} />
                <Text style={styles.xpText}>+{sparkReward} XP</Text>
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
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  containerWrapper: { overflow: 'hidden' },
  actionBg: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  actionSide: { flex: 1, justifyContent: 'center' },

  card: {
    height: 110,
    backgroundColor: '#1E232E',
    borderRadius: RADIUS.xl,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  colorBar: { width: 4, height: '100%' },
  content: { flex: 1, padding: SPACING.md, justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  catBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  catText: { fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase' },

  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpText: { color: DARK.accent.gold, fontSize: 11, fontFamily: FONTS.bold },

  title: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: DARK.text.primary,
    marginBottom: 8,
  },

  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dreamTitle: {
    fontSize: 12,
    color: DARK.text.tertiary,
    fontFamily: FONTS.medium,
  },
})
