import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Button } from '@/src/components/ui/Button'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { COLORS, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { supabase } from '@/src/lib/supabase'
import { useAuthStore } from '@/src/store/authStore'
import { usePremiumStore } from '@/src/store/premiumStore'
import { useDreamStore } from '@/src/store/dreamStore'
import { PremiumGate } from '@/src/components/shared/PremiumGate'

export default function FirstDreamScreen() {
  const insets = useSafeAreaInsets()
  const { categories } = useLocalSearchParams<{ categories: string }>()
  const { user } = useAuthStore()

  const { dreams } = useDreamStore()
  const { isPremium, getDreamsLimit, setShowPaywall } = usePremiumStore()

  const dreamsLimit = getDreamsLimit()
  const currentDreamsCount = dreams.filter((d) => d.status === 'active').length
  const canCreateMore = isPremium || currentDreamsCount < dreamsLimit

  const selectedCategoryIds = categories?.split(',') || []
  const selectedCategories = DREAM_CATEGORIES.filter((c) =>
    selectedCategoryIds.includes(c.id),
  )

  const [selectedCategory, setSelectedCategory] =
    useState<DreamCategory | null>(selectedCategories[0] || null)
  const [dreamTitle, setDreamTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<TextInput>(null)

  const handleCategorySelect = (category: DreamCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedCategory(category)
    setDreamTitle('')
  }

  const handleExampleSelect = (example: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setDreamTitle(example)
    inputRef.current?.focus()
  }

  const handleCreateDream = async () => {
    if (!canCreateMore) {
      setShowPaywall(true)
      return
    }
    if (!dreamTitle.trim() || !selectedCategory || !user) return

    try {
      setIsLoading(true)

      // Create the dream
      const { error: dreamError } = await supabase.from('dreams').insert({
        user_id: user.id,
        category_id: selectedCategory.id,
        title: dreamTitle.trim(),
        status: 'active',
      })

      if (dreamError) throw dreamError

      // Update profile to mark onboarding complete
      await supabase
        .from('profiles')
        .update({ has_onboarded: true })
        .eq('id', user.id)

      // Navigate to completion screen
      router.replace('/(onboarding)/complete')
    } catch (error) {
      console.error('Error creating dream:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canCreate = dreamTitle.trim().length >= 3

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View>
        {!isPremium && (
          <View style={styles.limitBanner}>
            <Text>
              {currentDreamsCount}/{dreamsLimit} dreams used
            </Text>
            <Pressable onPress={() => setShowPaywall(true)}>
              <Text>Upgrade for unlimited</Text>
            </Pressable>
          </View>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + SPACING.lg },
          ]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.header}
          >
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>Step 2 of 2</Text>
            </View>

            <Text style={styles.title}>Create your first dream</Text>
            <Text style={styles.subtitle}>
              What's one thing you've been wanting to achieve? Don't worry, you
              can refine it later.
            </Text>
          </Animated.View>

          {/* Category Selector */}
          {selectedCategories.length > 1 && (
            <Animated.View
              entering={FadeInUp.delay(200).duration(500)}
              style={styles.categorySection}
            >
              <Text style={styles.sectionLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {selectedCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleCategorySelect(category)}
                    style={[
                      styles.categoryChip,
                      selectedCategory?.id === category.id && {
                        backgroundColor: category.color + '20',
                        borderColor: category.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={category.icon.name as any}
                      size={18}
                      color={
                        selectedCategory?.id === category.id
                          ? category.color
                          : COLORS.neutral[500]
                      }
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory?.id === category.id && {
                          color: category.color,
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Dream Input */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.inputSection}
          >
            <Text style={styles.sectionLabel}>Your Dream</Text>

            <View
              style={[
                styles.inputContainer,
                selectedCategory && { borderColor: selectedCategory.color },
              ]}
            >
              {selectedCategory && (
                <LinearGradient
                  colors={selectedCategory.gradient}
                  style={styles.inputIcon}
                >
                  <Ionicons
                    name={selectedCategory.icon.name as any}
                    size={20}
                    color='#FFF'
                  />
                </LinearGradient>
              )}

              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder='e.g., Visit 10 countries this year'
                placeholderTextColor={COLORS.neutral[400]}
                value={dreamTitle}
                onChangeText={setDreamTitle}
                multiline
                maxLength={100}
              />
            </View>

            <Text style={styles.charCount}>{dreamTitle.length}/100</Text>
          </Animated.View>

          {/* Example Suggestions */}
          {selectedCategory && (
            <Animated.View
              entering={FadeInUp.delay(400).duration(500)}
              style={styles.examplesSection}
            >
              <Text style={styles.sectionLabel}>Need inspiration?</Text>
              <View style={styles.examplesGrid}>
                {selectedCategory.examples.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleExampleSelect(example)}
                    style={styles.exampleChip}
                  >
                    <Ionicons
                      name='sparkles'
                      size={14}
                      color={COLORS.accent[500]}
                    />
                    <Text style={styles.exampleText}>{example}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          style={[
            styles.bottomSection,
            { paddingBottom: insets.bottom + SPACING.lg },
          ]}
        >
          <Button
            title='Create My Dream'
            onPress={handleCreateDream}
            disabled={!canCreate}
            isLoading={isLoading}
            size='lg'
            fullWidth
            icon={<Ionicons name='sparkles' size={20} color='#FFF' />}
            iconPosition='left'
          />
        </Animated.View>

        {/* Rest of the form */}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: SPACING.xl,
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
  categorySection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.neutral[700],
    marginBottom: SPACING.sm,
  },
  categoryScroll: {
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryChipText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
    padding: SPACING.md,
    minHeight: 80,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.neutral[900],
    paddingTop: SPACING.sm,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[400],
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  examplesSection: {
    marginBottom: SPACING.lg,
  },
  examplesGrid: {
    gap: SPACING.sm,
  },
  exampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  exampleText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.neutral[700],
    flex: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
  },
  limitBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.warning[50],
    borderRadius: RADIUS.md,
  },
})
