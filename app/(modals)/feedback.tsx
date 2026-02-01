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
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug Report', icon: 'bug-outline', color: '#EF4444' },
  {
    id: 'feature',
    label: 'Feature Request',
    icon: 'bulb-outline',
    color: '#F59E0B',
  },
  {
    id: 'general',
    label: 'General',
    icon: 'chatbubble-outline',
    color: '#8B5CF6',
  },
] as const

type FeedbackType = (typeof FEEDBACK_TYPES)[number]['id']

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets()
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

  const selectedType = FEEDBACK_TYPES.find((t) => t.id === type)!

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={DARK.gradients.bg as [string, string, string]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='close' size={24} color={DARK.text.secondary} />
        </Pressable>
        <Text style={styles.title}>Send Feedback</Text>
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
          {/* Type Selection */}
          <Text style={styles.label}>What's this about?</Text>
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
                    isActive && {
                      borderColor: item.color,
                      backgroundColor: `${item.color}15`,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.typeIconContainer,
                      {
                        backgroundColor: isActive
                          ? `${item.color}20`
                          : 'rgba(255,255,255,0.05)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={isActive ? item.color : DARK.text.secondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.typeLabel,
                      isActive && { color: item.color },
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

          {/* Message */}
          <Text style={styles.label}>Your message</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={message}
              onChangeText={setMessage}
              placeholder={
                type === 'bug'
                  ? 'Describe what happened and how to reproduce it...'
                  : type === 'feature'
                    ? "Describe the feature you'd like to see..."
                    : "Tell us what's on your mind..."
              }
              placeholderTextColor={DARK.text.muted}
              multiline
              textAlignVertical='top'
              maxLength={1000}
            />
            <Text style={styles.charCount}>{message.length}/1000</Text>
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading || !message.trim()}
            style={[
              styles.submitButton,
              !message.trim() && styles.submitButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={
                message.trim()
                  ? (DARK.gradients.primary as [string, string])
                  : ['#333', '#444']
              }
              style={styles.submitGradient}
            >
              {isLoading ? (
                <ActivityIndicator color='#FFF' />
              ) : (
                <>
                  <Ionicons name='send' size={18} color='#FFF' />
                  <Text style={styles.submitText}>Send Feedback</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={styles.emailNote}>
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
    backgroundColor: DARK.bg.primary,
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
    color: DARK.text.primary,
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
    color: DARK.text.secondary,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },

  // Type selection - vertical layout
  typeContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
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
    color: DARK.text.secondary,
  },
  checkmark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text area
  textAreaContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  textArea: {
    padding: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: DARK.text.primary,
    minHeight: 150,
    maxHeight: 250,
  },
  charCount: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: DARK.text.muted,
    textAlign: 'right',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },

  // Submit
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
    color: '#FFF',
  },

  emailNote: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: DARK.text.muted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
})
