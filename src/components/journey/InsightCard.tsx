import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInRight,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'

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
    achievement: {
      gradient: [COLORS.accent[400], COLORS.accent[500]] as [string, string],
      iconBg: COLORS.accent[100],
      iconColor: COLORS.accent[600],
      borderColor: COLORS.accent[200],
    },
    milestone: {
      gradient: [COLORS.primary[400], COLORS.primary[500]] as [string, string],
      iconBg: COLORS.primary[100],
      iconColor: COLORS.primary[600],
      borderColor: COLORS.primary[200],
    },
    encouragement: {
      gradient: [COLORS.success[400], COLORS.success[500]] as [string, string],
      iconBg: COLORS.success[100],
      iconColor: COLORS.success[600],
      borderColor: COLORS.success[200],
    },
    tip: {
      gradient: [COLORS.secondary[400], COLORS.secondary[500]] as [
        string,
        string,
      ],
      iconBg: COLORS.secondary[100],
      iconColor: COLORS.secondary[600],
      borderColor: COLORS.secondary[200],
    },
  }

  const config = typeConfig[type]

  useEffect(() => {
    // Shimmer animation
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
    opacity: 0.3 + shimmer.value * 0.2,
    transform: [{ translateX: -100 + shimmer.value * 200 }],
  }))

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 150)
        .duration(500)
        .springify()}
      style={[styles.container, { borderColor: config.borderColor }]}
    >
      {/* Shimmer effect */}
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
        <Ionicons name={icon as any} size={22} color={config.iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: config.iconColor }]}>
            {title}
          </Text>
          {type === 'achievement' && (
            <View
              style={[styles.badge, { backgroundColor: config.gradient[0] }]}
            >
              <Ionicons name='star' size={10} color='#FFF' />
            </View>
          )}
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>

      {/* Accent bar */}
      <LinearGradient
        colors={config.gradient}
        style={styles.accentBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.sm,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.neutral[600],
    lineHeight: 18,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
})
