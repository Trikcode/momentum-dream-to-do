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
  Keyboard,
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
  ZoomIn,
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

// ============================================================================
// DYNAMIC BACKGROUND BLOB
// ============================================================================
const BreathingBlob = ({ color, size, top, left, delay = 0 }: any) => {
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)

  // React to color changes smoothly
  const colorProgress = useSharedValue(0)

  // We use key to force re-render if needed, or we could animate color.
  // For simplicity in this specific component structure, passing color directly works
  // because the parent re-renders, but adding a key to the Blob component in parent helps.

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, {
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-40, {
            duration: 7000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    backgroundColor: color, // Animate this if using Reanimated color interpolation
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
          opacity: 0.35,
          filter: 'blur(60px)', // Web/New Expo
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

  // Store
  const { dreams, fetchDreams } = useDreamStore()
  const { isPremium, getDreamsLimit, setShowPaywall } = usePremiumStore()

  const dreamsLimit = getDreamsLimit()
  const currentDreamsCount = dreams.filter((d) => d.status === 'active').length
  const canCreateMore = isPremium || currentDreamsCount < dreamsLimit

  // Categories
  const selectedCategoryIds = categories ? categories.split(',') : []
  const filteredCategories = DREAM_CATEGORIES.filter((c) =>
    selectedCategoryIds.includes(c.id),
  )
  // Fallback if no categories passed or found
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
    // Optional: Dismiss keyboard if it was just a tap
    // Keyboard.dismiss()
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

      // Map local category IDs to DB slugs if needed
      const slugMapping: Record<string, string> = {
        vitality: 'fitness',
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
      await fetchDreams()
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

  // Input Glow Animation
  const focusProgress = useSharedValue(0)
  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, { duration: 300 })
  }, [isFocused])

  const animatedInputStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.1)', selectedCategory.color],
    )
    const shadowOpacity = focusProgress.value * 0.2

    return {
      borderColor,
      shadowColor: selectedCategory.color,
      shadowOpacity,
      shadowRadius: 15,
    }
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={[DARK.bg.primary, '#151520', DARK.bg.primary]}
          style={StyleSheet.absoluteFill}
        />
        <BreathingBlob
          key={`blob-1-${selectedCategory.id}`} // Force re-render color
          color={selectedCategory.color}
          size={350}
          top={-50}
          left={-100}
        />
        <BreathingBlob
          key={`blob-2-${selectedCategory.id}`}
          color={
            selectedCategory.color === DARK.accent.rose
              ? '#4F46E5'
              : DARK.accent.rose
          }
          size={300}
          top={height * 0.5}
          left={width * 0.4}
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
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + SPACING.lg, paddingBottom: 120 },
          ]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <View style={styles.progressBar}>
              <View style={styles.progressTrack} />
              <View style={[styles.progressFill, { width: '66%' }]} />
            </View>

            <Text style={styles.title}>
              Let's make it{'\n'}
              <Text style={{ color: selectedCategory.color }}>real.</Text>
            </Text>
            <Text style={styles.subtitle}>
              What is the one big thing you want to achieve in this area?
            </Text>
          </Animated.View>

          {/* CATEGORY TABS (If multiple selected) */}
          {activeCategories.length > 1 && (
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.categoryRow}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: SPACING.lg,
                  gap: 8,
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

          {/* MANIFESTO CARD (Input) */}
          <Animated.View
            entering={FadeInUp.delay(300)}
            style={styles.inputSection}
          >
            <Animated.View
              style={[styles.glassInputContainer, animatedInputStyle]}
            >
              <BlurView
                intensity={20}
                tint='dark'
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.inputInternal}>
                <View style={styles.inputLabelRow}>
                  <View
                    style={[
                      styles.miniIcon,
                      { backgroundColor: selectedCategory.color },
                    ]}
                  >
                    <Ionicons
                      name={selectedCategory.icon as any}
                      size={14}
                      color='#FFF'
                    />
                  </View>
                  <Text style={styles.label}>I commit to...</Text>
                </View>

                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder='e.g. Write the first chapter of my book...'
                  placeholderTextColor='rgba(255,255,255,0.3)'
                  value={dreamTitle}
                  onChangeText={setDreamTitle}
                  multiline
                  maxLength={140}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoCapitalize='sentences'
                />

                <View style={styles.charCountRow}>
                  <Text style={styles.charCount}>{dreamTitle.length}/140</Text>
                </View>
              </View>
            </Animated.View>
          </Animated.View>

          {/* SPARK INSPIRATION */}
          <Animated.View
            entering={FadeInUp.delay(400)}
            style={styles.suggestionsSection}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name='sparkles' size={12} color={DARK.accent.gold} />
              <Text style={styles.sectionTitle}>Spark Inspiration</Text>
            </View>

            <View style={styles.suggestionsGrid}>
              {selectedCategory.examples.map((ex, i) => (
                <Animated.View key={i} entering={ZoomIn.delay(450 + i * 50)}>
                  <Pressable
                    onPress={() => handleExampleSelect(ex)}
                    style={({ pressed }) => [
                      styles.suggestionPill,
                      pressed && { backgroundColor: 'rgba(255,255,255,0.1)' },
                    ]}
                  >
                    <Text style={styles.suggestionText}>{ex}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* LIMIT WARNING */}
          {!canCreateMore && (
            <Pressable
              onPress={() => setShowPaywall(true)}
              style={styles.limitWarning}
            >
              <Ionicons name='lock-closed' size={14} color={DARK.accent.gold} />
              <Text style={styles.limitText}>
                Free limit reached. Tap to unlock unlimited dreams.
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FLOATING DOCK */}
      <Animated.View
        entering={FadeInUp.delay(600).springify()}
        style={[styles.floatingDockContainer, { bottom: insets.bottom + 10 }]}
      >
        <BlurView intensity={60} tint='dark' style={StyleSheet.absoluteFill} />
        <View style={styles.dockBorder} />

        <View style={styles.dockContent}>
          <Pressable
            onPress={handleCreateDream}
            disabled={!canCreate || isLoading}
            style={[
              styles.primaryButton,
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
              <Text style={styles.buttonText}>Igniting...</Text>
            ) : (
              <>
                <Text style={styles.buttonText}>Ignite Momentum</Text>
                <Ionicons name='arrow-forward' size={18} color='#FFF' />
              </>
            )}
          </Pressable>
        </View>
      </Animated.View>
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
  progressBar: {
    height: 4,
    width: 60,
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  progressTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: DARK.accent.rose,
    borderRadius: 2,
  },
  title: {
    fontSize: 34,
    fontFamily: FONTS.bold,
    color: DARK.text.primary,
    lineHeight: 42,
    marginBottom: SPACING.sm,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: DARK.text.secondary,
    lineHeight: 24,
  },

  // Categories
  categoryRow: {
    marginBottom: SPACING.xl,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: 'rgba(255,255,255,0.6)',
  },

  // Glass Input
  inputSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  glassInputContainer: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
    minHeight: 180,
  },
  inputInternal: {
    padding: SPACING.lg,
    flex: 1,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 10,
  },
  miniIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  textInput: {
    fontSize: 22,
    fontFamily: FONTS.medium,
    color: '#FFF',
    lineHeight: 30,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCountRow: {
    alignItems: 'flex-end',
    marginTop: SPACING.sm,
  },
  charCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },

  // Suggestions
  suggestionsSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: DARK.accent.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  suggestionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FONTS.regular,
  },

  // Limit
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  limitText: {
    color: DARK.accent.gold,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },

  // Floating Dock
  floatingDockContainer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    height: 64,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  dockBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
  },
  dockContent: {
    flex: 1,
    padding: 8,
  },
  primaryButton: {
    flex: 1,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    ...DARK.glow.rose,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
})
