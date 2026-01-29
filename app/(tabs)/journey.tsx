// app/(tabs)/journey.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { StatOrb } from '@/src/components/journey/StatOrb'
import { WeeklyPulse } from '@/src/components/journey/WeeklyPulse'
import { MomentumCalendar } from '@/src/components/journey/MomentumCalendar'
import { ProgressWave } from '@/src/components/charts/ProgressWave'
import { InsightCard } from '@/src/components/journey/InsightCard'
import { VictoriesShowcase } from '@/src/components/journey/VictoriesShowcase'
import { ChapterProgress } from '@/src/components/journey/ChapterProgress'
import { GlassCard } from '@/src/components/shared/GlassCard'
import { useJourneyStats } from '@/src/hooks/useJourneyStats'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

export default function JourneyScreen() {
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)
  const stats = useJourneyStats()

  const onRefresh = async () => {
    setRefreshing(true)
    // Refetch stats
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  // Calculate XP needed for next chapter
  const xpForNextChapter = Math.pow(stats.currentChapter + 1, 2) * 100

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary[500]}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.header}
        >
          <Text style={styles.title}>Your Journey</Text>
          <Text style={styles.subtitle}>Every step tells your story</Text>
        </Animated.View>

        {/* Main Stats Orbs */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.statsRow}
        >
          <StatOrb
            value={stats.totalPowerMoves}
            label='Power Moves'
            icon='flash'
            gradient={COLORS.gradients.primary as [string, string]}
            delay={0}
          />
          <StatOrb
            value={stats.currentMomentum}
            label='Day Momentum'
            icon='flame'
            gradient={['#FF6B6B', '#FF8E53']}
            delay={100}
          />
          <StatOrb
            value={stats.totalSparks}
            label={LANGUAGE.spark.name}
            icon='sparkles'
            gradient={COLORS.gradients.accent as [string, string]}
            delay={200}
          />
        </Animated.View>

        {/* Chapter Progress */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <ChapterProgress
            currentChapter={stats.currentChapter}
            currentXP={stats.totalSparks}
            xpForNextChapter={xpForNextChapter}
          />
        </Animated.View>

        {/* Weekly Pulse */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          style={styles.sectionSpacing}
        >
          <WeeklyPulse
            data={stats.weekStats.days}
            totalCompleted={stats.weekStats.totalCompleted}
            completionRate={stats.weekStats.completionRate}
          />
        </Animated.View>

        {/* Progress Wave Chart */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Week at a Glance</Text>
          <GlassCard padding='md' style={styles.chartCard}>
            <ProgressWave data={stats.weekStats.days} height={140} />
          </GlassCard>
        </Animated.View>

        {/* Insights */}
        {stats.insights.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(700).duration(500)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name='bulb' size={20} color={COLORS.secondary[500]} />
              <Text style={styles.sectionTitle}>Insights</Text>
            </View>
            {stats.insights.map((insight, index) => (
              <InsightCard
                key={insight.id}
                type={insight.type}
                title={insight.title}
                message={insight.message}
                icon={insight.icon}
                index={index}
              />
            ))}
          </Animated.View>
        )}

        {/* Momentum Calendar */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(500)}
          style={styles.sectionSpacing}
        >
          <MomentumCalendar
            data={stats.monthHeatmap}
            onDayPress={(date, completed) => {
              console.log('Day pressed:', date, completed)
            }}
          />
        </Animated.View>

        {/* Victories Showcase */}
        <VictoriesShowcase
          victories={[]} // Pass actual victories from stats
          totalVictories={stats.victoriesUnlocked}
          onViewAll={() => {
            console.log('View all victories')
          }}
        />

        {/* Extra Stats Grid */}
        <Animated.View
          entering={FadeInUp.delay(900).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Lifetime Stats</Text>
          <View style={styles.statsGrid}>
            <MiniStat
              label='Dreams Active'
              value={stats.dreamsActive}
              icon='planet'
              color={COLORS.secondary[500]}
            />
            <MiniStat
              label='Dreams Achieved'
              value={stats.dreamsCompleted}
              icon='trophy'
              color={COLORS.accent[500]}
            />
            <MiniStat
              label='Longest Momentum'
              value={stats.longestMomentum}
              icon='flame'
              color='#FF6B6B'
            />
            <MiniStat
              label={LANGUAGE.victories.name}
              value={stats.victoriesUnlocked}
              icon='star'
              color={COLORS.primary[500]}
            />
          </View>
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

// Mini Stat Component
function MiniStat({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: string
  color: string
}) {
  return (
    <View style={styles.miniStat}>
      <View style={[styles.miniStatIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionSpacing: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.neutral[900],
    marginBottom: SPACING.md,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  miniStat: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  miniStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  miniStatValue: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.neutral[900],
  },
  miniStatLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
})
