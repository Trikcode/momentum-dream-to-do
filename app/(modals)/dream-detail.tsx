// app/(modals)/dream-detail.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  Layout,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { format } from 'date-fns'

// Store & Components
import { useDreamStore } from '@/src/store/dreamStore'
import { Button } from '@/src/components/ui/Button'
import { useToast } from '@/src/components/shared/Toast'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { PowerMoveCard } from '@/src/components/home/PowerMoveCard'
import { useAuthStore } from '@/src/store/authStore'

const { width } = Dimensions.get('window')

// ============================================================================
// HELPERS
// ============================================================================
const getCategoryById = (id?: string | null): DreamCategory => {
  return DREAM_CATEGORIES.find((c) => c.id === id) || DREAM_CATEGORIES[0]
}

const ThemeBlob = ({ color }: { color: string }) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 4000 }),
        withTiming(0.2, { duration: 4000 }),
      ),
      -1,
      true,
    )
  }, [color])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    backgroundColor: color,
  }))

  return <Animated.View style={[styles.blobContainer, style]} />
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DreamDetailModal() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const {
    dreams,
    actions,
    fetchActionsByDream,
    deleteDream,
    updateDream,
    completeAction,
    skipAction,
  } = useDreamStore()
  const { showToast } = useToast()
  const { profile } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchActionsByDream(id)
    }
  }, [id])

  // Find Data
  const dream = dreams?.find((d) => d.id === id)

  // Fallback if not found (e.g. deep link error)
  if (!dream) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color='#FFF' />
        </Pressable>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: '#FFF' }}>Mission not found.</Text>
        </View>
      </View>
    )
  }

  const category = getCategoryById(dream.category_id)
  const dreamActions = actions.filter((a) => a.dream_id === dream.id)
  const pendingActions = dreamActions.filter((a) => !a.is_completed)
  const completedActions = dreamActions.filter((a) => a.is_completed)

  const progress =
    dream.total_actions && dream.total_actions > 0
      ? Math.round((dream.completed_actions! / dream.total_actions) * 100)
      : 0

  // HANDLERS
  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    Alert.alert(
      'Abandon Mission?',
      'This cannot be undone. All momentum gained here will be lost.',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDream(dream.id)
            router.back()
            showToast({ type: 'success', title: 'Mission deleted' })
          },
        },
      ],
    )
  }

  const handleCompleteDream = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setIsLoading(true)
    await updateDream(dream.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    setIsLoading(false)
    router.back()
    showToast({
      type: 'success',
      title: 'Mission Accomplished! 🎉',
      message: 'Legacy secured.',
    })
  }

  const handleAddAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push({
      pathname: '/(modals)/new-action',
      params: { dreamId: dream.id },
    })
  }

  return (
    <View style={styles.container}>
      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={[DARK.bg.primary, '#151520', DARK.bg.primary]}
          style={StyleSheet.absoluteFill}
        />
        <ThemeBlob color={category.color} />
        {/* Subtle texture overlay */}
        <BlurView intensity={30} tint='dark' style={StyleSheet.absoluteFill} />
      </View>

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name='arrow-back' size={20} color={DARK.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Mission Control</Text>
        <Pressable onPress={handleDelete} style={styles.iconButton}>
          <Ionicons name='trash-outline' size={18} color={DARK.error} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.heroCard}
        >
          <BlurView
            intensity={20}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
          {/* Dynamic Gradient based on category */}
          <LinearGradient
            colors={[category.color + '30', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          <View style={styles.heroContent}>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: category.color + '20',
                  borderColor: category.color + '40',
                },
              ]}
            >
              <Ionicons
                name={category.icon.name as any}
                size={12}
                color={category.color}
              />
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>

            <Text style={styles.dreamTitle}>{dream.title}</Text>
            {dream.description && (
              <Text style={styles.dreamDesc}>{dream.description}</Text>
            )}

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Momentum</Text>
                <Text style={styles.progressValue}>{progress}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View
                  layout={Layout.springify()}
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.max(progress, 2)}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* STATS GRID */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.statsGrid}
        >
          <View style={styles.statBox}>
            <Ionicons name='flash' size={18} color={DARK.accent.gold} />
            <Text style={styles.statNumber}>
              {dream.completed_actions || 0}
            </Text>
            <Text style={styles.statLabel}>Moves Done</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons
              name='calendar-outline'
              size={18}
              color={DARK.text.secondary}
            />
            <Text style={styles.statNumber}>
              {dream.target_date
                ? format(new Date(dream.target_date), 'MMM d')
                : '--'}
            </Text>
            <Text style={styles.statLabel}>Target</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name='flame' size={18} color={DARK.accent.rose} />
            <Text style={styles.statNumber}>
              {profile?.current_streak || 0}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </Animated.View>

        {/* ACTIONS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Action Plan</Text>
          <Pressable onPress={handleAddAction}>
            <Text style={[styles.sectionAction, { color: category.color }]}>
              + New Move
            </Text>
          </Pressable>
        </View>

        <View style={styles.actionsList}>
          {dreamActions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name='planet-outline'
                size={32}
                color={DARK.text.muted}
              />
              <Text style={styles.emptyText}>No actions defined yet.</Text>
              <Button
                title='Initiate First Move'
                onPress={handleAddAction}
                size='sm'
                variant='ghost'
                style={{ marginTop: 12 }}
              />
            </View>
          ) : (
            <>
              {pendingActions.map((action, index) => (
                <Animated.View
                  key={action.id}
                  entering={FadeInUp.delay(300 + index * 50)}
                  layout={Layout.springify()}
                >
                  <PowerMoveCard
                    id={action.id}
                    title={action.title}
                    dreamTitle={dream.title}
                    category={category}
                    sparkReward={action.xp_reward || 10}
                    difficulty={action.difficulty}
                    onComplete={completeAction}
                    onSkip={skipAction}
                    showHint={index === 0}
                  />
                </Animated.View>
              ))}

              {/* Completed Actions (Clean List) */}
              {completedActions.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Text style={styles.subHeader}>Completed History</Text>
                  {completedActions.map((action) => (
                    <View key={action.id} style={styles.completedRow}>
                      <View style={styles.completedCheck}>
                        <Ionicons
                          name='checkmark'
                          size={12}
                          color={DARK.bg.primary}
                        />
                      </View>
                      <Text style={styles.completedText} numberOfLines={1}>
                        {action.title}
                      </Text>
                      <Text style={styles.completedDate}>
                        {format(
                          new Date(action.updated_at || new Date()),
                          'MMM d',
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* BOTTOM ACTION DOCK */}
      <Animated.View
        entering={FadeInUp.delay(500)}
        style={[
          styles.bottomDock,
          { paddingBottom: insets.bottom + SPACING.md },
        ]}
      >
        <BlurView intensity={80} tint='dark' style={StyleSheet.absoluteFill} />
        <View style={styles.dockBorder} />

        <View style={styles.dockContent}>
          {progress >= 100 && dream.status !== 'completed' ? (
            <Button
              title='Complete Mission'
              onPress={handleCompleteDream}
              isLoading={isLoading}
              fullWidth
              size='lg'
              icon={<Ionicons name='trophy' size={20} color='#FFF' />}
            />
          ) : (
            <Button
              title='Add Power Move'
              onPress={handleAddAction}
              fullWidth
              size='lg'
              icon={<Ionicons name='flash' size={20} color='#FFF' />}
              style={DARK.glow.rose}
            />
          )}
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },

  // Background Blob
  blobContainer: {
    position: 'absolute',
    top: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    filter: 'blur(90px)', // Web/Expo
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    zIndex: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginTop: 60,
    marginLeft: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },

  scrollContent: {
    padding: SPACING.lg,
  },

  // Hero Card
  heroCard: {
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: SPACING.lg,
  },
  heroContent: {
    padding: SPACING.xl,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  dreamTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: '#FFF',
    marginBottom: SPACING.xs,
    lineHeight: 32,
  },
  dreamDesc: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },

  // Progress Bar
  progressContainer: { gap: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: DARK.text.secondary,
  },
  progressValue: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3 },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING['2xl'],
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#FFF',
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: DARK.text.tertiary,
    textTransform: 'uppercase',
  },

  // Actions
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionAction: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  actionsList: { gap: SPACING.md },

  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: RADIUS.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyText: {
    color: DARK.text.secondary,
    marginTop: 12,
    fontFamily: FONTS.medium,
  },

  // History
  subHeader: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: DARK.text.tertiary,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  completedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: 'rgba(255,255,255,0.4)',
    textDecorationLine: 'line-through',
  },
  completedDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    fontFamily: FONTS.regular,
  },

  // Bottom Dock
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  dockBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dockContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
})
