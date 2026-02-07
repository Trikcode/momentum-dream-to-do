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

import { useRequestNotificationPermission } from '@/src/hooks/useNotificationSetup'
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
import { getMantra } from '@/src/constants/language'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'

import { PowerMoveCard } from '@/src/components/home/PowerMoveCard'
import { AICoachFab } from '@/src/components/home/AICoachFab'

const { width } = Dimensions.get('window')

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

  return (
    <Animated.View
      style={[
        styles.atmosphericGlow,
        { backgroundColor: PALETTE.electric.cyan },
        animatedStyle,
      ]}
    />
  )
}

const getCategoryBySlug = (slug: string | null | undefined): DreamCategory => {
  if (!slug) return DREAM_CATEGORIES[0]
  return DREAM_CATEGORIES.find((c) => c.slug === slug) ?? DREAM_CATEGORIES[0]
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
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

  const activeDreams = dreams.filter((d) => d.status === 'active')
  const primaryDream = activeDreams[0]
  const pendingActions = todayActions.filter((a) => !a.is_completed)
  const completedCount = todayActions.filter((a) => a.is_completed).length
  const totalCount = todayActions.length

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Dreamer'
  const todayDate = format(new Date(), 'EEEE, MMM d')

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

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
        {isDark && <AtmosphericGlow />}
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
            progressViewOffset={insets.top + 20}
          />
        }
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <View
            style={[
              styles.dateBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.08)'
                  : colors.surfaceMuted,
              },
            ]}
          >
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {todayDate}
            </Text>
          </View>

          <View style={styles.greetingContainer}>
            <Text
              style={[styles.greetingPrefix, { color: colors.textSecondary }]}
            >
              Good morning,
            </Text>
            <Text style={[styles.greetingName, { color: colors.text }]}>
              {firstName}.
            </Text>
          </View>

          <View style={styles.mantraContainer}>
            <View
              style={[
                styles.mantraLine,
                { backgroundColor: PALETTE.electric.cyan },
              ]}
            />
            <Text style={[styles.mantraText, { color: colors.textTertiary }]}>
              {mantra}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.heroSection}
        >
          {primaryDream ? (
            <ActiveDreamCard
              dream={primaryDream}
              onPress={handleViewDream}
              otherDreamsCount={activeDreams.length - 1}
              colors={colors}
              isDark={isDark}
            />
          ) : (
            <NoDreamCard
              onPress={handleCreateDream}
              colors={colors}
              isDark={isDark}
            />
          )}
        </Animated.View>

        {primaryDream && (
          <View style={styles.actionsSection}>
            <Animated.View
              entering={FadeInDown.delay(300)}
              style={styles.sectionHeader}
            >
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Today's Momentum
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Small moves, massive impact.
                </Text>
              </View>
              {totalCount > 0 && (
                <View
                  style={[
                    styles.progressBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.1)'
                        : colors.surfaceMuted,
                    },
                  ]}
                >
                  <Text
                    style={[styles.progressBadgeText, { color: colors.text }]}
                  >
                    {completedCount}/{totalCount}
                  </Text>
                </View>
              )}
            </Animated.View>

            {pendingActions.length === 0 && totalCount === 0 && (
              <Animated.View entering={FadeInUp.delay(400)}>
                <EmptyActionsCard
                  onAdd={handleAddPowerMove}
                  colors={colors}
                  isDark={isDark}
                />
              </Animated.View>
            )}

            {pendingActions.length === 0 && totalCount > 0 && (
              <Animated.View entering={FadeInUp.delay(400)}>
                <AllDoneCard
                  onAddMore={handleAddPowerMove}
                  colors={colors}
                  isDark={isDark}
                />
              </Animated.View>
            )}

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
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.addMoreText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Add another move
                    </Text>
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

function ActiveDreamCard({
  dream,
  onPress,
  otherDreamsCount,
  colors,
  isDark,
}: any) {
  const progress =
    dream.total_actions > 0
      ? (dream.completed_actions ?? 0) / dream.total_actions
      : 0

  const category = getCategoryBySlug(dream.category?.slug)
  const accentColor = PALETTE.electric.cyan

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        {
          backgroundColor: isDark ? 'rgba(20, 20, 25, 0.6)' : colors.surface,
        },
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      {isDark && (
        <BlurView intensity={30} tint='dark' style={StyleSheet.absoluteFill} />
      )}

      <LinearGradient
        colors={[accentColor + '20', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View
        style={[
          styles.cardBorder,
          { borderColor: isDark ? accentColor + '40' : colors.border },
        ]}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: accentColor + '20',
                borderColor: accentColor + '30',
              },
            ]}
          >
            <Ionicons
              name={category.icon as any}
              size={10}
              color={accentColor}
            />
            <Text style={[styles.categoryPillText, { color: accentColor }]}>
              PRIMARY FOCUS
            </Text>
          </View>
          {otherDreamsCount > 0 && (
            <Text style={[styles.moreDreamsText, { color: colors.textMuted }]}>
              +{otherDreamsCount} more
            </Text>
          )}
        </View>

        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {dream.title}
        </Text>

        <View style={styles.progressSection}>
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
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.max(progress * 100, 5)}%`,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text
              style={[styles.progressSubtext, { color: colors.textTertiary }]}
            >
              {Math.round(progress * 100)}% Momentum
            </Text>
            <Text
              style={[styles.progressSubtext, { color: colors.textTertiary }]}
            >
              {dream.completed_actions}/{dream.total_actions} moves
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.viewLink, { color: accentColor }]}>
            View Dashboard
          </Text>
          <Ionicons name='arrow-forward' size={14} color={accentColor} />
        </View>
      </View>
    </Pressable>
  )
}

function NoDreamCard({
  onPress,
  colors,
  isDark,
}: {
  onPress: () => void
  colors: any
  isDark: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cardContainer,
        { backgroundColor: isDark ? 'rgba(20, 20, 25, 0.6)' : colors.surface },
      ]}
    >
      {isDark && (
        <BlurView intensity={20} tint='dark' style={StyleSheet.absoluteFill} />
      )}
      <View style={[styles.cardBorder, { borderColor: colors.border }]} />

      <View
        style={[
          styles.cardContent,
          { alignItems: 'center', paddingVertical: SPACING.xl },
        ]}
      >
        <View
          style={[
            styles.emptyStateIcon,
            { backgroundColor: `${PALETTE.electric.cyan}15` },
          ]}
        >
          <Ionicons name='telescope' size={32} color={PALETTE.electric.cyan} />
        </View>
        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
          No active focus
        </Text>
        <Text style={[styles.emptyStateDesc, { color: colors.textSecondary }]}>
          Choose a dream to start building momentum.
        </Text>

        <LinearGradient
          colors={GRADIENTS.electric}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryBtn}
        >
          <Text
            style={[
              styles.primaryBtnText,
              { color: PALETTE.midnight.obsidian },
            ]}
          >
            Design Your Dream
          </Text>
          <Ionicons
            name='arrow-forward'
            size={16}
            color={PALETTE.midnight.obsidian}
          />
        </LinearGradient>
      </View>
    </Pressable>
  )
}

function EmptyActionsCard({
  onAdd,
  colors,
  isDark,
}: {
  onAdd: () => void
  colors: any
  isDark: boolean
}) {
  return (
    <View
      style={[
        styles.dashedCard,
        {
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.02)'
            : colors.surfaceMuted,
        },
      ]}
    >
      <View style={styles.dashedContent}>
        <Text style={[styles.dashedTitle, { color: colors.text }]}>
          Ready to begin?
        </Text>
        <Text style={[styles.dashedDesc, { color: colors.textSecondary }]}>
          Add your first power move for today.
        </Text>
        <Pressable
          onPress={onAdd}
          style={[
            styles.miniBtn,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : PALETTE.electric.cyan,
            },
          ]}
        >
          <Ionicons
            name='add'
            size={16}
            color={isDark ? '#FFF' : PALETTE.midnight.obsidian}
          />
          <Text
            style={[
              styles.miniBtnText,
              { color: isDark ? '#FFF' : PALETTE.midnight.obsidian },
            ]}
          >
            Add Move
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

function AllDoneCard({
  onAddMore,
  colors,
  isDark,
}: {
  onAddMore: () => void
  colors: any
  isDark: boolean
}) {
  return (
    <View
      style={[
        styles.celebrationCard,
        { backgroundColor: `${PALETTE.electric.emerald}10` },
      ]}
    >
      <LinearGradient
        colors={[`${PALETTE.electric.emerald}15`, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.cardBorder, { borderColor: colors.border }]} />

      <View
        style={[
          styles.cardContent,
          { flexDirection: 'row', alignItems: 'center', gap: 16 },
        ]}
      >
        <View
          style={[
            styles.trophyIcon,
            { backgroundColor: `${PALETTE.electric.emerald}15` },
          ]}
        >
          <Ionicons name='trophy' size={24} color={PALETTE.electric.emerald} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.celebrationTitle, { color: colors.text }]}>
            Unstoppable.
          </Text>
          <Text
            style={[styles.celebrationDesc, { color: colors.textSecondary }]}
          >
            You've completed everything today.
          </Text>
        </View>
        <Pressable
          onPress={onAddMore}
          style={[
            styles.iconBtn,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.1)'
                : colors.surfaceMuted,
            },
          ]}
        >
          <Ionicons name='add' size={24} color={colors.text} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    opacity: 0.15,
    borderRadius: 200,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingContainer: {
    marginBottom: SPACING.md,
  },
  greetingPrefix: {
    fontSize: 20,
    fontFamily: FONTS.regular,
  },
  greetingName: {
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
    borderRadius: 1,
  },
  mantraText: {
    flex: 1,
    fontStyle: 'italic',
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  heroSection: {
    marginBottom: SPACING['2xl'],
  },
  cardContainer: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    minHeight: 180,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
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
    fontFamily: FONTS.medium,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.lg,
    lineHeight: 30,
  },
  progressSection: {
    marginBottom: SPACING.lg,
  },
  track: {
    height: 4,
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
  emptyStateIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  emptyStateDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
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
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  progressBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  dashedCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  dashedContent: {
    alignItems: 'center',
    gap: 8,
  },
  dashedTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  dashedDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  miniBtnText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  celebrationCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  trophyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  celebrationDesc: {
    fontSize: 13,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 20,
  },
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
    fontFamily: FONTS.medium,
  },
})
