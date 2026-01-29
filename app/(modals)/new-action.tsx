// app/(modals)/new-action.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Button } from '@/src/components/ui/Button'
import { useDreamStore } from '@/src/store/dreamStore'
import { useToast } from '@/src/components/shared/Toast'
import { COLORS, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_OPTIONS: {
  value: Difficulty
  label: string
  sparks: number
  color: string
}[] = [
  { value: 'easy', label: 'Quick win', sparks: 5, color: COLORS.success[500] },
  { value: 'medium', label: 'Power up', sparks: 10, color: COLORS.accent[500] },
  { value: 'hard', label: 'Level up', sparks: 20, color: COLORS.primary[500] },
]

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

  const activeDreams = dreams.filter((d) => d.status === 'active')

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
        message: 'Ready to crush it!',
      })

      router.back()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to add action',
        message: 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name='close' size={24} color={COLORS.neutral[600]} />
        </Pressable>
        <Text style={styles.headerTitle}>
          New {LANGUAGE.powerMoves.singular}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        {/* Action title */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <Text style={styles.label}>
            What's your {LANGUAGE.powerMoves.singular.toLowerCase()}?
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name='flash' size={20} color={COLORS.primary[500]} />
            <TextInput
              style={styles.input}
              placeholder='e.g., Research flight prices, Run 2km...'
              placeholderTextColor={COLORS.neutral[400]}
              value={title}
              onChangeText={setTitle}
              maxLength={150}
            />
          </View>
        </Animated.View>

        {/* Dream selection */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <Text style={styles.label}>For which dream?</Text>
          <View style={styles.dreamsGrid}>
            {activeDreams.map((dream) => (
              <Pressable
                key={dream.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setSelectedDreamId(dream.id)
                }}
                style={[
                  styles.dreamOption,
                  selectedDreamId === dream.id && styles.dreamOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dreamOptionText,
                    selectedDreamId === dream.id &&
                      styles.dreamOptionTextSelected,
                  ]}
                  numberOfLines={2}
                >
                  {dream.title}
                </Text>
                {selectedDreamId === dream.id && (
                  <Ionicons
                    name='checkmark-circle'
                    size={18}
                    color={COLORS.primary[500]}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Difficulty selection */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Text style={styles.label}>How challenging is this?</Text>
          <View style={styles.difficultyGrid}>
            {DIFFICULTY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  setDifficulty(option.value)
                }}
                style={[
                  styles.difficultyOption,
                  difficulty === option.value && {
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
                    difficulty === option.value && { color: option.color },
                  ]}
                >
                  {option.label}
                </Text>
                <View style={styles.sparksRow}>
                  <Ionicons
                    name='sparkles'
                    size={12}
                    color={COLORS.accent[500]}
                  />
                  <Text style={styles.sparksText}>+{option.sparks}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Recurring toggle */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setIsRecurring(!isRecurring)
            }}
            style={styles.recurringOption}
          >
            <View style={styles.recurringLeft}>
              <Ionicons
                name='repeat'
                size={20}
                color={isRecurring ? COLORS.primary[500] : COLORS.neutral[400]}
              />
              <View>
                <Text style={styles.recurringLabel}>Repeat daily</Text>
                <Text style={styles.recurringHint}>
                  This action will appear every day
                </Text>
              </View>
            </View>
            <View style={[styles.toggle, isRecurring && styles.toggleActive]}>
              <View
                style={[
                  styles.toggleThumb,
                  isRecurring && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create button */}
      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        style={[
          styles.bottomButton,
          { paddingBottom: insets.bottom + SPACING.md },
        ]}
      >
        <Button
          title={`Add ${LANGUAGE.powerMoves.singular}`}
          onPress={handleCreate}
          isLoading={isLoading}
          disabled={!title.trim() || !selectedDreamId}
          fullWidth
          size='lg'
          icon={<Ionicons name='flash' size={20} color='#FFF' />}
          iconPosition='left'
        />
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
    color: COLORS.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING.md,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  dreamsGrid: {
    gap: SPACING.sm,
  },
  dreamOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    padding: SPACING.md,
  },
  dreamOptionSelected: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[500],
  },
  dreamOptionText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[700],
    marginRight: SPACING.sm,
  },
  dreamOptionTextSelected: {
    color: COLORS.primary[700],
  },
  difficultyGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  difficultyOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    padding: SPACING.md,
  },
  difficultyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: SPACING.xs,
  },
  difficultyLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.neutral[600],
    marginBottom: SPACING.xs,
  },
  sparksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sparksText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.accent[600],
  },
  recurringOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  recurringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  recurringLabel: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.neutral[900],
  },
  recurringHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[400],
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.neutral[200],
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary[500],
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
  },
})
