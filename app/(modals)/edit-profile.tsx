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
// import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import Animated, { FadeIn } from 'react-native-reanimated'

import { useAuthStore } from '@/src/store/authStore'
import { supabase } from '@/src/lib/supabase'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets()
  const { profile, refreshProfile } = useAuthStore()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // const pickImage = async () => {
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  //   if (status !== 'granted') {
  //     Alert.alert('Permission needed', 'Please allow access to your photos.')
  //     return
  //   }

  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.7,
  //   })

  //   if (!result.canceled && result.assets[0]) {
  //     await uploadImage(result.assets[0].uri)
  //   }
  // }

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
        <Text style={styles.title}>Edit Profile</Text>
        <Pressable
          onPress={handleSave}
          disabled={isLoading}
          style={styles.saveButton}
        >
          {isLoading ? (
            <ActivityIndicator size='small' color={DARK.accent.rose} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Avatar */}
        <Animated.View entering={FadeIn} style={styles.avatarSection}>
          <Pressable
            // onPress={pickImage}
            style={styles.avatarContainer}
          >
            {isUploading ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color={DARK.accent.rose} />
              </View>
            ) : avatarUrl ? (
              <Animated.Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <LinearGradient
                colors={DARK.gradients.primary as [string, string]}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
            {/* <View style={styles.editBadge}>
              <Ionicons name='camera' size={14} color='#FFF' />
            </View> */}
          </Pressable>
          {/* <Text style={styles.changePhotoText}>Tap to change photo</Text> */}
        </Animated.View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder='Enter your name'
            placeholderTextColor={DARK.text.muted}
            autoCapitalize='words'
            returnKeyType='done'
          />

          <Text style={styles.label}>Email</Text>
          <View style={styles.emailContainer}>
            <Text style={styles.emailText}>{profile?.email}</Text>
            <Ionicons name='lock-closed' size={14} color={DARK.text.muted} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: SPACING.xs },
  title: { fontFamily: FONTS.semiBold, fontSize: 17, color: DARK.text.primary },
  saveButton: { padding: SPACING.xs },
  saveText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: DARK.accent.rose,
  },
  content: { flex: 1, paddingHorizontal: SPACING.lg },

  avatarSection: { alignItems: 'center', marginVertical: SPACING.xl },
  avatarContainer: { position: 'relative' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontFamily: FONTS.bold, fontSize: 36, color: '#FFF' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DARK.accent.rose,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: DARK.bg.primary,
  },
  changePhotoText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.tertiary,
    marginTop: SPACING.sm,
  },

  form: { marginTop: SPACING.lg },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: DARK.text.secondary,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: DARK.text.primary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: SPACING.lg,
  },
  emailContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emailText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: DARK.text.tertiary,
  },
})
