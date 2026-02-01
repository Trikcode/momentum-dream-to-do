// app/(tabs)/journey.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'

import { useAuthStore } from '@/src/store/authStore'
import { useDreamStore } from '@/src/store/dreamStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const { width } = Dimensions.get('window')

// ============================================================================
// ANIMATED ATMOSPHERE
// ============================================================================
const GlowOrb = ({ color, style }: any) => {
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[style, animatedStyle, { backgroundColor: color }]} />
  )
}

export default function JourneyScreen() {
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)

  const { profile, refreshProfile } = useAuthStore()
  const { dreams, fetchDreams } = useDreamStore()

  // Real stats
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

  // Level Logic
  const xpForNextLevel = Math.pow(stats.currentLevel + 1, 2) * 100
  const levelProgress = Math.min(
    (stats.totalXP % xpForNextLevel) / xpForNextLevel,
    1,
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refreshProfile(), fetchDreams()])
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={[DARK.bg.primary, '#181220', DARK.bg.primary]}
          style={StyleSheet.absoluteFill}
        />
        <GlowOrb color={DARK.accent.rose} style={styles.orb1} />
        <GlowOrb color={DARK.accent.violet} style={styles.orb2} />
        {/* Texture */}
        <BlurView intensity={40} tint='dark' style={StyleSheet.absoluteFill} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.lg },
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
        {/* HEADER */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.header}
        >
          <Text style={styles.title}>Your Legacy</Text>
          <Text style={styles.subtitle}>Every step builds your story.</Text>
        </Animated.View>

        {/* 1. LEVEL CARD */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <LevelCard
            level={stats.currentLevel}
            currentXP={stats.totalXP}
            xpForNext={xpForNextLevel}
            progress={levelProgress}
          />
        </Animated.View>

        {/* 2. STATS GRID */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.statsGrid}>
          <StatCard
            icon='flash'
            value={stats.totalPowerMoves}
            label='Moves Made'
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
            label='Active Missions'
            color={DARK.accent.violet}
          />
          <StatCard
            icon='trophy'
            value={stats.completedDreams}
            label='Victories'
            color='#10B981' // Emerald
          />
        </Animated.View>

        {/* 3. STREAK CARD */}
        {stats.currentStreak > 0 && (
          <Animated.View entering={FadeInUp.delay(400)}>
            <StreakCard
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
            />
          </Animated.View>
        )}

        {/* 4. MOTIVATION */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
          <MotivationCard stats={stats} />
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

function LevelCard({ level, currentXP, xpForNext, progress }: any) {
  return (
    <View style={styles.levelCard}>
      {/* Glass & Gradient */}
      <BlurView intensity={20} tint='dark' style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.cardBorder} />

      <View style={styles.levelContent}>
        {/* Badge */}
        <View style={styles.levelBadge}>
          <LinearGradient
            colors={[DARK.accent.violet, DARK.accent.rose]}
            style={styles.levelBadgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name='star' size={20} color='#FFF' />
            <Text style={styles.levelNumber}>{level}</Text>
          </LinearGradient>
        </View>

        {/* Info */}
        <View style={styles.levelInfo}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>Chapter {level}</Text>
            <Text style={styles.levelXP}>
              <Text style={styles.xpCurrent}>{currentXP}</Text>
              <Text style={styles.xpTotal}> / {xpForNext} XP</Text>
            </Text>
          </View>

          {/* Bar */}
          <View style={styles.track}>
            <LinearGradient
              colors={[DARK.accent.violet, DARK.accent.rose]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.fill,
                { width: `${Math.max(progress * 100, 5)}%` },
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

function StatCard({ icon, value, label, color, sublabel }: any) {
  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statIconBox,
          { backgroundColor: color + '15', borderColor: color + '30' },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sublabel && <Text style={styles.statSub}>{sublabel}</Text>}
    </View>
  )
}

function StreakCard({ currentStreak, longestStreak }: any) {
  const isPersonalBest = currentStreak >= longestStreak && currentStreak > 1

  return (
    <View style={styles.streakCard}>
      <LinearGradient
        colors={[DARK.accent.gold + '20', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <View
        style={[styles.cardBorder, { borderColor: DARK.accent.gold + '40' }]}
      />

      <View style={styles.streakContent}>
        <View style={styles.fireContainer}>
          <Ionicons name='flame' size={32} color={DARK.accent.gold} />
        </View>

        <View style={styles.streakTextContainer}>
          <View style={styles.streakRow}>
            <Text style={styles.streakTitle}>{currentStreak} Day Streak</Text>
            {isPersonalBest && (
              <View style={styles.pbBadge}>
                <Ionicons name='trophy' size={10} color={DARK.accent.gold} />
                <Text style={styles.pbText}>NEW RECORD</Text>
              </View>
            )}
          </View>
          <Text style={styles.streakDesc}>
            {currentStreak < 7
              ? "You're building heat. Keep going!"
              : 'You are unstoppable. 🔥'}
          </Text>
        </View>
      </View>
    </View>
  )
}

function MotivationCard({ stats }: any) {
  return (
    <View style={styles.motivationCard}>
      <View style={styles.motivationIcon}>
        <Ionicons name='rocket-outline' size={24} color={DARK.accent.rose} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.motivationTitle}>Momentum Builder</Text>
        <Text style={styles.motivationText}>
          "Consistency is the bridge between goals and accomplishment."
        </Text>
      </View>
    </View>
  )
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },

  // Ambience
  orb1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.15,
    filter: 'blur(80px)',
  },
  orb2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
    filter: 'blur(90px)',
  },

  // Header
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: '#FFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: DARK.text.secondary,
    marginTop: 4,
  },

  // Level Card
  levelCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    minHeight: 100,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.xl,
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  levelBadge: {
    shadowColor: DARK.accent.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  levelBadgeGradient: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  levelNumber: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFF',
    marginTop: 2,
  },
  levelInfo: { flex: 1 },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  levelTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFF',
  },
  levelXP: { fontSize: 12 },
  xpCurrent: {
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  xpTotal: {
    fontFamily: FONTS.medium,
    color: DARK.text.muted,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fill: { height: '100%', borderRadius: 3 },
  levelSubtext: {
    fontSize: 11,
    color: DARK.text.tertiary,
    fontFamily: FONTS.medium,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%', // Slightly less than half for gap
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#FFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: DARK.text.secondary,
    fontFamily: FONTS.medium,
  },
  statSub: {
    fontSize: 10,
    color: DARK.text.muted,
    marginTop: 4,
  },

  // Streak
  streakCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  fireContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTextContainer: { flex: 1 },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  streakTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  pbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 4,
  },
  pbText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: DARK.accent.gold,
  },
  streakDesc: {
    fontSize: 13,
    color: DARK.text.secondary,
    fontFamily: FONTS.regular,
  },

  // Motivation
  section: { marginTop: SPACING.md },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  motivationIcon: {
    paddingTop: 2,
  },
  motivationTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: DARK.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  motivationText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: '#FFF',
    fontStyle: 'italic',
    lineHeight: 22,
  },
})
