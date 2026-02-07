// app/(modals)/edit-profile.tsx
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
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Animated, { FadeIn } from 'react-native-reanimated'

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

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  const { profile, refreshProfile } = useAuthStore()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true)

      const fileName = `${profile?.id}-${Date.now()}.jpg`
      const response = await fetch(uri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName)

      setAvatarUrl(publicUrl)
    } catch (error) {
      Alert.alert('Upload failed', 'Could not upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your name.')
      return
    }

    try {
      setIsLoading(true)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id)

      if (error) throw error

      await refreshProfile()
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Could not save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const initials = fullName.trim()
    ? fullName.trim().charAt(0).toUpperCase()
    : '?'

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
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <Pressable
          onPress={handleSave}
          disabled={isLoading}
          style={styles.saveButton}
        >
          {isLoading ? (
            <ActivityIndicator size='small' color={PALETTE.electric.cyan} />
          ) : (
            <Text style={[styles.saveText, { color: PALETTE.electric.cyan }]}>
              Save
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Animated.View entering={FadeIn} style={styles.avatarSection}>
          <Pressable style={styles.avatarContainer}>
            {isUploading ? (
              <View
                style={[
                  styles.avatarLoading,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : colors.surfaceMuted,
                  },
                ]}
              >
                <ActivityIndicator color={PALETTE.electric.cyan} />
              </View>
            ) : avatarUrl ? (
              <Animated.Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <LinearGradient
                colors={GRADIENTS.electric}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
          </Pressable>
        </Animated.View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.05)'
                  : colors.surface,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : colors.border,
                color: colors.text,
              },
            ]}
            value={fullName}
            onChangeText={setFullName}
            placeholder='Enter your name'
            placeholderTextColor={colors.textMuted}
            autoCapitalize='words'
            returnKeyType='done'
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Email
          </Text>
          <View
            style={[
              styles.emailContainer,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.03)'
                  : colors.surfaceMuted,
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
              },
            ]}
          >
            <Text style={[styles.emailText, { color: colors.textTertiary }]}>
              {profile?.email}
            </Text>
            <Ionicons name='lock-closed' size={14} color={colors.textMuted} />
          </View>
        </View>
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
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
  },
  saveButton: {
    padding: SPACING.xs,
  },
  saveText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: FONTS.bold,
    fontSize: 36,
    color: '#FFF',
  },
  form: {
    marginTop: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  input: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  emailContainer: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  emailText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
})
