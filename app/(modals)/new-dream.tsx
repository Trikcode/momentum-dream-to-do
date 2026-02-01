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
  Dimensions,
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
  const [activeInput, setActiveInput] = useState<string | null>(null)

  const activeDreams = dreams.filter((d) => d.status === 'active').length
  const dreamsLimit = getDreamsLimit()
  const canCreate = isPremium || activeDreams < dreamsLimit

  const handleCreate = async () => {
    if (!title.trim()) {
      showToast({ type: 'error', title: 'Please name your dream' })
      return
    }
    if (!selectedCategory) {
      showToast({ type: 'error', title: 'Select a category' })
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
        title: 'Mission Initialized',
        message: 'Let’s make it happen.',
      })
      router.back()
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to create dream' })
    } finally {
      setIsLoading(false)
    }
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (selectedDate) setTargetDate(selectedDate)
  }

  return (
    <View style={styles.container}>
      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={['#0F1115', '#161B22', '#0F1115']}
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
          <Text style={styles.headerTitle}>New Mission</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 140 },
          ]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Limit Warning */}
          {!isPremium && (
            <Animated.View
              entering={FadeInUp.delay(100)}
              style={styles.limitCard}
            >
              <View style={styles.limitIcon}>
                <Ionicons name='flash' size={14} color={DARK.accent.rose} />
              </View>
              <Text style={styles.limitText}>
                {activeDreams}/{dreamsLimit} active missions used
              </Text>
              <Pressable
                onPress={() => {
                  setShowPaywall(true)
                  router.push('/(modals)/premium')
                }}
                style={styles.upgradeBtn}
              >
                <Text style={styles.upgradeLink}>Unlock</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* 1. TITLE INPUT */}
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text style={styles.label}>Name your mission</Text>
            <View
              style={[
                styles.inputWrapper,
                activeInput === 'title' && styles.inputFocused,
              ]}
            >
              <BlurView
                intensity={20}
                tint='dark'
                style={StyleSheet.absoluteFill}
              />
              <TextInput
                style={styles.titleInput}
                placeholder='e.g., Run a Marathon, Build a App...'
                placeholderTextColor={DARK.text.muted}
                value={title}
                onChangeText={setTitle}
                maxLength={60}
                multiline
                onFocus={() => setActiveInput('title')}
                onBlur={() => setActiveInput(null)}
              />
              <Text style={styles.charCount}>{title.length}/60</Text>
            </View>
          </Animated.View>

          {/* 2. CATEGORIES */}
          <Animated.View entering={FadeInUp.delay(300)}>
            <Text style={styles.label}>Select Category</Text>
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
                        transform: [{ scale: 1.05 }],
                      },
                    ]}
                  >
                    <Ionicons
                      name={category.icon.name as any}
                      size={14}
                      color={isSelected ? '#FFF' : category.color}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && { color: '#FFF', fontFamily: FONTS.bold },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </Animated.View>

          {/* 3. DESCRIPTION */}
          <Animated.View entering={FadeInUp.delay(400)}>
            <Text style={styles.label}>
              Your "Why" <Text style={styles.optional}>(Optional)</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                activeInput === 'desc' && styles.inputFocused,
              ]}
            >
              <BlurView
                intensity={10}
                tint='dark'
                style={StyleSheet.absoluteFill}
              />
              <TextInput
                style={styles.descriptionInput}
                placeholder='Why does this matter to you?'
                placeholderTextColor={DARK.text.muted}
                value={description}
                onChangeText={setDescription}
                maxLength={300}
                multiline
                textAlignVertical='top'
                onFocus={() => setActiveInput('desc')}
                onBlur={() => setActiveInput(null)}
              />
            </View>
          </Animated.View>

          {/* 4. DATE PICKER */}
          <Animated.View entering={FadeInUp.delay(500)}>
            <Text style={styles.label}>
              Deadline <Text style={styles.optional}>(Optional)</Text>
            </Text>

            <Pressable
              onPress={() => setShowDatePicker(!showDatePicker)}
              style={[
                styles.dateButton,
                showDatePicker && { borderColor: DARK.accent.rose },
              ]}
            >
              <View style={styles.dateIconBox}>
                <Ionicons
                  name='calendar-outline'
                  size={20}
                  color={targetDate ? DARK.accent.rose : DARK.text.secondary}
                />
              </View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Target Completion</Text>
                <Text
                  style={[
                    styles.dateValue,
                    !targetDate && { color: DARK.text.muted },
                  ]}
                >
                  {targetDate
                    ? format(targetDate, 'MMM d, yyyy')
                    : 'No deadline set'}
                </Text>
              </View>
              {targetDate ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation()
                    setTargetDate(null)
                  }}
                >
                  <Ionicons
                    name='close-circle'
                    size={20}
                    color={DARK.text.muted}
                  />
                </Pressable>
              ) : (
                <Ionicons
                  name='chevron-down'
                  size={16}
                  color={DARK.text.muted}
                />
              )}
            </Pressable>

            {/* iOS Picker / Android Logic */}
            {showDatePicker && Platform.OS === 'ios' && (
              <Animated.View
                entering={FadeInUp}
                style={styles.datePickerContainer}
              >
                <DateTimePicker
                  value={targetDate || new Date()}
                  mode='date'
                  display='inline'
                  themeVariant='dark'
                  accentColor={DARK.accent.rose}
                  minimumDate={new Date()}
                  onChange={onDateChange}
                  style={styles.datePicker}
                />
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>

        {/* BOTTOM DOCK */}
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
              title={canCreate ? 'Initialize Mission' : 'Upgrade to Create'}
              onPress={handleCreate}
              isLoading={isLoading}
              disabled={!title.trim() || !selectedCategory}
              fullWidth
              size='lg'
              variant={canCreate ? 'primary' : 'secondary'}
              icon={
                <Ionicons
                  name={canCreate ? 'rocket' : 'lock-closed'}
                  size={18}
                  color='#FFF'
                />
              }
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
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  // Limit Card
  limitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    padding: 12,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    gap: 10,
  },
  limitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: DARK.text.secondary,
  },
  upgradeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: DARK.accent.rose,
    borderRadius: RADIUS.full,
  },
  upgradeLink: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#FFF',
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
  optional: {
    fontFamily: FONTS.regular,
    color: DARK.text.muted,
    fontSize: 11,
    textTransform: 'none',
  },

  // Inputs
  inputWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  inputFocused: {
    borderColor: DARK.accent.rose,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  titleInput: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: '#FFF',
    minHeight: 70,
    padding: SPACING.md,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#FFF',
    minHeight: 100,
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

  // Category Chips
  categoriesScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.03)',
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
    padding: SPACING.md,
    gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInfo: { flex: 1 },
  dateLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: DARK.text.muted,
  },
  dateValue: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#FFF',
    marginTop: 2,
  },
  datePickerContainer: {
    paddingTop: SPACING.md,
  },
  datePicker: {
    height: 320,
  },

  // Dock
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
})
