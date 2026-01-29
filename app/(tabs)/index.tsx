// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { MantraHeader } from '@/src/components/home/MantraHeader'
import { MomentumRing } from '@/src/components/home/MomentumRing'
import { PowerMoveCard } from '@/src/components/home/PowerMoveCard'
import { GlassCard } from '@/src/components/shared/GlassCard'
import { EmptyPowerMoves } from '@/src/components/home/EmptyPowerMoves'
import { useAuthStore } from '@/src/store/authStore'
import { useDreamStore } from '@/src/store/dreamStore'
import { COLORS, SPACING, FONTS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { Text } from 'react-native'

const getCategoryById = (
  categoryId: string | null | undefined,
): DreamCategory => {
  if (!categoryId) return DEFAULT_CATEGORY
  return DREAM_CATEGORIES.find((c) => c.id === categoryId) ?? DEFAULT_CATEGORY
}

const DEFAULT_CATEGORY: DreamCategory = {
  id: 'other',
  name: 'Other',
  slug: 'other',
  icon: { name: 'star-outline', library: 'ionicons' },
  color: COLORS.neutral[500],
  gradient: [COLORS.neutral[400], COLORS.neutral[600]],
  description: 'Other dreams',
  examples: [],
}

type Difficulty = 'easy' | 'medium' | 'hard'

const getDifficulty = (difficulty: string | null | undefined): Difficulty => {
  if (
    difficulty === 'easy' ||
    difficulty === 'medium' ||
    difficulty === 'hard'
  ) {
    return difficulty
  }
  return 'medium' // Default
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)

  const { profile } = useAuthStore()
  const { todayActions, fetchTodayActions, completeAction } = useDreamStore()

  useEffect(() => {
    fetchTodayActions()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTodayActions()
    setRefreshing(false)
  }

  const handleCompleteAction = async (actionId: string) => {
    await completeAction(actionId)
  }

  const handleSkipAction = (actionId: string) => {
    // Handle skip logic
    console.log('Skipped:', actionId)
  }

  const pendingActions = todayActions.filter((a) => !a.is_completed)
  const completedCount = todayActions.filter((a) => a.is_completed).length
  const totalCount = todayActions.length
  const progress = totalCount > 0 ? completedCount / totalCount : 0

  // Determine empty state variant
  const getEmptyVariant = () => {
    if (totalCount === 0) return 'no-moves'
    if (pendingActions.length === 0) return 'all-done'
    return null
  }

  const emptyVariant = getEmptyVariant()

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
        {/* Mantra Header */}
        <MantraHeader
          userName={profile?.full_name ?? 'Dreamer'}
          chapter={profile?.current_level ?? 1}
        />

        {/* Momentum Ring */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)}>
          <MomentumRing
            currentMomentum={profile?.current_streak ?? 0}
            todayProgress={progress}
            totalSparks={profile?.total_xp ?? 0}
            userName={profile?.full_name ?? 'D'}
          />
        </Animated.View>

        {/* Today's Power Moves */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Today's {LANGUAGE.powerMoves.name}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {completedCount}/{totalCount}
              </Text>
            </View>
          </View>

          {emptyVariant ? (
            <EmptyPowerMoves variant={emptyVariant} />
          ) : (
            <View style={styles.actionsList}>
              {pendingActions.map((action, index) => {
                const category = getCategoryById(action.dream?.category_id)

                return (
                  <Animated.View
                    key={action.id}
                    entering={FadeInDown.delay(600 + index * 100).duration(400)}
                  >
                    <PowerMoveCard
                      id={action.id}
                      title={action.title}
                      dreamTitle={action.dream?.title ?? ''}
                      category={category}
                      sparkReward={action.xp_reward ?? 10}
                      difficulty={getDifficulty(action.difficulty)}
                      onComplete={handleCompleteAction}
                      onSkip={handleSkipAction}
                    />
                  </Animated.View>
                )
              })}
            </View>
          )}
        </Animated.View>

        {/* Quote Card */}
        <Animated.View entering={FadeInUp.delay(800).duration(600)}>
          <QuoteCard />
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

// Quote Card Component
function QuoteCard() {
  const [quote, setQuote] = useState({ text: '', author: '' })

  useEffect(() => {
    // Fetch random quote
    setQuote({
      text: 'She believed she could, so she did.',
      author: 'R.S. Grey',
    })
  }, [])

  return (
    <GlassCard style={styles.quoteCard}>
      <View style={styles.quoteContent}>
        <Text style={styles.quoteIcon}>"</Text>
        <Text style={styles.quoteText}>{quote.text}</Text>
        {quote.author && (
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        )}
      </View>
    </GlassCard>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.neutral[900],
  },
  countBadge: {
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  countText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.primary[600],
  },
  actionsList: {
    gap: SPACING.md,
  },
  quoteCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  quoteContent: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  quoteIcon: {
    fontFamily: FONTS.bold,
    fontSize: 48,
    color: COLORS.primary[200],
    lineHeight: 48,
    marginBottom: -SPACING.sm,
  },
  quoteText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.neutral[700],
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteAuthor: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.neutral[400],
    marginTop: SPACING.sm,
  },
})
