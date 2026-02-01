import React, { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRequestNotificationPermission } from '@/src/hooks/useNotificationSetup'

// Components
import { PowerMoveCard } from '@/src/components/home/PowerMoveCard'

// Stores & Constants
import { useAuthStore } from '@/src/store/authStore'
import { useDreamStore } from '@/src/store/dreamStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { LANGUAGE, getMantra } from '@/src/constants/language'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { format } from 'date-fns'
import { AICoachFab } from '@/src/components/home/AICoachFab'

// HELPERS
const getCategoryBySlug = (slug: string | null | undefined): DreamCategory => {
  if (!slug) return DREAM_CATEGORIES[0]
  return DREAM_CATEGORIES.find((c) => c.slug === slug) ?? DREAM_CATEGORIES[0]
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)
  const [mantra, setMantra] = useState('')
  useRequestNotificationPermission()

  const { profile } = useAuthStore()
  const {
    dreams,
    todayActions,
    fetchDreams,
    fetchTodayActions,
    completeAction,
    skipAction,
  } = useDreamStore()

  useEffect(() => {
    fetchDreams()
    fetchTodayActions()
    setMantra(getMantra())
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchDreams(), fetchTodayActions()])
    setRefreshing(false)
  }

  // Get primary active dream
  const activeDreams = dreams.filter((d) => d.status === 'active')
  const primaryDream = activeDreams[0] // First active dream is primary

  // Filter actions for primary dream (or all if showing all)
  const pendingActions = todayActions.filter((a) => !a.is_completed)
  const completedCount = todayActions.filter((a) => a.is_completed).length
  const totalCount = todayActions.length

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Dreamer'
  const today = format(new Date(), 'EEEE, MMM d')

  const handleAddPowerMove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (primaryDream) {
      router.push(`/(modals)/new-action?dreamId=${primaryDream.id}`)
    } else {
      router.push('/(modals)/new-action')
    }
  }

  const handleViewDream = () => {
    if (primaryDream) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      router.push(`/(modals)/dream-detail?id=${primaryDream.id}`)
    }
  }

  const handleCreateDream = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(modals)/new-dream')
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
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
        {/* GREETING HEADER */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={styles.date}>{today}</Text>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Hello, </Text>
            <Text style={[styles.greeting, { color: DARK.accent.rose }]}>
              {firstName}
            </Text>
          </View>
          <Text style={styles.mantra}>"{mantra}"</Text>
        </Animated.View>

        {/* ACTIVE DREAM FOCUS CARD */}
        {primaryDream ? (
          <Animated.View entering={FadeInDown.delay(200)}>
            <ActiveDreamCard
              dream={primaryDream}
              onPress={handleViewDream}
              otherDreamsCount={activeDreams.length - 1}
            />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(200)}>
            <NoDreamCard onPress={handleCreateDream} />
          </Animated.View>
        )}

        {/* POWER MOVES SECTION */}
        {primaryDream && (
          <View style={styles.section}>
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.sectionHeader}
            >
              <View>
                <Text style={styles.sectionTitle}>Today's Power Moves</Text>
                <Text style={styles.sectionSubtitle}>
                  Steps to make it happen
                </Text>
              </View>
              {totalCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {completedCount}/{totalCount}
                  </Text>
                </View>
              )}
            </Animated.View>

            {pendingActions.length === 0 && totalCount === 0 ? (
              <Animated.View entering={FadeInUp.delay(400)}>
                <EmptyActions onAdd={handleAddPowerMove} />
              </Animated.View>
            ) : pendingActions.length === 0 ? (
              <Animated.View entering={FadeInUp.delay(400)}>
                <AllDoneCard onAddMore={handleAddPowerMove} />
              </Animated.View>
            ) : (
              <View style={styles.actionsList}>
                {pendingActions.map((action, index) => {
                  const category = getCategoryBySlug(
                    action.dream?.category?.slug,
                  )
                  return (
                    <Animated.View
                      key={action.id}
                      entering={FadeInDown.delay(400 + index * 80)}
                    >
                      <PowerMoveCard
                        id={action.id}
                        title={action.title}
                        dreamTitle={action.dream?.title ?? ''}
                        category={category}
                        sparkReward={action.xp_reward ?? 10}
                        difficulty={action.difficulty}
                        onComplete={completeAction}
                        onSkip={skipAction}
                        showHint={index === 0}
                      />
                    </Animated.View>
                  )
                })}

                {/* Add More Button */}
                <Animated.View entering={FadeInUp.delay(500)}>
                  <Pressable
                    onPress={handleAddPowerMove}
                    style={styles.addMoreButton}
                  >
                    <Ionicons
                      name='add'
                      size={18}
                      color={DARK.text.secondary}
                    />
                    <Text style={styles.addMoreText}>Add Power Move</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
      <AICoachFab />
    </View>
  )
}

// =============================================================================
// ACTIVE DREAM CARD
// =============================================================================
function ActiveDreamCard({
  dream,
  onPress,
  otherDreamsCount,
}: {
  dream: any
  onPress: () => void
  otherDreamsCount: number
}) {
  const progress =
    dream.total_actions > 0
      ? (dream.completed_actions ?? 0) / dream.total_actions
      : 0

  return (
    <Pressable onPress={onPress} style={styles.dreamCard}>
      <BlurView intensity={20} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.dreamCardBorder} />

      <View style={styles.dreamCardContent}>
        <View style={styles.dreamCardHeader}>
          <View style={styles.focusBadge}>
            <Ionicons name='flash' size={12} color={DARK.accent.gold} />
            <Text style={styles.focusText}>YOUR FOCUS</Text>
          </View>
          {otherDreamsCount > 0 && (
            <Text style={styles.otherDreams}>+{otherDreamsCount} more</Text>
          )}
        </View>

        <Text style={styles.dreamTitle} numberOfLines={2}>
          {dream.title}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(progress * 100, 2)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {dream.completed_actions ?? 0}/{dream.total_actions ?? 0} moves
          </Text>
        </View>

        <View style={styles.dreamCardFooter}>
          <Text style={styles.viewDreamText}>View Dream</Text>
          <Ionicons name='chevron-forward' size={16} color={DARK.accent.rose} />
        </View>
      </View>
    </Pressable>
  )
}

// =============================================================================
// NO DREAM CARD (First time / No active dreams)
// =============================================================================
function NoDreamCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.noDreamCard}>
      <BlurView intensity={20} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.dreamCardBorder} />

      <View style={styles.noDreamContent}>
        <View style={styles.noDreamIcon}>
          <Ionicons name='sparkles' size={32} color={DARK.accent.rose} />
        </View>
        <Text style={styles.noDreamTitle}>What's your dream?</Text>
        <Text style={styles.noDreamSubtitle}>
          Set a goal and we'll help you break it into daily actions
        </Text>
        <View style={styles.createDreamButton}>
          <Text style={styles.createDreamText}>Create Your Dream</Text>
          <Ionicons name='arrow-forward' size={16} color='#FFF' />
        </View>
      </View>
    </Pressable>
  )
}

function EmptyActions({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyActions}>
      <View style={styles.emptyIcon}>
        <Ionicons name='flash-outline' size={28} color={DARK.text.muted} />
      </View>
      <Text style={styles.emptyTitle}>No power moves yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first action to start building momentum
      </Text>
      <Pressable onPress={onAdd} style={styles.addButton}>
        <LinearGradient
          colors={DARK.gradients.primary as [string, string]}
          style={styles.addButtonGradient}
        >
          <Ionicons name='add' size={20} color='#FFF' />
          <Text style={styles.addButtonText}>Add Power Move</Text>
        </LinearGradient>
      </Pressable>
    </View>
  )
}

// =============================================================================
// ALL DONE CARD
// =============================================================================
function AllDoneCard({ onAddMore }: { onAddMore: () => void }) {
  return (
    <View style={styles.allDoneCard}>
      <View style={styles.allDoneIcon}>
        <Ionicons name='trophy' size={32} color={DARK.accent.gold} />
      </View>
      <Text style={styles.allDoneTitle}>You crushed it! 🔥</Text>
      <Text style={styles.allDoneSubtitle}>
        All power moves complete for today
      </Text>
      <Pressable onPress={onAddMore} style={styles.addBonusButton}>
        <Ionicons name='add' size={16} color={DARK.accent.rose} />
        <Text style={styles.addBonusText}>Add bonus move</Text>
      </Pressable>
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
  date: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: DARK.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  greeting: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: DARK.text.primary,
  },
  mantra: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: DARK.text.secondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },

  // Dream Card
  dreamCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: SPACING.xl,
  },
  dreamCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.xl,
  },
  dreamCardContent: {
    padding: SPACING.lg,
  },
  dreamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  focusText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: DARK.accent.gold,
    letterSpacing: 1,
  },
  otherDreams: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: DARK.text.muted,
  },
  dreamTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: DARK.text.primary,
    marginBottom: SPACING.md,
    lineHeight: 26,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DARK.accent.rose,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: DARK.text.secondary,
  },
  dreamCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDreamText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: DARK.accent.rose,
  },

  // No Dream Card
  noDreamCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: SPACING.xl,
  },
  noDreamContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  noDreamIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  noDreamTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: DARK.text.primary,
    marginBottom: SPACING.xs,
  },
  noDreamSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: DARK.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  createDreamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: DARK.accent.rose,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  createDreamText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: '#FFF',
  },

  // Section
  section: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: DARK.text.primary,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.secondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  countText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: DARK.text.secondary,
  },
  actionsList: {
    gap: SPACING.sm,
  },

  // Add More Button
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
  },
  addMoreText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.secondary,
  },

  // Empty Actions
  emptyActions: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: DARK.text.primary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addButton: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
  },
  addButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: '#FFF',
  },

  // All Done
  allDoneCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  allDoneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  allDoneTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: DARK.text.primary,
    marginBottom: SPACING.xs,
  },
  allDoneSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.secondary,
    marginBottom: SPACING.lg,
  },
  addBonusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addBonusText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: DARK.text.secondary,
  },
})
