import React, { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

// Components
import { GlassCard } from '@/src/components/shared/GlassCard'
import { Button } from '@/src/components/ui/Button'
import { useDreamStore } from '@/src/store/dreamStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'

// Dimensions for the Grid
const { width } = Dimensions.get('window')
const GAP = SPACING.md
const CARD_WIDTH = (width - SPACING.lg * 2 - GAP) / 2

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

const getCategoryById = (
  categoryId: string | null | undefined,
): DreamCategory => {
  if (!categoryId) return DREAM_CATEGORIES[0]
  return (
    DREAM_CATEGORIES.find((c) => c.id === categoryId) || DREAM_CATEGORIES[0]
  )
}

// -----------------------------------------------------------------------------
// COMPONENT: BACKGROUND BLOB (Ambience)
// -----------------------------------------------------------------------------

const BreathingBlob = ({ color, size, top, left, delay = 0 }: any) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.15)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, {
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
        },
        style,
      ]}
    />
  )
}

// COMPONENT: ACTIVE DREAM CARD (The New Design)
const ActiveDreamCard = ({ dream, index, onPress }: any) => {
  const category = getCategoryById(dream.category_id)
  const scale = useSharedValue(1)

  // Calculate Progress
  const progress =
    dream.total_actions > 0
      ? (dream.completed_actions ?? 0) / dream.total_actions
      : 0
  const percentage = Math.round(progress * 100)

  // Press Animation
  const handlePressIn = () => {
    scale.value = withSpring(0.96)
  }
  const handlePressOut = () => {
    scale.value = withSpring(1)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View entering={FadeInUp.delay(100 + index * 100).springify()}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          {/* Subtle Glass Gradient Background */}
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Border (Simulated via view or nested gradient) */}
          <View style={styles.cardBorder} />

          {/* Card Content */}
          <View style={styles.cardContent}>
            {/* Header: Icon */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: category.color + '20' },
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  color={category.color}
                />
              </View>
              {/* Optional Glow Dot */}
              <View
                style={[styles.glowDot, { backgroundColor: category.color }]}
              />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle} numberOfLines={3}>
                {dream.title}
              </Text>
            </View>

            {/* Footer: Progress */}
            <View style={styles.cardFooter}>
              <View style={styles.progressLabels}>
                <Text style={styles.percentageText}>{percentage}%</Text>
                <Text style={styles.stepsText}>
                  {dream.completed_actions}/{dream.total_actions}
                </Text>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

// -----------------------------------------------------------------------------
// MAIN SCREEN
// -----------------------------------------------------------------------------

export default function DreamsScreen() {
  const insets = useSafeAreaInsets()
  const { dreams, fetchDreams } = useDreamStore()

  useEffect(() => {
    fetchDreams()
  }, [])

  const handleDreamPress = (dreamId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/(modals)/dream-detail?id=${dreamId}`)
  }

  const handleNewDream = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(modals)/new-dream')
  }

  const activeDreams = dreams.filter((d) => d.status === 'active')
  const completedDreams = dreams.filter((d) => d.status === 'completed')

  return (
    <View style={styles.container}>
      {/* Background Ambience */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        {/* Subtle global gradient */}
        <LinearGradient
          colors={['#0F1115', '#161B22', '#0F1115']}
          style={StyleSheet.absoluteFill}
        />
        {/* Animated Blobs */}
        <BreathingBlob
          color={DARK.accent.rose}
          size={300}
          top={-80}
          left={-80}
        />
        <BreathingBlob
          color={DARK.accent.violet}
          size={250}
          top={400}
          left={width - 150}
          delay={2000}
        />
      </View>

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(500)}
        style={[styles.header, { paddingTop: insets.top + SPACING.md }]}
      >
        <View>
          <Text style={styles.title}>Your Dreams</Text>
          <Text style={styles.subtitle}>
            {activeDreams.length} in progress · {completedDreams.length}{' '}
            achieved
          </Text>
        </View>

        <Pressable onPress={handleNewDream} style={styles.addButton}>
          <LinearGradient
            colors={DARK.gradients.primary as [string, string]}
            style={styles.addButtonGradient}
          >
            <Ionicons name='add' size={24} color='#FFF' />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeDreams.length > 0 ? (
          <>
            {/* Active Dreams Grid */}
            <View style={styles.grid}>
              {activeDreams.map((dream, index) => (
                <ActiveDreamCard
                  key={dream.id}
                  dream={dream}
                  index={index}
                  onPress={() => handleDreamPress(dream.id)}
                />
              ))}
            </View>

            {/* Completed section */}
            {completedDreams.length > 0 && (
              <Animated.View
                entering={FadeInUp.delay(600).duration(500)}
                style={styles.completedSection}
              >
                <Text style={styles.completedTitle}>Trophy Room 🏆</Text>
                {completedDreams.map((dream) => (
                  <CompletedDreamCard
                    key={dream.id}
                    dream={dream}
                    onPress={() => handleDreamPress(dream.id)}
                  />
                ))}
              </Animated.View>
            )}
          </>
        ) : (
          <EmptyDreams onCreatePress={handleNewDream} />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

// -----------------------------------------------------------------------------
// SUB-COMPONENTS
// -----------------------------------------------------------------------------

// Completed Card (Uses the existing GlassCard)
function CompletedDreamCard({ dream, onPress }: any) {
  const category = getCategoryById(dream.category_id)
  const completedDate = dream.completed_at
    ? new Date(dream.completed_at).toLocaleDateString()
    : 'Recently'

  return (
    <GlassCard onPress={onPress} style={styles.completedCard}>
      <View style={styles.completedContent}>
        <View
          style={[
            styles.completedIcon,
            {
              backgroundColor: category.color + '20',
              borderColor: category.color,
            },
          ]}
        >
          <Ionicons name='trophy' size={20} color={category.color} />
        </View>
        <View style={styles.completedInfo}>
          <Text style={styles.completedDreamTitle}>{dream.title}</Text>
          <Text style={styles.completedDate}>Achieved on {completedDate}</Text>
        </View>
        <Ionicons name='chevron-forward' size={20} color={DARK.text.muted} />
      </View>
    </GlassCard>
  )
}

// Empty State
function EmptyDreams({ onCreatePress }: { onCreatePress: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={styles.emptyContent}
      >
        <View style={styles.emptyIcon}>
          <View
            style={{
              position: 'absolute',
              width: 100,
              height: 100,
              backgroundColor: DARK.accent.violet,
              opacity: 0.2,
              borderRadius: 50,
            }}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.emptyIconGradient}
          >
            <Ionicons name='planet' size={48} color='#FFF' />
          </LinearGradient>
        </View>

        <Text style={styles.emptyTitle}>No dreams yet</Text>
        <Text style={styles.emptySubtitle}>
          "The future belongs to those who believe in the beauty of their
          dreams."
        </Text>

        <Button
          title='Design Your Future'
          onPress={onCreatePress}
          size='lg'
          icon={<Ionicons name='sparkles' size={20} color='#FFF' />}
          iconPosition='left'
        />
      </Animated.View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: DARK.text.primary,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.secondary,
    marginTop: 4,
  },
  addButton: {
    shadowColor: DARK.accent.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },

  // Grid System
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },

  // Active Dream Card
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.25, // Aspect ratio roughly 4:5
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: '#181B25', // Fallback
    marginBottom: SPACING.xs,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.xl,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8,
    shadowColor: '#FFF',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: DARK.text.primary,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  cardFooter: {
    gap: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  percentageText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFF',
  },
  stepsText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: DARK.text.tertiary,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Completed Section
  completedSection: {
    marginTop: SPACING['2xl'],
  },
  completedTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: DARK.text.primary,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  completedCard: {
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  completedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  completedIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  completedInfo: {
    flex: 1,
  },
  completedDreamTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: DARK.text.primary,
  },
  completedDate: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: DARK.text.tertiary,
    marginTop: 2,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: DARK.text.primary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: DARK.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    maxWidth: '80%',
  },
})
