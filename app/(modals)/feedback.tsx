// app/(modals)/feedback.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import * as Device from 'expo-device'
import Constants from 'expo-constants'

import { useAuthStore } from '@/src/store/authStore'
import { supabase } from '@/src/lib/supabase'
import { useTheme } from '@/src/context/ThemeContext'
import {
  FONTS,
  SPACING,
  RADIUS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'

const FEEDBACK_TYPES = [
  {
    id: 'bug',
    label: 'Bug Report',
    icon: 'bug-outline',
    color: PALETTE.status.error,
  },
  {
    id: 'feature',
    label: 'Feature Request',
    icon: 'bulb-outline',
    color: PALETTE.status.warning,
  },
  {
    id: 'general',
    label: 'General',
    icon: 'chatbubble-outline',
    color: PALETTE.electric.indigo,
  },
] as const

type FeedbackType = (typeof FEEDBACK_TYPES)[number]['id']

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  const { profile } = useAuthStore()

  const [type, setType] = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getDeviceInfo = () => {
    return `${Device.modelName || 'Unknown'} | ${Platform.OS} ${Platform.Version}`
  }

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Message required', 'Please enter your feedback.')
      return
    }

    if (message.trim().length < 10) {
      Alert.alert('Too short', 'Please provide more details.')
      return
    }

    try {
      setIsLoading(true)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      const { error } = await supabase.from('feedback').insert({
        user_id: profile?.id || null,
        email: profile?.email || 'anonymous',
        type,
        message: message.trim(),
        app_version: Constants.expoConfig?.version || '1.0.0',
        device_info: getDeviceInfo(),
      })

      if (error) throw error

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      Alert.alert(
        'Thank you! 💜',
        "Your feedback helps us make Momentum better. We'll get back to you soon!",
        [{ text: 'OK', onPress: () => router.back() }],
      )
    } catch (error) {
      console.error('Feedback error:', error)
      Alert.alert('Error', 'Could not send feedback. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? [
                PALETTE.midnight.obsidian,
                PALETTE.midnight.slate,
                PALETTE.midnight.obsidian,
              ]
            : [colors.background, colors.backgroundSecondary, colors.background]
        }
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='close' size={24} color={colors.textSecondary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          Send Feedback
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            What's this about?
          </Text>
          <View style={styles.typeContainer}>
            {FEEDBACK_TYPES.map((item) => {
              const isActive = type === item.id
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setType(item.id)
                  }}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.03)'
                        : colors.surface,
                      borderColor: isActive
                        ? item.color
                        : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : colors.border,
                    },
                    isActive && { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <View
                    style={[
                      styles.typeIconContainer,
                      {
                        backgroundColor: isActive
                          ? `${item.color}20`
                          : isDark
                            ? 'rgba(255,255,255,0.05)'
                            : colors.surfaceMuted,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={isActive ? item.color : colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: isActive ? item.color : colors.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isActive && (
                    <View
                      style={[
                        styles.checkmark,
                        { backgroundColor: item.color },
                      ]}
                    >
                      <Ionicons name='checkmark' size={10} color='#FFF' />
                    </View>
                  )}
                </Pressable>
              )
            })}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Your message
          </Text>
          <View
            style={[
              styles.textAreaContainer,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.05)'
                  : colors.surface,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              value={message}
              onChangeText={setMessage}
              placeholder={
                type === 'bug'
                  ? 'Describe what happened and how to reproduce it...'
                  : type === 'feature'
                    ? "Describe the feature you'd like to see..."
                    : "Tell us what's on your mind..."
              }
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical='top'
              maxLength={1000}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>
              {message.length}/1000
            </Text>
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={isLoading || !message.trim()}
            style={[
              styles.submitButton,
              !message.trim() && styles.submitButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={message.trim() ? GRADIENTS.electric : ['#333', '#444']}
              style={styles.submitGradient}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={isDark ? PALETTE.midnight.obsidian : '#FFF'}
                />
              ) : (
                <>
                  <Ionicons
                    name='send'
                    size={18}
                    color={isDark ? PALETTE.midnight.obsidian : '#FFF'}
                  />
                  <Text
                    style={[
                      styles.submitText,
                      { color: isDark ? PALETTE.midnight.obsidian : '#FFF' },
                    ]}
                  >
                    Send Feedback
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={[styles.emailNote, { color: colors.textMuted }]}>
            We'll respond to {profile?.email || 'you'} if needed
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
    marginLeft: -SPACING.xs,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  typeContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  typeLabel: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  checkmark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textAreaContainer: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  textArea: {
    padding: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 16,
    minHeight: 150,
    maxHeight: 250,
  },
  charCount: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    textAlign: 'right',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  submitButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
  },
  submitText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  emailNote: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
})
