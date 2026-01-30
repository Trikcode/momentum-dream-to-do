// src/components/journey/ChapterProgress.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

export function ChapterProgress({
  currentChapter,
  currentXP,
  xpForNextChapter,
}: any) {
  const progressWidth = useSharedValue(0)
  const shimmer = useSharedValue(0)

  const progress = Math.min(currentXP / xpForNextChapter, 1)
  const remaining = xpForNextChapter - currentXP

  useEffect(() => {
    progressWidth.value = withDelay(300, withSpring(progress * 100))
    shimmer.value = withRepeat(withTiming(1, { duration: 2000 }), -1, false)
  }, [progress])

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }))
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -100 + shimmer.value * 400 }],
  }))

  return (
    <View style={styles.container}>
      <View style={styles.badgeWrapper}>
        <LinearGradient
          colors={[DARK.accent.violet, '#7C3AED']}
          style={styles.badge}
        >
          <Ionicons name='book' size={18} color='#FFF' />
          <Text style={styles.chapterNum}>{currentChapter}</Text>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.label}>Current Chapter</Text>
          <Text style={styles.xpText}>
            <Text style={{ color: DARK.text.primary, fontFamily: FONTS.bold }}>
              {currentXP}
            </Text>
            <Text style={{ color: DARK.text.muted }}>
              {' '}
              / {xpForNextChapter}
            </Text>
          </Text>
        </View>

        <View style={styles.track}>
          <Animated.View style={[styles.fill, progressStyle]}>
            <LinearGradient
              colors={[DARK.accent.rose, DARK.accent.gold]}
              style={styles.fillGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Animated.View style={[styles.shimmer, shimmerStyle]}>
                <LinearGradient
                  colors={[
                    'transparent',
                    'rgba(255,255,255,0.4)',
                    'transparent',
                  ]}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>

        <Text style={styles.subText}>{remaining} sparks to next chapter</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  badgeWrapper: {
    shadowColor: DARK.accent.violet,
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  badge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNum: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFF',
    marginTop: 2,
  },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { fontFamily: FONTS.semiBold, fontSize: 13, color: DARK.text.primary },
  xpText: { fontFamily: FONTS.regular, fontSize: 12 },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
  fillGradient: { flex: 1 },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 50 },
  subText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: DARK.text.tertiary,
    marginTop: 6,
  },
})
