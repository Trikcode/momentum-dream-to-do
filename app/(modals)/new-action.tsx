// app/(modals)/new-action.tsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Dimensions,
  ActivityIndicator,
  InteractionManager,
} from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolateColor,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

// Store & Components
import { Button } from '@/src/components/ui/Button'
import { useDreamStore } from '@/src/store/dreamStore'
import { useToast } from '@/src/components/shared/Toast'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

const { width, height } = Dimensions.get('window')

type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_OPTIONS: {
  value: Difficulty
  label: string
  sparks: number
  color: string
}[] = [
  { value: 'easy', label: 'Quick Win', sparks: 5, color: '#10B981' }, // Emerald
  { value: 'medium', label: 'Power Up', sparks: 10, color: DARK.accent.gold },
  { value: 'hard', label: 'Boss Level', sparks: 20, color: DARK.accent.rose },
]

// ============================================================================
// ANIMATED ATMOSPHERE
// ============================================================================
const BreathingBlob = ({ color, size, top, left, delay = 0 }: any) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.3)

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
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 4000 }),
          withTiming(0.2, { duration: 4000 }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
          filter: 'blur(60px)',
        },
        style,
      ]}
    />
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewActionModal() {
  const insets = useSafeAreaInsets()
  const { dreamId } = useLocalSearchParams<{ dreamId?: string }>()
  const { showToast } = useToast()
  const { addAction, dreams, fetchDreams, dreamsLoading } = useDreamStore()

  const [title, setTitle] = useState('')
  const [selectedDreamId, setSelectedDreamId] = useState(dreamId || '')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const activeDreams = dreams.filter((d) => d.status === 'active')

  // Load dreams if empty
  useFocusEffect(
    useCallback(() => {
      if (dreams.length === 0) fetchDreams()
    }, [dreams.length, fetchDreams]),
  )

  // Auto-select first dream
  useEffect(() => {
    if (!selectedDreamId && activeDreams.length > 0) {
      setSelectedDreamId(activeDreams[0].id)
    }
  }, [activeDreams.length])

  // Custom Toggle Animation
  const togglePos = useSharedValue(2)
  useEffect(() => {
    togglePos.value = withTiming(isRecurring ? 22 : 2, { duration: 250 })
  }, [isRecurring])

  const toggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: togglePos.value }],
  }))

  // Focus Animation
  const focusProgress = useSharedValue(0)
  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0)
  }, [isFocused])

  const inputContainerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.1)', DARK.accent.gold],
    )
    return { borderColor }
  })

  const handleCreate = async () => {
    if (!title.trim()) {
      showToast({ type: 'error', title: 'Please enter an action' })
      return
    }

    if (!selectedDreamId) {
      showToast({ type: 'error', title: 'Please select a dream' })
      return
    }

    try {
      setIsLoading(true)

      const selectedDifficultyOption = DIFFICULTY_OPTIONS.find(
        (d) => d.value === difficulty,
      )

      await addAction({
        dream_id: selectedDreamId,
        title: title.trim(),
        difficulty,
        xp_reward: selectedDifficultyOption?.sparks || 10,
        is_recurring: isRecurring,
        due_date: new Date().toISOString().split('T')[0],
      })

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.back()

      InteractionManager.runAfterInteractions(() => {
        showToast({
          type: 'success',
          title: `Action added`,
          message: 'Momentum building...',
        })
      })
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to add action' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={[DARK.bg.primary, '#181820', DARK.bg.primary]}
          style={StyleSheet.absoluteFill}
        />
        <BreathingBlob
          color={DARK.accent.gold}
          size={300}
          top={-50}
          left={-100}
        />
        <BreathingBlob
          color={DARK.accent.rose}
          size={250}
          top={height * 0.4}
          left={width * 0.6}
          delay={1000}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name='close' size={20} color={DARK.text.secondary} />
          </Pressable>
          <Text style={styles.headerTitle}>New Power Move</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* 1. INPUT CARD */}
          <Animated.View entering={FadeInUp.delay(100).duration(500)}>
            <Text style={styles.label}>What needs to happen?</Text>

            <Animated.View style={[styles.inputWrapper, inputContainerStyle]}>
              <BlurView
                intensity={20}
                tint='dark'
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.inputInner}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isFocused
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(255,255,255,0.05)',
                    },
                  ]}
                >
                  <Ionicons
                    name='flash'
                    size={18}
                    color={isFocused ? DARK.accent.gold : DARK.text.muted}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder='e.g., Book flight to Tokyo...'
                  placeholderTextColor={DARK.text.muted}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={150}
                  multiline
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  selectionColor={DARK.accent.gold}
                />
              </View>
            </Animated.View>
          </Animated.View>

          {/* 2. DREAM SELECTOR */}
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Text style={styles.label}>Connect to a Mission</Text>

            {dreamsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={DARK.accent.rose} />
                <Text style={styles.loadingText}>Syncing dreams...</Text>
              </View>
            ) : activeDreams.length === 0 ? (
              <Pressable
                onPress={() => router.push('/(modals)/new-dream')}
                style={styles.emptyDreamsCard}
              >
                <Ionicons
                  name='add-circle-outline'
                  size={24}
                  color={DARK.text.muted}
                />
                <Text style={styles.emptyDreamsText}>
                  No active missions. Create one first!
                </Text>
              </Pressable>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dreamsScroll}
              >
                {activeDreams.map((dream) => {
                  const isSelected = selectedDreamId === dream.id
                  return (
                    <Pressable
                      key={dream.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setSelectedDreamId(dream.id)
                      }}
                      style={[
                        styles.dreamPill,
                        isSelected && styles.dreamPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dreamPillText,
                          isSelected && {
                            color: '#FFF',
                            fontFamily: FONTS.bold,
                          },
                        ]}
                      >
                        {dream.title}
                      </Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
            )}
          </Animated.View>

          {/* 3. DIFFICULTY GRID */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)}>
            <Text style={styles.label}>Energy Required</Text>
            <View style={styles.difficultyGrid}>
              {DIFFICULTY_OPTIONS.map((option) => {
                const isSelected = difficulty === option.value
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setDifficulty(option.value)
                    }}
                    style={[
                      styles.difficultyOption,
                      isSelected && {
                        backgroundColor: option.color + '15',
                        borderColor: option.color,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.difficultyDot,
                        { backgroundColor: option.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.difficultyLabel,
                        isSelected && { color: '#FFF' },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={[styles.sparksText, { color: option.color }]}>
                      +{option.sparks} XP
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </Animated.View>

          {/* 4. RECURRING TOGGLE */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setIsRecurring(!isRecurring)
              }}
              style={styles.recurringOption}
            >
              <View style={styles.recurringLeft}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isRecurring
                        ? DARK.accent.rose + '20'
                        : 'rgba(255,255,255,0.05)',
                    },
                  ]}
                >
                  <Ionicons
                    name='repeat'
                    size={20}
                    color={isRecurring ? DARK.accent.rose : DARK.text.muted}
                  />
                </View>
                <View>
                  <Text style={styles.recurringLabel}>Daily Habit</Text>
                  <Text style={styles.recurringHint}>
                    Repeat this every 24h
                  </Text>
                </View>
              </View>

              {/* Custom Toggle Switch */}
              <View
                style={[
                  styles.toggleTrack,
                  isRecurring && { backgroundColor: DARK.accent.rose },
                ]}
              >
                <Animated.View style={[styles.toggleThumb, toggleStyle]} />
              </View>
            </Pressable>
          </Animated.View>
        </ScrollView>

        {/* CREATE BUTTON (Floating) */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          style={[
            styles.bottomDock,
            { paddingBottom: insets.bottom + SPACING.md },
          ]}
        >
          <BlurView
            intensity={80}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.dockBorder} />

          <View style={styles.dockContent}>
            <Button
              title='Ignite Action'
              onPress={handleCreate}
              isLoading={isLoading}
              disabled={!title.trim() || !selectedDreamId}
              fullWidth
              size='lg'
              icon={<Ionicons name='flash' size={18} color='#FFF' />}
              iconPosition='left'
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: DARK.text.secondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Input
  inputWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    minHeight: 100,
  },
  inputInner: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: '#FFF',
    marginTop: 2, // align with icon
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Dreams
  dreamsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  dreamPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dreamPillSelected: {
    backgroundColor: DARK.accent.rose,
    borderColor: DARK.accent.rose,
  },
  dreamPillText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: DARK.text.secondary,
  },
  loadingContainer: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: DARK.text.muted,
    fontSize: 14,
  },
  emptyDreamsCard: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyDreamsText: {
    color: DARK.text.secondary,
    marginTop: 8,
    fontSize: 14,
  },

  // Difficulty
  difficultyGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: SPACING.md,
    paddingHorizontal: 4,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  difficultyLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: DARK.text.secondary,
    marginBottom: 4,
  },
  sparksText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
  },

  // Recurring
  recurringOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  recurringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  recurringLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFF',
  },
  recurringHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: DARK.text.muted,
  },

  // Toggle
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
})
