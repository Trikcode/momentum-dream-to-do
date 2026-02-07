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
  ZoomIn,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { supabase } from '@/src/lib/supabase'
import { useAuthStore } from '@/src/store/authStore'
import { usePremiumStore } from '@/src/store/premiumStore'
import { useDreamStore } from '@/src/store/dreamStore'
import {
  FONTS,
  SPACING,
  RADIUS,
  GRADIENTS,
  PALETTE,
  SHADOWS,
} from '@/src/constants/new-theme'

const { width, height } = Dimensions.get('window')

const BreathingBlob = ({ color, size, top, left, delay = 0 }: any) => {
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)

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
    backgroundColor: color,
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
        },
        style,
      ]}
    />
  )
}

export default function FirstDreamScreen() {
  const insets = useSafeAreaInsets()
  const { categories } = useLocalSearchParams<{ categories: string }>()
  const { user } = useAuthStore()

  const { dreams, fetchDreams } = useDreamStore()
  const { isPremium, getDreamsLimit, setShowPaywall } = usePremiumStore()

  const dreamsLimit = getDreamsLimit()
  const currentDreamsCount = dreams.filter((d) => d.status === 'active').length
  const canCreateMore = isPremium || currentDreamsCount < dreamsLimit

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

  const focusProgress = useSharedValue(0)
  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, { duration: 300 })
  }, [isFocused])

  const animatedInputStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.1)', PALETTE.electric.cyan],
    )
    const shadowOpacity = focusProgress.value * 0.3

    return {
      borderColor,
      shadowColor: PALETTE.electric.cyan,
      shadowOpacity,
      shadowRadius: 15,
    }
  })

  return (
    <View
      style={[styles.container, { backgroundColor: PALETTE.midnight.obsidian }]}
    >
      <StatusBar barStyle='light-content' />

      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            PALETTE.midnight.obsidian,
            PALETTE.midnight.slate,
            PALETTE.midnight.obsidian,
          ]}
          style={StyleSheet.absoluteFill}
        />
        <BreathingBlob
          key={`blob-1-${selectedCategory.id}`}
          color={PALETTE.electric.cyan}
          size={350}
          top={-50}
          left={-100}
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
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <View style={styles.progressBar}>
              <View style={styles.progressTrack} />
              <View
                style={[
                  styles.progressFill,
                  {
                    width: '66%',
                    backgroundColor: PALETTE.electric.cyan,
                  },
                ]}
              />
            </View>

            <Text style={styles.title}>
              Let's make it{'\n'}
              <Text style={{ color: PALETTE.electric.cyan }}>real.</Text>
            </Text>
            <Text style={styles.subtitle}>
              What is the one big thing you want to achieve in this area?
            </Text>
          </Animated.View>

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
                          backgroundColor: PALETTE.electric.cyan,
                          borderColor: PALETTE.electric.cyan,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isActive && { color: PALETTE.midnight.obsidian },
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
                      { backgroundColor: PALETTE.electric.cyan },
                    ]}
                  >
                    <Ionicons
                      name={selectedCategory.icon as any}
                      size={14}
                      color={PALETTE.midnight.obsidian}
                    />
                  </View>
                  <Text style={styles.label}>I commit to...</Text>
                </View>

                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder='e.g. Write the first chapter of my book...'
                  placeholderTextColor={PALETTE.slate[500]}
                  value={dreamTitle}
                  onChangeText={setDreamTitle}
                  multiline
                  maxLength={140}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoCapitalize='sentences'
                  selectionColor={PALETTE.electric.cyan}
                />

                <View style={styles.charCountRow}>
                  <Text style={styles.charCount}>{dreamTitle.length}/140</Text>
                </View>
              </View>
            </Animated.View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(400)}
            style={styles.suggestionsSection}
          >
            <View style={styles.sectionHeader}>
              <Ionicons
                name='sparkles'
                size={12}
                color={PALETTE.electric.emerald}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: PALETTE.electric.emerald },
                ]}
              >
                Spark Inspiration
              </Text>
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

          {!canCreateMore && (
            <Pressable
              onPress={() => setShowPaywall(true)}
              style={styles.limitWarning}
            >
              <Ionicons
                name='lock-closed'
                size={14}
                color={PALETTE.status.warning}
              />
              <Text
                style={[styles.limitText, { color: PALETTE.status.warning }]}
              >
                Free limit reached. Tap to unlock unlimited dreams.
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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
                  ? GRADIENTS.electric
                  : ([PALETTE.slate[700], PALETTE.slate[600]] as [
                      string,
                      string,
                    ])
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
                <Ionicons
                  name='arrow-forward'
                  size={18}
                  color={PALETTE.midnight.obsidian}
                />
              </>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
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
    borderRadius: 2,
  },
  title: {
    fontSize: 34,
    fontFamily: FONTS.bold,
    color: '#FFF',
    lineHeight: 42,
    marginBottom: SPACING.sm,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: PALETTE.slate[400],
    lineHeight: 24,
  },
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
    color: PALETTE.slate[500],
  },
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
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: `${PALETTE.status.warning}15`,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: `${PALETTE.status.warning}40`,
  },
  limitText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
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
    ...SHADOWS.glow(PALETTE.electric.cyan),
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  buttonText: {
    color: PALETTE.midnight.obsidian,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
})
