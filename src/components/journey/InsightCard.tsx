// src/components/journey/InsightCard.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInRight,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

interface InsightCardProps {
  type: 'achievement' | 'tip' | 'milestone' | 'encouragement'
  title: string
  message: string
  icon: string
  index?: number
}

export function InsightCard({
  type,
  title,
  message,
  icon,
  index = 0,
}: InsightCardProps) {
  const shimmer = useSharedValue(0)

  const typeConfig = {
    achievement: { color: DARK.accent.gold, icon: 'star' },
    milestone: { color: DARK.accent.rose, icon: 'flag' },
    encouragement: { color: '#10B981', icon: 'heart' }, // Emerald
    tip: { color: DARK.accent.violet, icon: 'bulb' },
  }
  const config = typeConfig[type]

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )
  }, [])

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + shimmer.value * 0.2,
    transform: [{ translateX: -100 + shimmer.value * 200 }],
  }))

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 150).springify()}
      style={[styles.container, { borderColor: config.color + '30' }]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>

      <View
        style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}
      >
        <Ionicons name={icon as any} size={20} color={config.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: config.color }]}>{title}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>

      <View style={[styles.accentBar, { backgroundColor: config.color }]} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 100 },
  shimmerGradient: { flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  title: { fontFamily: FONTS.semiBold, fontSize: 13 },
  message: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.secondary,
    lineHeight: 18,
  },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
})
