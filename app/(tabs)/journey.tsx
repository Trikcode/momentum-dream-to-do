// app/(tabs)/journey.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  Dimensions,
  Platform,
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
import { useTheme } from '@/src/context/ThemeContext'
import {
  FONTS,
  SPACING,
  RADIUS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'

const { width } = Dimensions.get('window')

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
  const { colors, isDark } = useTheme()
  const [refreshing, setRefreshing] = useState(false)

  const { profile, refreshProfile } = useAuthStore()
  const { dreams, fetchDreams } = useDreamStore()

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={
            isDark
              ? [
                  PALETTE.midnight.obsidian,
                  PALETTE.midnight.slate,
                  PALETTE.midnight.obsidian,
                ]
              : [
                  colors.background,
                  colors.backgroundSecondary,
                  colors.background,
                ]
          }
          style={StyleSheet.absoluteFill}
        />
        {isDark && (
          <>
            <GlowOrb color={PALETTE.electric.cyan} style={styles.orb1} />
            <GlowOrb color={PALETTE.electric.indigo} style={styles.orb2} />
          </>
        )}
        {isDark && Platform.OS === 'ios' && (
          <BlurView
            intensity={40}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
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
            tintColor={PALETTE.electric.cyan}
          />
        }
      >
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.header}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Your Legacy
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Every step builds your story.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          <LevelCard
            level={stats.currentLevel}
            currentXP={stats.totalXP}
            xpForNext={xpForNextLevel}
            progress={levelProgress}
            colors={colors}
            isDark={isDark}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.statsGrid}>
          <StatCard
            icon='flash'
            value={stats.totalPowerMoves}
            label='Moves Made'
            color={PALETTE.electric.cyan}
            colors={colors}
            isDark={isDark}
          />
          <StatCard
            icon='flame'
            value={stats.currentStreak}
            label='Day Streak'
            color={PALETTE.status.warning}
            sublabel={`Best: ${stats.longestStreak}`}
            colors={colors}
            isDark={isDark}
          />
          <StatCard
            icon='planet'
            value={stats.activeDreams}
            label='Active Missions'
            color={PALETTE.electric.indigo}
            colors={colors}
            isDark={isDark}
          />
          <StatCard
            icon='trophy'
            value={stats.completedDreams}
            label='Victories'
            color={PALETTE.electric.emerald}
            colors={colors}
            isDark={isDark}
          />
        </Animated.View>

        {stats.currentStreak > 0 && (
          <Animated.View entering={FadeInUp.delay(400)}>
            <StreakCard
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              colors={colors}
              isDark={isDark}
            />
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
          <MotivationCard colors={colors} isDark={isDark} />
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

function LevelCard({
  level,
  currentXP,
  xpForNext,
  progress,
  colors,
  isDark,
}: any) {
  return (
    <View
      style={[
        styles.levelCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface,
        },
      ]}
    >
      {isDark && Platform.OS === 'ios' && (
        <BlurView intensity={20} tint='dark' style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']
            : [colors.surface, colors.surfaceMuted]
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View
        style={[
          styles.cardBorder,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
          },
        ]}
      />

      <View style={styles.levelContent}>
        <View style={styles.levelBadge}>
          <LinearGradient
            colors={GRADIENTS.electricAlt}
            style={styles.levelBadgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name='star' size={20} color='#FFF' />
            <Text style={styles.levelNumber}>{level}</Text>
          </LinearGradient>
        </View>

        <View style={styles.levelInfo}>
          <View style={styles.levelHeader}>
            <Text style={[styles.levelTitle, { color: colors.text }]}>
              Chapter {level}
            </Text>
            <Text style={styles.levelXP}>
              <Text style={[styles.xpCurrent, { color: colors.text }]}>
                {currentXP}
              </Text>
              <Text style={[styles.xpTotal, { color: colors.textMuted }]}>
                {' '}
                / {xpForNext} XP
              </Text>
            </Text>
          </View>

          <View
            style={[
              styles.track,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : colors.border,
              },
            ]}
          >
            <LinearGradient
              colors={GRADIENTS.electricAlt}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.fill,
                { width: `${Math.max(progress * 100, 5)}%` },
              ]}
            />
          </View>

          <Text style={[styles.levelSubtext, { color: colors.textTertiary }]}>
            {xpForNext - currentXP} sparks to next chapter
          </Text>
        </View>
      </View>
    </View>
  )
}

function StatCard({
  icon,
  value,
  label,
  color,
  sublabel,
  colors,
  isDark,
}: any) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.statIconBox,
          { backgroundColor: color + '15', borderColor: color + '30' },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      {sublabel && (
        <Text style={[styles.statSub, { color: colors.textMuted }]}>
          {sublabel}
        </Text>
      )}
    </View>
  )
}

function StreakCard({ currentStreak, longestStreak, colors, isDark }: any) {
  const isPersonalBest = currentStreak >= longestStreak && currentStreak > 1

  return (
    <View
      style={[
        styles.streakCard,
        {
          backgroundColor: isDark
            ? 'rgba(251, 191, 36, 0.05)'
            : `${PALETTE.status.warning}10`,
        },
      ]}
    >
      <LinearGradient
        colors={[PALETTE.status.warning + '20', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <View
        style={[
          styles.cardBorder,
          { borderColor: PALETTE.status.warning + '40' },
        ]}
      />

      <View style={styles.streakContent}>
        <View style={styles.fireContainer}>
          <Ionicons name='flame' size={32} color={PALETTE.status.warning} />
        </View>

        <View style={styles.streakTextContainer}>
          <View style={styles.streakRow}>
            <Text style={[styles.streakTitle, { color: colors.text }]}>
              {currentStreak} Day Streak
            </Text>
            {isPersonalBest && (
              <View style={styles.pbBadge}>
                <Ionicons
                  name='trophy'
                  size={10}
                  color={PALETTE.status.warning}
                />
                <Text
                  style={[styles.pbText, { color: PALETTE.status.warning }]}
                >
                  NEW RECORD
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.streakDesc, { color: colors.textSecondary }]}>
            {currentStreak < 7
              ? "You're building heat. Keep going!"
              : 'You are unstoppable. 🔥'}
          </Text>
        </View>
      </View>
    </View>
  )
}

function MotivationCard({ colors, isDark }: any) {
  return (
    <View
      style={[
        styles.motivationCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
        },
      ]}
    >
      <View style={styles.motivationIcon}>
        <Ionicons
          name='rocket-outline'
          size={24}
          color={PALETTE.electric.cyan}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.motivationTitle, { color: colors.textSecondary }]}>
          Momentum Builder
        </Text>
        <Text style={[styles.motivationText, { color: colors.text }]}>
          "Consistency is the bridge between goals and accomplishment."
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  orb1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.15,
  },
  orb2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    marginTop: 4,
  },
  levelCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    minHeight: 100,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  levelBadge: {
    shadowColor: PALETTE.electric.indigo,
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
  },
  levelXP: { fontSize: 12 },
  xpCurrent: {
    fontFamily: FONTS.bold,
  },
  xpTotal: {
    fontFamily: FONTS.medium,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fill: { height: '100%', borderRadius: 3 },
  levelSubtext: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
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
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  statSub: {
    fontSize: 10,
    marginTop: 4,
  },
  streakCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
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
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
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
  },
  pbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 4,
  },
  pbText: {
    fontSize: 9,
    fontFamily: FONTS.bold,
  },
  streakDesc: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  section: { marginTop: SPACING.md },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
  },
  motivationIcon: {
    paddingTop: 2,
  },
  motivationTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  motivationText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    fontStyle: 'italic',
    lineHeight: 22,
  },
})
