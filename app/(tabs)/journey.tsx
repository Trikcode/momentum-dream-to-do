// app/(tabs)/journey.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'

import { useAuthStore } from '@/src/store/authStore'
import { useDreamStore } from '@/src/store/dreamStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

export default function JourneyScreen() {
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)

  const { profile } = useAuthStore()
  const { dreams } = useDreamStore()

  // Calculate stats from real data
  const stats = {
    totalXP: profile?.total_xp ?? 0,
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    currentLevel: profile?.current_level ?? 1,
    activeDreams: dreams.filter((d) => d.status === 'active').length,
    completedDreams: dreams.filter((d) => d.status === 'completed').length,
    totalPowerMoves: dreams.reduce(
      (acc, d) => acc + (d.completed_actions ?? 0),
      0,
    ),
  }

  // Calculate chapter/level progress
  const xpForNextLevel = Math.pow(stats.currentLevel + 1, 2) * 100
  const levelProgress = Math.min(
    (stats.totalXP % xpForNextLevel) / xpForNextLevel,
    1,
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await useAuthStore.getState().refreshProfile()
    await useDreamStore.getState().fetchDreams()
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={DARK.gradients.bg as [string, string, string]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.md },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={DARK.accent.rose}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.header}
        >
          <Text style={styles.title}>Your Journey</Text>
          <Text style={styles.subtitle}>Every step builds momentum</Text>
        </Animated.View>

        {/* Level Card */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <LevelCard
            level={stats.currentLevel}
            currentXP={stats.totalXP}
            xpForNext={xpForNextLevel}
            progress={levelProgress}
          />
        </Animated.View>

        {/* Main Stats */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.statsGrid}>
          <StatCard
            icon='flash'
            value={stats.totalPowerMoves}
            label='Power Moves'
            color={DARK.accent.rose}
          />
          <StatCard
            icon='flame'
            value={stats.currentStreak}
            label='Day Streak'
            color={DARK.accent.gold}
            sublabel={`Best: ${stats.longestStreak}`}
          />
          <StatCard
            icon='planet'
            value={stats.activeDreams}
            label='Active Dreams'
            color={DARK.accent.violet}
          />
          <StatCard
            icon='trophy'
            value={stats.completedDreams}
            label='Achieved'
            color='#10B981'
          />
        </Animated.View>

        {/* Streak Highlight (if active) */}
        {stats.currentStreak > 0 && (
          <Animated.View entering={FadeInUp.delay(400)}>
            <StreakCard
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
            />
          </Animated.View>
        )}

        {/* Motivation Section */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
          <MotivationCard stats={stats} />
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

// =============================================================================
// LEVEL CARD
// =============================================================================
function LevelCard({
  level,
  currentXP,
  xpForNext,
  progress,
}: {
  level: number
  currentXP: number
  xpForNext: number
  progress: number
}) {
  return (
    <View style={styles.levelCard}>
      <BlurView intensity={20} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.levelCardBorder} />

      <View style={styles.levelContent}>
        {/* Level Badge */}
        <View style={styles.levelBadge}>
          <LinearGradient
            colors={DARK.gradients.primary as [string, string]}
            style={styles.levelBadgeGradient}
          >
            <Ionicons name='star' size={20} color='#FFF' />
            <Text style={styles.levelNumber}>{level}</Text>
          </LinearGradient>
        </View>

        {/* Progress Section */}
        <View style={styles.levelProgress}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>Chapter {level}</Text>
            <Text style={styles.levelXP}>
              <Text style={styles.levelXPCurrent}>{currentXP}</Text>
              <Text style={styles.levelXPTotal}> / {xpForNext} XP</Text>
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={DARK.gradients.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill,
                { width: `${Math.max(progress * 100, 3)}%` },
              ]}
            />
          </View>

          <Text style={styles.levelSubtext}>
            {xpForNext - currentXP} sparks to next chapter
          </Text>
        </View>
      </View>
    </View>
  )
}

// =============================================================================
// STAT CARD
// =============================================================================
function StatCard({
  icon,
  value,
  label,
  color,
  sublabel,
}: {
  icon: string
  value: number
  label: string
  color: string
  sublabel?: string
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sublabel && <Text style={styles.statSublabel}>{sublabel}</Text>}
    </View>
  )
}

// =============================================================================
// STREAK CARD
// =============================================================================
function StreakCard({
  currentStreak,
  longestStreak,
}: {
  currentStreak: number
  longestStreak: number
}) {
  const isPersonalBest = currentStreak >= longestStreak && currentStreak > 1

  return (
    <View style={styles.streakCard}>
      <LinearGradient
        colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.streakCardBorder} />

      <View style={styles.streakContent}>
        <View style={styles.streakIconWrapper}>
          <Ionicons name='flame' size={28} color={DARK.accent.gold} />
        </View>

        <View style={styles.streakTextWrapper}>
          <View style={styles.streakTitleRow}>
            <Text style={styles.streakTitle}>{currentStreak} day streak!</Text>
            {isPersonalBest && (
              <View style={styles.personalBestBadge}>
                <Ionicons name='trophy' size={10} color={DARK.accent.gold} />
                <Text style={styles.personalBestText}>Best!</Text>
              </View>
            )}
          </View>
          <Text style={styles.streakSubtext}>
            {currentStreak === 1
              ? "You're building momentum!"
              : currentStreak < 7
                ? 'Keep the fire burning!'
                : currentStreak < 30
                  ? "You're on fire! 🔥"
                  : 'Unstoppable! 💪'}
          </Text>
        </View>
      </View>
    </View>
  )
}

// =============================================================================
// MOTIVATION CARD
// =============================================================================
function MotivationCard({ stats }: { stats: any }) {
  const getMessage = () => {
    if (stats.totalPowerMoves === 0) {
      return {
        icon: 'rocket',
        title: 'Ready to start?',
        message:
          'Complete your first power move today and begin building momentum.',
      }
    }
    if (stats.currentStreak === 0) {
      return {
        icon: 'flame-outline',
        title: 'Restart your streak',
        message: 'One power move today brings you back on track.',
      }
    }
    if (stats.currentStreak >= 7) {
      return {
        icon: 'star',
        title: 'Amazing consistency!',
        message: `${stats.currentStreak} days strong. You're proving what's possible.`,
      }
    }
    return {
      icon: 'sparkles',
      title: 'Keep going!',
      message: 'Every small action compounds into big results.',
    }
  }

  const msg = getMessage()

  return (
    <View style={styles.motivationCard}>
      <View style={styles.motivationIcon}>
        <Ionicons name={msg.icon as any} size={24} color={DARK.accent.rose} />
      </View>
      <View style={styles.motivationContent}>
        <Text style={styles.motivationTitle}>{msg.title}</Text>
        <Text style={styles.motivationText}>{msg.message}</Text>
      </View>
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },
  glowSpot1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: DARK.accent.rose,
    opacity: 0.1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: 200,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: DARK.accent.violet,
    opacity: 0.08,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },

  // Header
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: DARK.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: DARK.text.secondary,
    marginTop: 4,
  },

  // Level Card
  levelCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  levelCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.xl,
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  levelBadge: {
    shadowColor: DARK.accent.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  levelBadgeGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFF',
    marginTop: 2,
  },
  levelProgress: {
    flex: 1,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  levelTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: DARK.text.primary,
  },
  levelXP: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  levelXPCurrent: {
    color: DARK.text.primary,
    fontFamily: FONTS.bold,
  },
  levelXPTotal: {
    color: DARK.text.muted,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  levelSubtext: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: DARK.text.tertiary,
    marginTop: 6,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: DARK.text.primary,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: DARK.text.secondary,
    marginTop: 2,
  },
  statSublabel: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: DARK.text.muted,
    marginTop: 2,
  },

  // Streak Card
  streakCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  streakCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: RADIUS.xl,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  streakIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTextWrapper: {
    flex: 1,
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  streakTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: DARK.text.primary,
  },
  personalBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  personalBestText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: DARK.accent.gold,
  },
  streakSubtext: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.secondary,
    marginTop: 2,
  },

  // Motivation Card
  section: {
    marginTop: SPACING.md,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(244, 63, 94, 0.06)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.1)',
  },
  motivationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivationContent: {
    flex: 1,
  },
  motivationTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: DARK.text.primary,
    marginBottom: 4,
  },
  motivationText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.secondary,
    lineHeight: 18,
  },
})
