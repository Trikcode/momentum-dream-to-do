import React, { useEffect } from 'react'
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, RADIUS, SPACING } from '@/src/constants/theme'

interface SkeletonProps {
  width?: DimensionValue
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = RADIUS.md,
  style,
}: SkeletonProps) {
  const shimmer = useSharedValue(0)

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-200, 200]) },
    ],
  }))

  return (
    <View style={[styles.skeleton, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  )
}

// Pre-built skeleton layouts
export function PowerMoveCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.cardRow}>
        <Skeleton width={44} height={44} borderRadius={12} />
        <View style={skeletonStyles.cardContent}>
          <Skeleton width='70%' height={16} />
          <Skeleton width='40%' height={12} style={{ marginTop: 8 }} />
        </View>
        <Skeleton width={50} height={24} borderRadius={12} />
      </View>
    </View>
  )
}

export function DreamOrbSkeleton() {
  return (
    <View style={skeletonStyles.orb}>
      <Skeleton width={44} height={44} borderRadius={14} />
      <Skeleton width='80%' height={14} style={{ marginTop: SPACING.sm }} />
      <Skeleton
        width='100%'
        height={6}
        borderRadius={3}
        style={{ marginTop: SPACING.sm }}
      />
      <Skeleton width='50%' height={10} style={{ marginTop: SPACING.xs }} />
    </View>
  )
}

export function StatsRowSkeleton() {
  return (
    <View style={skeletonStyles.statsRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={skeletonStyles.statItem}>
          <Skeleton width={60} height={60} borderRadius={30} />
          <Skeleton width={40} height={14} style={{ marginTop: 8 }} />
        </View>
      ))}
    </View>
  )
}

export function InsightCardSkeleton() {
  return (
    <View style={skeletonStyles.insightCard}>
      <Skeleton width={48} height={48} borderRadius={14} />
      <View style={skeletonStyles.insightContent}>
        <Skeleton width='60%' height={14} />
        <Skeleton width='90%' height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.neutral[100],
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerGradient: {
    flex: 1,
    width: 200,
  },
})

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  orb: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  insightContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
})
