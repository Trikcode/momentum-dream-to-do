// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Text,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { FontAwesome6, Ionicons } from '@expo/vector-icons'

// Components
import { MantraHeader } from '@/src/components/home/MantraHeader'
import { MomentumRing } from '@/src/components/home/MomentumRing'
import { PowerMoveCard } from '@/src/components/home/PowerMoveCard'
import { EmptyPowerMoves } from '@/src/components/home/EmptyPowerMoves'

// Stores & Constants
import { useAuthStore } from '@/src/store/authStore'
import { useDreamStore } from '@/src/store/dreamStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { AICoachFab } from '@/src/components/home/AICoachFab'

const { width, height } = Dimensions.get('window')

// HELPERS

const getCategoryById = (
  categoryId: string | null | undefined,
): DreamCategory => {
  if (!categoryId) return DREAM_CATEGORIES[0]
  return (
    DREAM_CATEGORIES.find((c) => c.id === categoryId) ?? DREAM_CATEGORIES[0]
  )
}

const BreathingBlob = ({ color, size, top, left, delay = 0 }: any) => {
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, {
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, {
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.3,
          filter: 'blur(60px)',
        },
        style,
      ]}
    />
  )
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)

  const { profile } = useAuthStore()
  const { todayActions, fetchTodayActions, completeAction, skipAction } =
    useDreamStore()

  useEffect(() => {
    fetchTodayActions()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTodayActions()
    setRefreshing(false)
  }

  const pendingActions = todayActions.filter((a) => !a.is_completed)
  const completedCount = todayActions.filter((a) => a.is_completed).length
  const totalCount = todayActions.length
  const progress = totalCount > 0 ? completedCount / totalCount : 0

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        <BreathingBlob
          color={DARK.accent.rose}
          size={350}
          top={-50}
          left={-100}
        />
        <BreathingBlob
          color={DARK.accent.violet}
          size={300}
          top={height * 0.4}
          left={width * 0.5}
          delay={1000}
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
            titleColor={DARK.text.muted}
          />
        }
      >
        {/* MANTRA HEADER */}
        <MantraHeader
          userName={profile?.full_name ?? 'Dreamer'}
          chapter={profile?.current_level ?? 1}
        />

        {/* HERO: MOMENTUM RING */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <MomentumRing
            currentMomentum={profile?.current_streak ?? 0}
            todayProgress={progress}
            totalSparks={profile?.total_xp ?? 0}
            userName={profile?.full_name ?? 'D'}
          />
        </Animated.View>

        {/* POWER MOVES SECTION */}
        <View style={styles.section}>
          <Animated.View
            entering={FadeInDown.delay(500).duration(500)}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>
              Today's{' '}
              <Text style={{ color: DARK.accent.gold }}>
                {LANGUAGE.powerMoves.name}
              </Text>
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {completedCount}/{totalCount}
              </Text>
            </View>
          </Animated.View>

          {todayActions.length === 0 ? (
            <EmptyPowerMoves variant='no-moves' />
          ) : pendingActions.length === 0 ? (
            <EmptyPowerMoves variant='all-done' />
          ) : (
            <View style={styles.actionsList}>
              {pendingActions.map((action, index) => {
                const category = getCategoryById(action.dream?.category_id)
                return (
                  <Animated.View
                    key={action.id}
                    entering={FadeInDown.delay(600 + index * 100).springify()}
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
                    />
                  </Animated.View>
                )
              })}
            </View>
          )}
        </View>

        {/* DAILY QUOTE */}
        <Animated.View entering={FadeInUp.delay(800).duration(600)}>
          <QuoteCard />
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
      <AICoachFab />
    </View>
  )
}

function QuoteCard() {
  const [quote] = useState({
    text: 'She believed she could, so she did.',
    author: 'R.S. Grey',
  })

  return (
    <View style={styles.quoteWrapper}>
      <BlurView intensity={20} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.quoteBorder} />
      <View style={styles.quoteContent}>
        <FontAwesome6
          name='quote-outline'
          size={24}
          color={DARK.accent.rose}
          style={{ opacity: 0.5, marginBottom: 8 }}
        />
        <Text style={styles.quoteText}>{quote.text}</Text>
        <Text style={styles.quoteAuthor}>— {quote.author}</Text>
      </View>
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

  // Section Styles
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING['2xl'],
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
    color: DARK.text.primary,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  countText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: DARK.text.secondary,
  },
  actionsList: {
    gap: SPACING.md,
  },

  // Quote Styles
  quoteWrapper: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING['2xl'],
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  quoteBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.xl,
  },
  quoteContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  quoteText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: DARK.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.muted,
    marginTop: SPACING.md,
  },
})
