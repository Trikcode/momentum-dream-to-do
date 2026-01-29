// app/(modals)/new-dream.tsx
import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Button } from '@/src/components/ui/Button'
import { GlassCard } from '@/src/components/shared/GlassCard'
import { useDreamStore } from '@/src/store/dreamStore'
import { usePremiumStore } from '@/src/store/premiumStore'
import { useToast } from '@/src/components/shared/Toast'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { COLORS, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { format } from 'date-fns'

export default function NewDreamModal() {
  const insets = useSafeAreaInsets()
  const { showToast } = useToast()
  const { createDream, dreams } = useDreamStore()
  const { isPremium, getDreamsLimit, setShowPaywall } = usePremiumStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] =
    useState<DreamCategory | null>(null)
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const inputRef = useRef<TextInput>(null)

  // Check dream limit
  const activeDreams = dreams.filter((d) => d.status === 'active').length
  const dreamsLimit = getDreamsLimit()
  const canCreate = isPremium || activeDreams < dreamsLimit

  const handleCategorySelect = (category: DreamCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedCategory(category)
  }

  const handleCreate = async () => {
    if (!title.trim()) {
      showToast({ type: 'error', title: 'Please enter a dream title' })
      return
    }

    if (!selectedCategory) {
      showToast({ type: 'error', title: 'Please select a category' })
      return
    }

    if (!canCreate) {
      setShowPaywall(true)
      router.push('/(modals)/premium')
      return
    }

    try {
      setIsLoading(true)

      await createDream({
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: selectedCategory.id,
        target_date: targetDate?.toISOString().split('T')[0],
      })

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      showToast({
        type: 'success',
        title: 'Dream created!',
        message: 'Start adding power moves to make it happen',
      })

      router.back()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to create dream',
        message: 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name='close' size={24} color={COLORS.neutral[600]} />
        </Pressable>
        <Text style={styles.headerTitle}>New Dream</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {/* Limit warning for free users */}
        {!isPremium && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <GlassCard style={styles.limitCard}>
              <View style={styles.limitContent}>
                <Ionicons
                  name='information-circle'
                  size={20}
                  color={COLORS.primary[500]}
                />
                <Text style={styles.limitText}>
                  {activeDreams}/{dreamsLimit} dreams used
                </Text>
                <Pressable
                  onPress={() => {
                    setShowPaywall(true)
                    router.push('/(modals)/premium')
                  }}
                >
                  <Text style={styles.upgradeLink}>Upgrade</Text>
                </Pressable>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Title input */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <Text style={styles.label}>What's your dream?</Text>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.titleInput}
              placeholder='e.g., Visit Japan, Run a marathon...'
              placeholderTextColor={COLORS.neutral[400]}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              multiline
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>
        </Animated.View>

        {/* Category selection */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {DREAM_CATEGORIES.map((category) => (
              <Pressable
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
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Description (optional) */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Text style={styles.label}>
            Why is this important to you?{' '}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder='Describe your motivation...'
            placeholderTextColor={COLORS.neutral[400]}
            value={description}
            onChangeText={setDescription}
            maxLength={500}
            multiline
            numberOfLines={4}
            textAlignVertical='top'
          />
        </Animated.View>

        {/* Target date (optional) */}
        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <Text style={styles.label}>
            Target date <Text style={styles.optional}>(optional)</Text>
          </Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Ionicons
              name='calendar-outline'
              size={20}
              color={COLORS.neutral[500]}
            />
            <Text
              style={[styles.dateText, !targetDate && styles.datePlaceholder]}
            >
              {targetDate
                ? format(targetDate, 'MMMM d, yyyy')
                : 'Set a target date'}
            </Text>
            {targetDate && (
              <Pressable onPress={() => setTargetDate(null)}>
                <Ionicons
                  name='close-circle'
                  size={20}
                  color={COLORS.neutral[400]}
                />
              </Pressable>
            )}
          </Pressable>
        </Animated.View>

        {showDatePicker && (
          <DateTimePicker
            value={targetDate || new Date()}
            mode='date'
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowDatePicker(false)
              if (date) setTargetDate(date)
            }}
          />
        )}

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create button */}
      <Animated.View
        entering={FadeInUp.delay(600).duration(500)}
        style={[
          styles.bottomButton,
          { paddingBottom: insets.bottom + SPACING.md },
        ]}
      >
        <Button
          title={canCreate ? 'Create Dream' : 'Upgrade to Create'}
          onPress={handleCreate}
          isLoading={isLoading}
          disabled={!title.trim() || !selectedCategory}
          fullWidth
          size='lg'
          icon={
            <Ionicons
              name={canCreate ? 'sparkles' : 'diamond'}
              size={20}
              color='#FFF'
            />
          }
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
  limitCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary[50],
  },
  limitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  limitText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  upgradeLink: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.primary[500],
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  optional: {
    fontFamily: FONTS.regular,
    color: COLORS.neutral[400],
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING.md,
  },
  titleInput: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: COLORS.neutral[900],
    minHeight: 60,
  },
  charCount: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[400],
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  categoriesScroll: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
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
  descriptionInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[900],
    minHeight: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING.md,
  },
  dateText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.neutral[900],
  },
  datePlaceholder: {
    color: COLORS.neutral[400],
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
