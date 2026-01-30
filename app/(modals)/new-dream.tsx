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
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import Animated, { FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'

import { Button } from '@/src/components/ui/Button'
import { useDreamStore } from '@/src/store/dreamStore'
import { usePremiumStore } from '@/src/store/premiumStore'
import { useToast } from '@/src/components/shared/Toast'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

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
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<TextInput>(null)

  // Logic
  const activeDreams = dreams.filter((d) => d.status === 'active').length
  const dreamsLimit = getDreamsLimit()
  const canCreate = isPremium || activeDreams < dreamsLimit

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
      showToast({ type: 'error', title: 'Failed to create dream' })
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
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name='close' size={20} color={DARK.text.secondary} />
          </Pressable>
          <Text style={styles.headerTitle}>New Dream</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Free Limit Warning */}
          {!isPremium && (
            <Animated.View
              entering={FadeInUp.delay(100)}
              style={styles.limitCard}
            >
              <Ionicons
                name='information-circle'
                size={20}
                color={DARK.accent.rose}
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
            </Animated.View>
          )}

          {/* Title Input */}
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text style={styles.label}>What is your dream?</Text>
            <View
              style={[styles.inputWrapper, isFocused && styles.inputFocused]}
            >
              <BlurView
                intensity={20}
                tint='dark'
                style={StyleSheet.absoluteFill}
              />
              <TextInput
                ref={inputRef}
                style={styles.titleInput}
                placeholder='e.g., Visit Japan, Run a marathon...'
                placeholderTextColor={DARK.text.muted}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                multiline
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>
          </Animated.View>

          {/* Category Selection */}
          <Animated.View entering={FadeInUp.delay(300)}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {DREAM_CATEGORIES.map((category) => {
                const isSelected = selectedCategory?.id === category.id
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setSelectedCategory(category)
                    }}
                    style={[
                      styles.categoryChip,
                      isSelected && {
                        backgroundColor: category.color,
                        borderColor: category.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={category.icon.name as any}
                      size={16}
                      color={isSelected ? '#FFF' : DARK.text.muted}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && { color: '#FFF' },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInUp.delay(400)}>
            <Text style={styles.label}>
              Why is this important?{' '}
              <Text style={styles.optional}>(Optional)</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <BlurView
                intensity={10}
                tint='dark'
                style={StyleSheet.absoluteFill}
              />
              <TextInput
                style={styles.descriptionInput}
                placeholder='Describe your motivation...'
                placeholderTextColor={DARK.text.muted}
                value={description}
                onChangeText={setDescription}
                maxLength={500}
                multiline
                textAlignVertical='top'
              />
            </View>
          </Animated.View>

          {/* Target Date */}
          <Animated.View entering={FadeInUp.delay(500)}>
            <Text style={styles.label}>
              Target Date <Text style={styles.optional}>(Optional)</Text>
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              <Ionicons
                name='calendar-outline'
                size={20}
                color={DARK.text.secondary}
              />
              <Text
                style={[
                  styles.dateText,
                  !targetDate && { color: DARK.text.muted },
                ]}
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
                    color={DARK.text.muted}
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

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Create Button */}
        <Animated.View
          entering={FadeInUp.delay(600)}
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
              title={canCreate ? 'Create Dream' : 'Upgrade to Create'}
              onPress={handleCreate}
              isLoading={isLoading}
              disabled={!title.trim() || !selectedCategory}
              fullWidth
              size='lg'
              icon={
                <Ionicons
                  name={canCreate ? 'sparkles' : 'lock-closed'}
                  size={18}
                  color='#FFF'
                />
              }
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

  // Limit Card
  limitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  limitText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.secondary,
  },
  upgradeLink: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: DARK.accent.rose,
  },

  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.secondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  optional: {
    fontFamily: FONTS.regular,
    color: DARK.text.muted,
    fontSize: 12,
  },

  // Input Styles
  inputWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  inputFocused: {
    borderColor: DARK.accent.rose,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  titleInput: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: DARK.text.primary,
    minHeight: 80,
    padding: SPACING.md,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: DARK.text.primary,
    minHeight: 120,
    padding: SPACING.md,
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: DARK.text.muted,
  },

  // Categories
  categoriesScroll: {
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.secondary,
  },

  // Date
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.md,
  },
  dateText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: DARK.text.primary,
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
