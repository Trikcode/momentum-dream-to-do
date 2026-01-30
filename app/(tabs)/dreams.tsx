// app/(tabs)/dreams.tsx
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
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'

// Components
import { DreamOrb } from '@/src/components/dreams/DreamOrb'
import { GlassCard } from '@/src/components/shared/GlassCard'
import { Button } from '@/src/components/ui/Button'
import { useDreamStore } from '@/src/store/dreamStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'

const { width } = Dimensions.get('window')

const getCategoryById = (
  categoryId: string | null | undefined,
): DreamCategory => {
  if (!categoryId) return DREAM_CATEGORIES[0]
  return (
    DREAM_CATEGORIES.find((c) => c.id === categoryId) || DREAM_CATEGORIES[0]
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
          opacity: 0.2,
          filter: 'blur(60px)',
        },
        style,
      ]}
    />
  )
}

export default function DreamsScreen() {
  const insets = useSafeAreaInsets()
  const { dreams, fetchDreams } = useDreamStore()

  useEffect(() => {
    fetchDreams()
  }, [])

  const handleDreamPress = (dreamId: string) => {
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
        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        <BreathingBlob
          color={DARK.accent.rose}
          size={300}
          top={-50}
          left={-80}
        />
        <BreathingBlob
          color={DARK.accent.violet}
          size={250}
          top={400}
          left={width - 150}
          delay={1000}
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
            {activeDreams.length} active · {completedDreams.length} achieved
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
            <View style={styles.orbsGrid}>
              {activeDreams.map((dream, index) => {
                const category = getCategoryById(dream.category_id)
                return (
                  <Animated.View
                    key={dream.id}
                    entering={FadeInUp.delay(200 + index * 100).springify()}
                  >
                    <DreamOrb
                      id={dream.id}
                      title={dream.title}
                      category={category}
                      progress={dream.progress_percent ?? 0}
                      completedActions={dream.completed_actions ?? 0}
                      totalActions={dream.total_actions ?? 0}
                      isActive={true}
                      onPress={() => handleDreamPress(dream.id)}
                      index={index}
                    />
                  </Animated.View>
                )
              })}
            </View>

            {/* Completed section */}
            {completedDreams.length > 0 && (
              <Animated.View
                entering={FadeInUp.delay(600).duration(500)}
                style={styles.completedSection}
              >
                <Text style={styles.completedTitle}>Achieved Dreams ✨</Text>
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

// Completed Card
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
          {/* Glow */}
          <View
            style={{
              position: 'absolute',
              width: 100,
              height: 100,
              backgroundColor: DARK.accent.violet,
              opacity: 0.4,
              borderRadius: 50,
              filter: 'blur(30px)',
            }}
          />
          <LinearGradient
            colors={DARK.gradients.bg as [string, string, string]}
            style={styles.emptyIconGradient}
          >
            <Ionicons name='planet' size={48} color='#FFF' />
          </LinearGradient>
        </View>

        <Text style={styles.emptyTitle}>No dreams yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first dream and start turning it into reality.
        </Text>

        <Button
          title='Create Your First Dream'
          onPress={onCreatePress}
          size='lg'
          icon={<Ionicons name='sparkles' size={20} color='#FFF' />}
          iconPosition='left'
        />
      </Animated.View>
    </View>
  )
}

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
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...DARK.glow.rose,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  orbsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    paddingTop: 80,
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
