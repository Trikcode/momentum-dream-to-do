// app/(tabs)/dreams.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { DreamOrb } from '@/src/components/dreams/DreamOrb'
import { GlassCard } from '@/src/components/shared/GlassCard'
import { Button } from '@/src/components/ui/Button'
import { useDreamStore } from '@/src/store/dreamStore'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'

const getCategoryById = (
  categoryId: string | null | undefined,
): DreamCategory => {
  if (!categoryId) return DREAM_CATEGORIES[0]
  return (
    DREAM_CATEGORIES.find((c) => c.id === categoryId) || DREAM_CATEGORIES[0]
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <View>
          <Text style={styles.title}>Your Dreams</Text>
          <Text style={styles.subtitle}>
            {activeDreams.length} active · {completedDreams.length} achieved
          </Text>
        </View>

        <Pressable onPress={handleNewDream} style={styles.addButton}>
          <LinearGradient
            colors={COLORS.gradients.primary as [string, string]}
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
                    entering={FadeInUp.delay(200 + index * 100).duration(500)}
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
                {completedDreams.map((dream, index) => (
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

        {/* Bottom padding */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

interface CompletedDreamCardProps {
  dream: {
    id: string
    title: string
    category_id: string | null
    completed_at: string | null
  }
  onPress: () => void
}

function CompletedDreamCard({ dream, onPress }: CompletedDreamCardProps) {
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
            { backgroundColor: category.color + '20' },
          ]}
        >
          <Ionicons name='trophy' size={20} color={category.color} />
        </View>
        <View style={styles.completedInfo}>
          <Text style={styles.completedDreamTitle}>{dream.title}</Text>
          <Text style={styles.completedDate}>Achieved on {completedDate}</Text>
        </View>
        <Ionicons
          name='chevron-forward'
          size={20}
          color={COLORS.neutral[300]}
        />
      </View>
    </GlassCard>
  )
}

// Empty State
function EmptyDreams({ onCreatePress }: { onCreatePress: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Animated.View
        entering={FadeInUp.delay(300).duration(600)}
        style={styles.emptyContent}
      >
        <View style={styles.emptyIcon}>
          <LinearGradient
            colors={COLORS.gradients.dream as [string, string]}
            style={styles.emptyIconGradient}
          >
            <Ionicons name='planet' size={48} color='#FFF' />
          </LinearGradient>
        </View>

        <Text style={styles.emptyTitle}>No dreams yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first dream and start turning it into reality with daily
          power moves.
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  addButton: {
    ...SHADOWS.md,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  completedSection: {
    marginTop: SPACING.xl,
  },
  completedTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.neutral[700],
    marginBottom: SPACING.md,
  },
  completedCard: {
    marginBottom: SPACING.sm,
  },
  completedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  completedIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedInfo: {
    flex: 1,
  },
  completedDreamTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.neutral[900],
  },
  completedDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 60,
  },
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
})
