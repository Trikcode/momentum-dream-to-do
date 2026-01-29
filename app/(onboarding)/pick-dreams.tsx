// app/(onboarding)/pick-dreams.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { CategoryCard } from '@/src/components/onboarding/CategoryCard'
import { Button } from '@/src/components/ui/Button'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'

export default function PickDreamsScreen() {
  const insets = useSafeAreaInsets()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      }
      if (prev.length >= 3) {
        // Replace oldest selection
        return [...prev.slice(1), categoryId]
      }
      return [...prev, categoryId]
    })
  }

  const handleContinue = () => {
    // Store selected categories and continue
    router.push({
      pathname: '/(onboarding)/first-dream',
      params: { categories: selectedCategories.join(',') },
    })
  }

  const canContinue = selectedCategories.length >= 1

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.lg }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.header}
      >
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 1 of 2</Text>
        </View>

        <Text style={styles.title}>What dreams are you chasing?</Text>
        <Text style={styles.subtitle}>
          Select up to 3 areas of life you want to transform. You can always add
          more later.
        </Text>
      </Animated.View>

      {/* Categories Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {DREAM_CATEGORIES.map((category, index) => (
            <Animated.View
              key={category.id}
              entering={FadeInUp.delay(200 + index * 50).duration(400)}
            >
              <CategoryCard
                category={category}
                isSelected={selectedCategories.includes(category.id)}
                onToggle={() => toggleCategory(category.id)}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(500)}
        style={[
          styles.bottomSection,
          { paddingBottom: insets.bottom + SPACING.lg },
        ]}
      >
        {/* Selection count */}
        <View style={styles.selectionInfo}>
          <View style={styles.selectionDots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.selectionDot,
                  selectedCategories.length > i && styles.selectionDotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.selectionText}>
            {selectedCategories.length}/3 selected
          </Text>
        </View>

        <Button
          title='Continue'
          onPress={handleContinue}
          disabled={!canContinue}
          size='lg'
          fullWidth
          icon={<Ionicons name='arrow-forward' size={20} color='#FFF' />}
          iconPosition='right'
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
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  stepIndicator: {
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.primary[600],
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[500],
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bottomSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  selectionDots: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  selectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.neutral[200],
  },
  selectionDotActive: {
    backgroundColor: COLORS.primary[500],
  },
  selectionText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[500],
  },
})
