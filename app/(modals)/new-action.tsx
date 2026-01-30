// app/(modals)/new-action.tsx
import React, { useState, useEffect } from 'react'
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
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
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
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

// Store & Components
import { Button } from '@/src/components/ui/Button'
import { useDreamStore } from '@/src/store/dreamStore'
import { useToast } from '@/src/components/shared/Toast'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

const { width } = Dimensions.get('window')

type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_OPTIONS: {
  value: Difficulty
  label: string
  sparks: number
  color: string
}[] = [
  { value: 'easy', label: 'Quick win', sparks: 5, color: '#10B981' }, // Emerald
  { value: 'medium', label: 'Power up', sparks: 10, color: DARK.accent.gold },
  { value: 'hard', label: 'Level up', sparks: 20, color: DARK.accent.rose },
]

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
          opacity: 0.25,
          filter: 'blur(50px)',
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
  const { addAction, dreams } = useDreamStore()

  const [title, setTitle] = useState('')
  const [selectedDreamId, setSelectedDreamId] = useState(dreamId || '')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const activeDreams = dreams.filter((d) => d.status === 'active')

  // Custom Toggle Animation
  const togglePos = useSharedValue(0)
  useEffect(() => {
    togglePos.value = withTiming(isRecurring ? 22 : 2)
  }, [isRecurring])

  const toggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: togglePos.value }],
  }))

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
      showToast({
        type: 'success',
        title: `${LANGUAGE.powerMoves.singular} added!`,
      })
      router.back()
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to add action' })
    } finally {
      setIsLoading(false)
    }
  }

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
          left={-100}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name='close' size={20} color={DARK.text.secondary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            New {LANGUAGE.powerMoves.singular}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Action Title Input */}
          <Animated.View entering={FadeInUp.delay(100).duration(500)}>
            <Text style={styles.label}>
              What's your {LANGUAGE.powerMoves.singular.toLowerCase()}?
            </Text>

            <View
              style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
              ]}
            >
              <BlurView
                intensity={20}
                tint='dark'
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.inputInner}>
                <Ionicons
                  name='flash'
                  size={20}
                  color={isFocused ? DARK.accent.gold : DARK.text.muted}
                />
                <TextInput
                  style={styles.input}
                  placeholder='e.g., Research flight prices...'
                  placeholderTextColor={DARK.text.muted}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={150}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  selectionColor={DARK.accent.gold}
                />
              </View>
            </View>
          </Animated.View>

          {/* Dream Selection */}
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Text style={styles.label}>Connect to a Dream</Text>
            <View style={styles.dreamsGrid}>
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
                      styles.dreamOption,
                      isSelected && {
                        borderColor: DARK.accent.rose,
                        backgroundColor: DARK.accent.rose + '10',
                      },
                    ]}
                  >
                    <View style={styles.dreamIcon}>
                      <Ionicons
                        name='planet'
                        size={16}
                        color={isSelected ? DARK.accent.rose : DARK.text.muted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.dreamOptionText,
                        isSelected && {
                          color: DARK.text.primary,
                          fontFamily: FONTS.semiBold,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {dream.title}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name='checkmark'
                        size={16}
                        color={DARK.accent.rose}
                      />
                    )}
                  </Pressable>
                )
              })}
            </View>
          </Animated.View>

          {/* Difficulty Grid */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)}>
            <Text style={styles.label}>Challenge Level</Text>
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
                        isSelected && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <View style={styles.sparksRow}>
                      <Ionicons
                        name='sparkles'
                        size={10}
                        color={DARK.text.tertiary}
                      />
                      <Text style={styles.sparksText}>+{option.sparks}</Text>
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </Animated.View>

          {/* Recurring Toggle */}
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
                    Repeat this every day
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

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Create Button */}
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
              title={`Add ${LANGUAGE.powerMoves.singular}`}
              onPress={handleCreate}
              isLoading={isLoading}
              disabled={!title.trim() || !selectedDreamId}
              fullWidth
              size='lg'
              icon={<Ionicons name='flash' size={18} color='#FFF' />}
              iconPosition='left'
              style={styles.createButton}
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
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: DARK.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.secondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },

  // Input
  inputWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  inputWrapperFocused: {
    borderColor: DARK.accent.gold,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: DARK.text.primary,
  },

  // Dreams
  dreamsGrid: {
    gap: SPACING.sm,
  },
  dreamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: SPACING.md,
    gap: 12,
  },
  dreamIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dreamOptionText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.secondary,
  },

  // Difficulty
  difficultyGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  difficultyOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  difficultyLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: DARK.text.secondary,
    marginBottom: 4,
  },
  sparksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    opacity: 0.6,
  },
  sparksText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: DARK.text.tertiary,
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
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recurringLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: DARK.text.primary,
  },
  recurringHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: DARK.text.tertiary,
  },

  // Custom Toggle
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
    overflow: 'hidden',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
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
  createButton: {
    ...DARK.glow.rose,
  },
})
