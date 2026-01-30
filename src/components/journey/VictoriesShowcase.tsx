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
  FadeIn,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

export function VictoriesShowcase({
  victories,
  totalVictories,
  onViewAll,
}: any) {
  const displayVictories = victories.slice(0, 5)

  return (
    <Animated.View entering={FadeIn.delay(400)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name='trophy' size={18} color={DARK.accent.gold} />
          <Text style={styles.title}>Victories</Text>
        </View>

        {totalVictories > 5 && (
          <Pressable onPress={onViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons
              name='chevron-forward'
              size={14}
              color={DARK.accent.rose}
            />
          </Pressable>
        )}
      </View>

      {displayVictories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {displayVictories.map((victory: any, index: number) => (
            <VictoryBadge key={victory.id} victory={victory} index={index} />
          ))}
          <LockedBadge count={Math.max(0, 10 - totalVictories)} />
        </ScrollView>
      ) : (
        <EmptyVictories />
      )}
    </Animated.View>
  )
}

function VictoryBadge({ victory, index }: any) {
  const scale = useSharedValue(0)
  const glow = useSharedValue(0)

  useEffect(() => {
    scale.value = withDelay(index * 100, withSpring(1))
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
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value * 0.3 }))

  return (
    <Pressable
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Animated.View style={[styles.badgeContainer, containerStyle]}>
        <Animated.View style={[styles.badgeGlow, glowStyle]} />
        <LinearGradient
          colors={DARK.gradients.primary as [string, string]}
          style={styles.badge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={victory.iconName} size={24} color='#FFF' />
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
        <Ionicons name='lock-closed' size={20} color={DARK.text.muted} />
      </View>
      <Text style={styles.lockedText}>+{count} more</Text>
    </View>
  )
}

function EmptyVictories() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name='trophy-outline' size={24} color={DARK.text.muted} />
      </View>
      <Text style={styles.emptyText}>
        Complete power moves to unlock victories!
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.lg, paddingLeft: SPACING.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: FONTS.semiBold, fontSize: 18, color: DARK.text.primary },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: DARK.accent.rose,
  },
  scrollContent: { paddingRight: SPACING.lg, gap: SPACING.md },

  badgeContainer: { alignItems: 'center', width: 70 },
  badgeGlow: {
    position: 'absolute',
    top: 5,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: DARK.accent.rose,
    filter: 'blur(10px)',
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeName: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: DARK.text.secondary,
    marginTop: 6,
    textAlign: 'center',
  },

  lockedContainer: { alignItems: 'center', width: 70 },
  lockedBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  lockedText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: DARK.text.muted,
    marginTop: 6,
  },

  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.lg,
    gap: 12,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.secondary,
    flex: 1,
  },
})
