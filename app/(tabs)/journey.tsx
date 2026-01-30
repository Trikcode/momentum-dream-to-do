// app/(tabs)/journey.tsx
import React, { useState } from 'react'
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

// Components
import { StatOrb } from '@/src/components/journey/StatOrb'
import { WeeklyPulse } from '@/src/components/journey/WeeklyPulse'
import { MomentumCalendar } from '@/src/components/journey/MomentumCalendar'
import { ProgressWave } from '@/src/components/charts/ProgressWave'
import { InsightCard } from '@/src/components/journey/InsightCard'
import { VictoriesShowcase } from '@/src/components/journey/VictoriesShowcase'
import { ChapterProgress } from '@/src/components/journey/ChapterProgress'
import { GlassCard } from '@/src/components/shared/GlassCard'

// Logic
import { useJourneyStats } from '@/src/hooks/useJourneyStats'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

export default function JourneyScreen() {
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)

  // Hook called unconditionally at the top level
  const stats = useJourneyStats()

  const onRefresh = async () => {
    setRefreshing(true)
    // Simulate refetch
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  // Calculate XP needed for next chapter
  const xpForNextChapter = Math.pow(stats.currentChapter + 1, 2) * 100

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
      </View>

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
          <Text style={styles.subtitle}>Every step tells your story</Text>
        </Animated.View>

        {/* Main Stats Orbs */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.statsRow}>
          <StatOrb
            value={stats.totalPowerMoves}
            label='Power Moves'
            icon='flash'
            gradient={DARK.gradients.primary as [string, string]}
            delay={0}
          />
          <StatOrb
            value={stats.currentMomentum}
            label='Day Streak'
            icon='flame'
            gradient={DARK.gradients.momentum as [string, string]}
            delay={100}
          />
          <StatOrb
            value={stats.totalSparks}
            label='Total XP'
            icon='sparkles'
            gradient={[DARK.accent.violet, '#A78BFA']}
            delay={200}
          />
        </Animated.View>

        {/* Chapter Progress */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <ChapterProgress
            currentChapter={stats.currentChapter}
            currentXP={stats.totalSparks}
            xpForNextChapter={xpForNextChapter}
          />
        </Animated.View>

        {/* Weekly Pulse */}
        <Animated.View
          entering={FadeInUp.delay(500)}
          style={styles.sectionSpacing}
        >
          <WeeklyPulse
            data={stats.weekStats.days}
            totalCompleted={stats.weekStats.totalCompleted}
            completionRate={stats.weekStats.completionRate}
          />
        </Animated.View>

        {/* Progress Wave Chart */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Week at a Glance</Text>
          <GlassCard padding='md' style={styles.chartCard}>
            <ProgressWave data={stats.weekStats.days} height={140} />
          </GlassCard>
        </Animated.View>

        {/* Insights */}
        {stats.insights.length > 0 && (
          <Animated.View entering={FadeInUp.delay(700)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name='bulb' size={20} color={DARK.accent.gold} />
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
          entering={FadeInUp.delay(800)}
          style={styles.sectionSpacing}
        >
          <MomentumCalendar
            data={stats.monthHeatmap}
            onDayPress={(date: string, completed: boolean) => {}}
          />
        </Animated.View>

        {/* Victories Showcase */}
        <Animated.View
          entering={FadeInUp.delay(850)}
          style={styles.sectionSpacing}
        >
          <VictoriesShowcase
            victories={[]} // Pass actual recent victories from your store/hook here
            totalVictories={stats.victoriesUnlocked}
            onViewAll={() => console.log('View all victories')}
          />
        </Animated.View>

        {/* Extra Stats Grid */}
        <Animated.View entering={FadeInUp.delay(900)} style={styles.section}>
          <Text style={styles.sectionTitle}>Lifetime Stats</Text>
          <View style={styles.statsGrid}>
            <MiniStat
              label='Active Dreams'
              value={stats.dreamsActive}
              icon='planet'
              color={DARK.accent.violet}
            />
            <MiniStat
              label='Achieved'
              value={stats.dreamsCompleted}
              icon='trophy'
              color={DARK.accent.gold}
            />
            <MiniStat
              label='Max Streak'
              value={stats.longestMomentum}
              icon='flame'
              color={DARK.accent.rose}
            />
            <MiniStat
              label='Victories'
              value={stats.victoriesUnlocked}
              icon='medal'
              color='#10B981'
            />
          </View>
        </Animated.View>

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
      <View
        style={[
          styles.miniStatIcon,
          { backgroundColor: color + '15', borderColor: color + '30' },
        ]}
      >
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['4xl'],
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: DARK.text.primary,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.secondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING['2xl'],
  },
  sectionSpacing: {
    marginTop: SPACING['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: DARK.text.primary,
    marginBottom: SPACING.md,
  },
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  miniStat: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  miniStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  miniStatValue: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: DARK.text.primary,
  },
  miniStatLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: DARK.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
})
