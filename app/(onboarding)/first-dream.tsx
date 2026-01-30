// app/(onboarding)/first-dream.tsx
import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeInUp,
  interpolateColor,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

// Logic & Data
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { supabase } from '@/src/lib/supabase'
import { useAuthStore } from '@/src/store/authStore'
import { usePremiumStore } from '@/src/store/premiumStore'
import { useDreamStore } from '@/src/store/dreamStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const { width, height } = Dimensions.get('window')
const DOCK_HEIGHT = 100 // Estimated height of bottom area

// ============================================================================
// ANIMATED BACKGROUND
// ============================================================================

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
          opacity: 0.4,
          filter: 'blur(50px)',
        },
        style,
      ]}
    />
  )
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function FirstDreamScreen() {
  const insets = useSafeAreaInsets()
  const { categories } = useLocalSearchParams<{ categories: string }>()
  const { user } = useAuthStore()

  // Store Logic
  const { dreams } = useDreamStore()
  const { isPremium, getDreamsLimit, setShowPaywall } = usePremiumStore()

  const dreamsLimit = getDreamsLimit()
  const currentDreamsCount = dreams.filter((d) => d.status === 'active').length
  const canCreateMore = isPremium || currentDreamsCount < dreamsLimit

  // Category Parsing
  const selectedCategoryIds = categories ? categories.split(',') : []
  const filteredCategories = DREAM_CATEGORIES.filter((c) =>
    selectedCategoryIds.includes(c.id),
  )
  const activeCategories =
    filteredCategories.length > 0
      ? filteredCategories
      : DREAM_CATEGORIES.slice(0, 3)

  const [selectedCategory, setSelectedCategory] = useState<DreamCategory>(
    activeCategories[0],
  )
  const [dreamTitle, setDreamTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const handleCategorySelect = (category: DreamCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedCategory(category)
  }

  const handleExampleSelect = (example: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setDreamTitle(example)
  }

  const handleCreateDream = async () => {
    if (!canCreateMore) {
      setShowPaywall(true)
      return
    }

    if (!dreamTitle.trim() || !user) return

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    try {
      setIsLoading(true)

      const slugMapping: Record<string, string> = {
        health: 'fitness',
        career: 'career',
        wealth: 'finance',
        mind: 'lifestyle',
        skills: 'learning',
        travel: 'travel',
        relationships: 'relationships',
        creativity: 'creativity',
      }

      const dbSlug = slugMapping[selectedCategory.id] || selectedCategory.slug
      const { data: dbCategory } = await supabase
        .from('dream_categories')
        .select('id')
        .eq('slug', dbSlug)
        .single()

      const { error: dreamError } = await supabase.from('dreams').insert({
        user_id: user.id,
        category_id: dbCategory?.id || null,
        title: dreamTitle.trim(),
        status: 'active',
      })

      if (dreamError) throw dreamError

      await supabase
        .from('profiles')
        .update({ has_onboarded: true })
        .eq('id', user.id)

      router.replace('/(onboarding)/complete')
    } catch (error: any) {
      console.error('Dream creation error:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const canCreate = dreamTitle.trim().length >= 3

  // Animation for Input Border
  const borderProgress = useSharedValue(0)
  useEffect(() => {
    borderProgress.value = withTiming(isFocused ? 1 : 0)
  }, [isFocused])

  const animatedInputStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      borderProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.1)', selectedCategory.color],
    )
    return { borderColor }
  })

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
          color={selectedCategory.color}
          size={300}
          top={-50}
          left={-100}
        />
        <BreathingBlob
          color={DARK.accent.violet}
          size={250}
          top={height * 0.4}
          left={width * 0.6}
          delay={1000}
        />
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={60}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + SPACING.lg,
              // Critical Fix: Add enough padding at bottom so dock doesn't cover content
              paddingBottom: insets.bottom + DOCK_HEIGHT + 20,
            },
          ]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>Step 2 of 2</Text>
            </View>
            <Text style={styles.title}>
              What is your main{'\n'}
              <Text style={{ color: selectedCategory.color }}>Focus</Text> right
              now?
            </Text>
          </Animated.View>

          {/* CATEGORY FILTER */}
          {activeCategories.length > 1 && (
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.categoryContainer}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                // Critical Fix: Align start of list with global padding
                contentContainerStyle={{
                  paddingHorizontal: SPACING.lg,
                  gap: 10,
                }}
              >
                {activeCategories.map((cat) => {
                  const isActive = selectedCategory.id === cat.id
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => handleCategorySelect(cat)}
                      style={[
                        styles.categoryChip,
                        isActive && {
                          backgroundColor: cat.color,
                          borderColor: cat.color,
                        },
                      ]}
                    >
                      <Ionicons
                        name={isActive ? 'checkmark' : (cat.icon as any)}
                        size={14}
                        color={isActive ? '#FFF' : DARK.text.secondary}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          isActive && { color: '#FFF' },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
            </Animated.View>
          )}

          {/* INPUT CARD */}
          <Animated.View
            entering={FadeInUp.delay(300)}
            style={styles.inputSection}
          >
            <Animated.View style={[styles.inputWrapper, animatedInputStyle]}>
              <BlurView
                intensity={20}
                tint='dark'
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.inputHeader}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: selectedCategory.color },
                  ]}
                >
                  <Ionicons
                    name={selectedCategory.icon as any}
                    size={20}
                    color='#FFF'
                  />
                </View>
                <Text style={styles.inputLabel}>I want to...</Text>
              </View>

              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder='e.g. Run a 5k marathon...'
                placeholderTextColor={DARK.text.muted}
                value={dreamTitle}
                onChangeText={setDreamTitle}
                multiline
                maxLength={100}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCapitalize='sentences'
              />

              <Text style={styles.charCount}>{dreamTitle.length}/100</Text>
            </Animated.View>
          </Animated.View>

          {/* SUGGESTIONS */}
          <Animated.View
            entering={FadeInUp.delay(400)}
            style={styles.suggestions}
          >
            <Text style={styles.sectionTitle}>Ideas for you</Text>
            <View style={styles.chipGrid}>
              {selectedCategory.examples.map((ex, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleExampleSelect(ex)}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionText}>{ex}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* LIMIT WARNING */}
          {!canCreateMore && (
            <Pressable
              onPress={() => setShowPaywall(true)}
              style={styles.limitWarning}
            >
              <Ionicons name='lock-closed' size={16} color={DARK.accent.gold} />
              <Text style={styles.limitText}>
                Free limit reached. Tap to upgrade.
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* BOTTOM DOCK */}
        <Animated.View
          entering={FadeInUp.delay(500)}
          style={[styles.bottomDock, { paddingBottom: insets.bottom + 10 }]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint='dark'
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: '#0F1115', opacity: 0.95 },
              ]}
            />
          )}

          <View style={styles.dockBorder} />

          <View style={styles.dockContent}>
            <Pressable
              onPress={handleCreateDream}
              disabled={!canCreate || isLoading}
              style={[
                styles.createButton,
                (!canCreate || isLoading) && styles.buttonDisabled,
              ]}
            >
              <LinearGradient
                colors={
                  canCreate
                    ? (DARK.gradients.primary as [string, string])
                    : ['#333', '#444']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isLoading ? (
                <Text style={styles.buttonText}>Creating...</Text>
              ) : (
                <>
                  <Ionicons name='sparkles' size={18} color='#FFF' />
                  <Text style={styles.buttonText}>Create Dream</Text>
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  )
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  stepBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepText: {
    color: DARK.text.secondary,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: DARK.text.primary,
    lineHeight: 40,
  },

  // Categories
  categoryContainer: {
    marginBottom: SPACING.xl,
    // We do NOT use negative margins here anymore to avoid alignment issues.
    // Instead, the ScrollView has full width, and paddingHorizontal handles the offset.
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: DARK.text.secondary,
  },

  // Input
  inputSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  inputWrapper: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
    minHeight: 180,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: DARK.text.secondary,
    fontFamily: FONTS.medium,
  },
  input: {
    flex: 1,
    padding: SPACING.lg,
    fontSize: 20,
    fontFamily: FONTS.medium,
    color: DARK.text.primary,
    textAlignVertical: 'top',
    lineHeight: 28,
  },
  charCount: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    fontSize: 12,
    color: DARK.text.muted,
    fontFamily: FONTS.regular,
  },

  // Suggestions
  suggestions: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: DARK.text.tertiary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  suggestionText: {
    color: DARK.text.secondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },

  // Limit Warning
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.lg,
    padding: SPACING.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  limitText: {
    color: DARK.accent.gold,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },

  // Bottom Dock
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    overflow: 'hidden',
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
    padding: SPACING.lg,
  },
  createButton: {
    height: 56,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    ...DARK.glow.rose,
  },
  buttonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
})
