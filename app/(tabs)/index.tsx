// app/(tabs)/index.tsx
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  Pressable,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
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
import * as Haptics from 'expo-haptics'
import { format } from 'date-fns'

// Logic
import { useRequestNotificationPermission } from '@/src/hooks/useNotificationSetup'
import { useAuthStore } from '@/src/store/authStore'
import { useDreamStore } from '@/src/store/dreamStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { getMantra } from '@/src/constants/language'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'

// Components
import { PowerMoveCard } from '@/src/components/home/PowerMoveCard'
import { AICoachFab } from '@/src/components/home/AICoachFab'

const { width } = Dimensions.get('window')

// ============================================================================
// HELPER: ATMOSPHERIC GLOW (Subtle background blob)
// ============================================================================
const AtmosphericGlow = () => {
  const scale = useSharedValue(1)

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return <Animated.View style={[styles.atmosphericGlow, animatedStyle]} />
}

// ============================================================================
// HELPER: CATEGORY LOOKUP
// ============================================================================
const getCategoryBySlug = (slug: string | null | undefined): DreamCategory => {
  if (!slug) return DREAM_CATEGORIES[0]
  return DREAM_CATEGORIES.find((c) => c.slug === slug) ?? DREAM_CATEGORIES[0]
}

// ============================================================================
// MAIN SCREEN
// ============================================================================
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

  // Initial Load
  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(async () => {
    await Promise.all([fetchDreams(), fetchTodayActions()])
    setMantra(getMantra())
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  // --- DATA DERIVATION ---
  const activeDreams = dreams.filter((d) => d.status === 'active')
  const primaryDream = activeDreams[0]
  const pendingActions = todayActions.filter((a) => !a.is_completed)
  const completedCount = todayActions.filter((a) => a.is_completed).length
  const totalCount = todayActions.length

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Dreamer'
  const todayDate = format(new Date(), 'EEEE, MMM d')

  // --- HANDLERS ---
  const handleAddPowerMove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    primaryDream
      ? router.push(`/(modals)/new-action?dreamId=${primaryDream.id}`)
      : router.push('/(modals)/new-action')
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
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={[DARK.bg.primary, '#12121A', DARK.bg.primary]}
          style={StyleSheet.absoluteFill}
        />
        <AtmosphericGlow />
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
            progressViewOffset={insets.top + 20}
          />
        }
      >
        {/* 1. EDITORIAL HEADER */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{todayDate}</Text>
          </View>

          <View style={styles.greetingContainer}>
            <Text style={styles.greetingPrefix}>Good morning,</Text>
            <Text style={styles.greetingName}>{firstName}.</Text>
          </View>

          <View style={styles.mantraContainer}>
            <View style={styles.mantraLine} />
            <Text style={styles.mantraText}>{mantra}</Text>
          </View>
        </Animated.View>

        {/* 2. HERO CARD (Active Dream) */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.heroSection}
        >
          {primaryDream ? (
            <ActiveDreamCard
              dream={primaryDream}
              onPress={handleViewDream}
              otherDreamsCount={activeDreams.length - 1}
            />
          ) : (
            <NoDreamCard onPress={handleCreateDream} />
          )}
        </Animated.View>

        {/* 3. DAILY ACTIONS */}
        {primaryDream && (
          <View style={styles.actionsSection}>
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.sectionHeader}
            >
              <View>
                <Text style={styles.sectionTitle}>Today's Momentum</Text>
                <Text style={styles.sectionSubtitle}>
                  Small moves, massive impact.
                </Text>
              </View>
              {totalCount > 0 && (
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    {completedCount}/{totalCount}
                  </Text>
                </View>
              )}
            </Animated.View>

            {/* Empty State */}
            {pendingActions.length === 0 && totalCount === 0 && (
              <Animated.View entering={FadeInUp.delay(400)}>
                <EmptyActionsCard onAdd={handleAddPowerMove} />
              </Animated.View>
            )}

            {/* All Done State */}
            {pendingActions.length === 0 && totalCount > 0 && (
              <Animated.View entering={FadeInUp.delay(400)}>
                <AllDoneCard onAddMore={handleAddPowerMove} />
              </Animated.View>
            )}

            {/* List */}
            {pendingActions.length > 0 && (
              <View style={styles.actionsList}>
                {pendingActions.map((action, index) => {
                  const category = getCategoryBySlug(
                    action.dream?.category?.slug,
                  )
                  return (
                    <Animated.View
                      key={action.id}
                      entering={FadeInDown.delay(400 + index * 60)}
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

                <Animated.View
                  entering={FadeInUp.delay(500 + pendingActions.length * 50)}
                >
                  <Pressable
                    onPress={handleAddPowerMove}
                    style={styles.addMoreButton}
                  >
                    <Ionicons
                      name='add-circle-outline'
                      size={20}
                      color={DARK.text.secondary}
                    />
                    <Text style={styles.addMoreText}>Add another move</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AICoachFab />
    </View>
  )
}

// =============================================================================
// SUB-COMPONENT: ACTIVE DREAM CARD (Premium Feel)
// =============================================================================
function ActiveDreamCard({ dream, onPress, otherDreamsCount }: any) {
  const progress =
    dream.total_actions > 0
      ? (dream.completed_actions ?? 0) / dream.total_actions
      : 0

  const category = getCategoryBySlug(dream.category?.slug)

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      <BlurView intensity={30} tint='dark' style={StyleSheet.absoluteFill} />

      {/* Dynamic colored glow based on category */}
      <LinearGradient
        colors={[category.color + '20', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View
        style={[styles.cardBorder, { borderColor: category.color + '40' }]}
      />

      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: category.color + '20',
                borderColor: category.color + '30',
              },
            ]}
          >
            <Ionicons
              name={category.icon as any}
              size={10}
              color={category.color}
            />
            <Text style={[styles.categoryPillText, { color: category.color }]}>
              PRIMARY FOCUS
            </Text>
          </View>
          {otherDreamsCount > 0 && (
            <Text style={styles.moreDreamsText}>+{otherDreamsCount} more</Text>
          )}
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {dream.title}
        </Text>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.max(progress * 100, 5)}%`,
                  backgroundColor: category.color,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressSubtext}>
              {Math.round(progress * 100)}% Momentum
            </Text>
            <Text style={styles.progressSubtext}>
              {dream.completed_actions}/{dream.total_actions} moves
            </Text>
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.cardFooter}>
          <Text style={[styles.viewLink, { color: category.color }]}>
            View Dashboard
          </Text>
          <Ionicons name='arrow-forward' size={14} color={category.color} />
        </View>
      </View>
    </Pressable>
  )
}

// =============================================================================
// SUB-COMPONENT: NO DREAM CARD
// =============================================================================
function NoDreamCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.cardContainer}>
      <BlurView intensity={20} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.cardBorder} />

      <View
        style={[
          styles.cardContent,
          { alignItems: 'center', paddingVertical: SPACING.xl },
        ]}
      >
        <View style={styles.emptyStateIcon}>
          <Ionicons name='telescope' size={32} color={DARK.accent.rose} />
        </View>
        <Text style={styles.emptyStateTitle}>No active focus</Text>
        <Text style={styles.emptyStateDesc}>
          Choose a dream to start building momentum.
        </Text>

        <View style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Design Your Dream</Text>
          <Ionicons name='arrow-forward' size={16} color='#FFF' />
        </View>
      </View>
    </Pressable>
  )
}

// =============================================================================
// SUB-COMPONENT: EMPTY ACTIONS
// =============================================================================
function EmptyActionsCard({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.dashedCard}>
      <View style={styles.dashedContent}>
        <Text style={styles.dashedTitle}>Ready to begin?</Text>
        <Text style={styles.dashedDesc}>
          Add your first power move for today.
        </Text>
        <Pressable onPress={onAdd} style={styles.miniBtn}>
          <Ionicons name='add' size={16} color='#FFF' />
          <Text style={styles.miniBtnText}>Add Move</Text>
        </Pressable>
      </View>
    </View>
  )
}

function AllDoneCard({ onAddMore }: { onAddMore: () => void }) {
  return (
    <View style={styles.celebrationCard}>
      <LinearGradient
        colors={[DARK.accent.gold + '15', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.cardBorder} />

      <View
        style={[
          styles.cardContent,
          { flexDirection: 'row', alignItems: 'center', gap: 16 },
        ]}
      >
        <View style={styles.trophyIcon}>
          <Ionicons name='trophy' size={24} color={DARK.accent.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.celebrationTitle}>Unstoppable.</Text>
          <Text style={styles.celebrationDesc}>
            You've completed everything today.
          </Text>
        </View>
        <Pressable onPress={onAddMore} style={styles.iconBtn}>
          <Ionicons name='add' size={24} color={DARK.text.primary} />
        </Pressable>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  atmosphericGlow: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: width,
    height: 400,
    backgroundColor: DARK.accent.rose,
    opacity: 0.15,
    filter: 'blur(80px)', // Web
    borderRadius: 200,
  },

  // Header
  header: {
    marginBottom: SPACING.xl,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  dateText: {
    color: DARK.text.secondary,
    fontSize: 12,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingContainer: {
    marginBottom: SPACING.md,
  },
  greetingPrefix: {
    color: DARK.text.secondary,
    fontSize: 20,
    fontFamily: FONTS.regular,
  },
  greetingName: {
    color: DARK.text.primary,
    fontSize: 34,
    fontFamily: FONTS.bold,
    lineHeight: 40,
  },
  mantraContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mantraLine: {
    width: 2,
    height: '100%',
    backgroundColor: DARK.accent.rose,
    borderRadius: 1,
  },
  mantraText: {
    flex: 1,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    fontSize: 14,
    fontFamily: FONTS.regular,
  },

  // Hero Section (Dream Card)
  heroSection: {
    marginBottom: SPACING['2xl'],
  },
  cardContainer: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 25, 0.6)',
    minHeight: 180,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.xl,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  moreDreamsText: {
    fontSize: 12,
    color: DARK.text.muted,
    fontFamily: FONTS.medium,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: '#FFF',
    marginBottom: SPACING.lg,
    lineHeight: 30,
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FONTS.medium,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewLink: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },

  // Empty State Specifics
  emptyStateIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#FFF',
    marginBottom: 4,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: DARK.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: DARK.accent.rose,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  primaryBtnText: {
    color: '#FFF',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },

  // Actions Section
  actionsSection: {
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: DARK.text.secondary,
    fontFamily: FONTS.regular,
  },
  progressBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  progressBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: FONTS.medium,
  },

  // Empty Actions Dashed
  dashedCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dashedContent: {
    alignItems: 'center',
    gap: 8,
  },
  dashedTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: '#FFF',
  },
  dashedDesc: {
    fontSize: 14,
    color: DARK.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  miniBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: FONTS.medium,
  },

  // Celebration Card
  celebrationCard: {
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    overflow: 'hidden',
  },
  trophyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  celebrationDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },

  // List
  actionsList: {
    gap: SPACING.sm,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.lg,
    opacity: 0.7,
  },
  addMoreText: {
    fontSize: 14,
    color: DARK.text.secondary,
    fontFamily: FONTS.medium,
  },
})
