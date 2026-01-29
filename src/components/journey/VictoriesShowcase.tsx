// src/components/journey/VictoriesShowcase.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

interface Victory {
  id: string
  name: string
  description: string
  iconName: string
  category: string
  unlockedAt: string
}

interface VictoriesShowcaseProps {
  victories: Victory[]
  totalVictories: number
  onViewAll?: () => void
}

export function VictoriesShowcase({
  victories,
  totalVictories,
  onViewAll,
}: VictoriesShowcaseProps) {
  const displayVictories = victories.slice(0, 5)

  return (
    <Animated.View
      entering={FadeIn.delay(400).duration(500)}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name='trophy' size={20} color={COLORS.accent[500]} />
          <Text style={styles.title}>{LANGUAGE.victories.name}</Text>
        </View>

        {totalVictories > 5 && (
          <Pressable onPress={onViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons
              name='chevron-forward'
              size={16}
              color={COLORS.primary[500]}
            />
          </Pressable>
        )}
      </View>

      {/* Victories scroll */}
      {displayVictories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {displayVictories.map((victory, index) => (
            <VictoryBadge key={victory.id} victory={victory} index={index} />
          ))}

          {/* Locked badge placeholder */}
          <LockedBadge count={Math.max(0, 10 - totalVictories)} />
        </ScrollView>
      ) : (
        <EmptyVictories />
      )}
    </Animated.View>
  )
}

function VictoryBadge({ victory, index }: { victory: Victory; index: number }) {
  const scale = useSharedValue(0)
  const glow = useSharedValue(0)

  const categoryColors: Record<string, [string, string]> = {
    streak: ['#FF6B6B', '#FF8E53'],
    actions: [COLORS.success[400], COLORS.success[500]],
    dreams: [COLORS.secondary[400], COLORS.secondary[500]],
    special: [COLORS.accent[400], COLORS.accent[500]],
  }

  const colors = categoryColors[victory.category] || COLORS.gradients.primary

  useEffect(() => {
    scale.value = withDelay(
      index * 100,
      withSpring(1, { damping: 10, stiffness: 100 }),
    )

    glow.value = withDelay(
      index * 100 + 300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0.5, { duration: 2000 }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.4,
  }))

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // Could show victory detail modal
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.badgeContainer, containerStyle]}>
        {/* Glow */}
        <Animated.View
          style={[styles.badgeGlow, { backgroundColor: colors[0] }, glowStyle]}
        />

        <LinearGradient
          colors={colors}
          style={styles.badge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={victory.iconName as any} size={28} color='#FFF' />
        </LinearGradient>

        <Text style={styles.badgeName} numberOfLines={1}>
          {victory.name}
        </Text>
      </Animated.View>
    </Pressable>
  )
}

function LockedBadge({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <View style={styles.lockedContainer}>
      <View style={styles.lockedBadge}>
        <Ionicons name='lock-closed' size={20} color={COLORS.neutral[300]} />
      </View>
      <Text style={styles.lockedText}>+{count} more</Text>
    </View>
  )
}

function EmptyVictories() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name='trophy-outline' size={32} color={COLORS.neutral[300]} />
      </View>
      <Text style={styles.emptyText}>
        Complete power moves to unlock your first victory!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
    paddingLeft: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.neutral[900],
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary[500],
  },
  scrollContent: {
    paddingRight: SPACING.lg,
    gap: SPACING.md,
  },
  badgeContainer: {
    alignItems: 'center',
    width: 80,
  },
  badgeGlow: {
    position: 'absolute',
    top: 5,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  badgeName: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.neutral[600],
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  lockedContainer: {
    alignItems: 'center',
    width: 80,
  },
  lockedBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.neutral[200],
  },
  lockedText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.lg,
    gap: SPACING.md,
  },
  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.neutral[500],
    flex: 1,
  },
})
