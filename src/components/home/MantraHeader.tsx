import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'
import { getMantra } from '@/src/constants/language'
import { format } from 'date-fns'

interface MantraHeaderProps {
  userName: string
  chapter: number
}

export function MantraHeader({ userName, chapter }: MantraHeaderProps) {
  const [mantra, setMantra] = useState('')
  const shimmerPosition = useSharedValue(0)

  useEffect(() => {
    setMantra(getMantra())

    // Subtle shimmer animation on the mantra
    shimmerPosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
  }, [])

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + shimmerPosition.value * 0.3,
  }))

  const firstName = userName.split(' ')[0]
  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <View style={styles.container}>
      {/* Date */}
      <Animated.Text
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.date}
      >
        {today}
      </Animated.Text>

      {/* Main greeting */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={styles.greetingRow}
      >
        <Text style={styles.greeting}>Hey, </Text>
        <LinearGradient
          colors={COLORS.gradients.primary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.nameGradient}
        >
          <Text style={styles.nameText}>{firstName}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Mantra */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(600)}
        style={styles.mantraContainer}
      >
        <Animated.View style={[styles.mantraContent, shimmerStyle]}>
          <View style={styles.quoteIcon}>
            <Ionicons name='sparkles' size={16} color={COLORS.secondary[400]} />
          </View>
          <Text style={styles.mantraText}>{mantra}</Text>
        </Animated.View>
      </Animated.View>

      {/* Chapter indicator */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        style={styles.chapterBadge}
      >
        <LinearGradient
          colors={[COLORS.secondary[100], COLORS.secondary[50]]}
          style={styles.chapterGradient}
        >
          <Ionicons name='book' size={12} color={COLORS.secondary[600]} />
          <Text style={styles.chapterText}>Chapter {chapter}</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  date: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  greeting: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.neutral[900],
  },
  nameGradient: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nameText: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.primary[500],
  },
  mantraContainer: {
    marginBottom: SPACING.sm,
  },
  mantraContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quoteIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  mantraText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.neutral[600],
    flex: 1,
    fontStyle: 'italic',
  },
  chapterBadge: {
    alignSelf: 'flex-start',
  },
  chapterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  chapterText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.secondary[600],
  },
})
