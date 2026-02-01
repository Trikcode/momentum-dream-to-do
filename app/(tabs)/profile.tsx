import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import DateTimePicker from '@react-native-community/datetimepicker'

import { useAuthStore } from '@/src/store/authStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { useNotificationStore } from '@/src/store/notificationStore'
import { usePremiumStore } from '@/src/store/premiumStore'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { profile, signOut } = useAuthStore()
  const {
    isEnabled,
    isLoading,
    preferences,
    enableNotifications,
    disableNotifications,
    updatePreference,
    sendTestNotification,
  } = useNotificationStore()

  const { isPremium } = usePremiumStore()

  const [showTimePicker, setShowTimePicker] = useState(false)

  const handleToggleNotifications = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (value) {
      const success = await enableNotifications()
      if (!success) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        )
      }
    } else {
      Alert.alert(
        'Disable Notifications?',
        "You won't receive daily reminders or streak alerts.",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: disableNotifications,
          },
        ],
      )
    }
  }
  const handleTestNotification = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await sendTestNotification()
    Alert.alert(
      'Test Sent! 🧪',
      'You should receive a test notification in about 2 seconds.',
    )
  }

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios')
    if (selectedDate && event.type !== 'dismissed') {
      const hours = selectedDate.getHours().toString().padStart(2, '0')
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0')
      const timeString = `${hours}:${minutes}`

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      await updatePreference('daily_reminder_time', timeString)
    }
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const getTimeAsDate = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await disableNotifications()
          await signOut()
          router.replace('/(auth)/welcome')
        },
      },
    ])
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Dreamer'

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowSpot} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlow} />
            <LinearGradient
              colors={DARK.gradients.primary as [string, string]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                {profile?.current_level || 1}
              </Text>
            </View>
          </View>

          <Text style={styles.userName}>{profile?.full_name || 'Dreamer'}</Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>

          <View style={styles.quickStats}>
            <QuickStat
              value={profile?.current_streak || 0}
              label='Streak'
              icon='flame'
              color={DARK.accent.rose}
            />
            <View style={styles.statDivider} />
            <QuickStat
              value={profile?.total_xp || 0}
              label='XP'
              icon='sparkles'
              color={DARK.accent.gold}
            />
            <View style={styles.statDivider} />
            <QuickStat
              value={profile?.current_level || 1}
              label='Level'
              icon='star'
              color={DARK.accent.violet}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          {!isPremium && (
            <Pressable
              style={styles.premiumCard}
              onPress={() => router.push('/(modals)/premium')}
            >
              <LinearGradient
                colors={[DARK.accent.gold, '#B45309']}
                style={styles.premiumGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.premiumContent}>
                  <View style={styles.premiumIcon}>
                    <Ionicons
                      name='diamond'
                      size={20}
                      color={DARK.accent.gold}
                    />
                  </View>
                  <View style={styles.premiumText}>
                    <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                    <Text style={styles.premiumSubtitle}>
                      Unlock unlimited dreams & more
                    </Text>
                  </View>
                  <Ionicons
                    name='chevron-forward'
                    size={20}
                    color='rgba(255,255,255,0.7)'
                  />
                </View>
              </LinearGradient>
            </Pressable>
          )}

          <SettingsSection title='Notifications'>
            <SettingsRow
              icon='notifications'
              label='Push Notifications'
              sublabel={isEnabled ? 'Enabled' : 'Disabled'}
              rightElement={
                isLoading ? (
                  <ActivityIndicator size='small' color={DARK.accent.rose} />
                ) : (
                  <Switch
                    value={isEnabled}
                    onValueChange={handleToggleNotifications}
                    trackColor={{
                      false: 'rgba(255,255,255,0.1)',
                      true: DARK.accent.rose,
                    }}
                    thumbColor='#FFF'
                  />
                )
              }
            />

            {isEnabled && (
              <>
                <SettingsRow
                  icon='sunny'
                  label='Daily Reminder'
                  rightElement={
                    <Switch
                      value={preferences.daily_reminder}
                      onValueChange={(v) =>
                        updatePreference('daily_reminder', v)
                      }
                      trackColor={{
                        false: 'rgba(255,255,255,0.1)',
                        true: DARK.accent.rose,
                      }}
                      thumbColor='#FFF'
                    />
                  }
                />

                {preferences.daily_reminder && (
                  <SettingsRow
                    icon='time'
                    label='Reminder Time'
                    value={formatTime(preferences.daily_reminder_time)}
                    onPress={() => setShowTimePicker(true)}
                  />
                )}

                <SettingsRow
                  icon='flame'
                  label='Streak Alerts'
                  rightElement={
                    <Switch
                      value={preferences.streak_alerts}
                      onValueChange={(v) =>
                        updatePreference('streak_alerts', v)
                      }
                      trackColor={{
                        false: 'rgba(255,255,255,0.1)',
                        true: DARK.accent.rose,
                      }}
                      thumbColor='#FFF'
                    />
                  }
                />

                <SettingsRow
                  icon='trophy'
                  label='Achievement Alerts'
                  rightElement={
                    <Switch
                      value={preferences.achievement_alerts}
                      onValueChange={(v) =>
                        updatePreference('achievement_alerts', v)
                      }
                      trackColor={{
                        false: 'rgba(255,255,255,0.1)',
                        true: DARK.accent.rose,
                      }}
                      thumbColor='#FFF'
                    />
                  }
                />
              </>
            )}
          </SettingsSection>

          <SettingsSection title='Account'>
            <SettingsRow
              icon='person'
              label='Edit Profile'
              onPress={() => router.push('/(modals)/edit-profile')}
            />
          </SettingsSection>

          {/* Support Section */}
          <SettingsSection title='Support'>
            <SettingsRow
              icon='help-circle'
              label='Help Center'
              onPress={() => router.push('/(modals)/help-center')}
            />
            <SettingsRow
              icon='chatbubble'
              label='Send Feedback'
              onPress={() => router.push('/(modals)/feedback')}
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title='About'>
            <SettingsRow
              icon='document-text'
              label='Privacy Policy'
              onPress={() => router.push('/(modals)/privacy')}
            />
            <SettingsRow
              icon='information-circle'
              label='Version'
              value='1.0.0'
            />
          </SettingsSection>
          {/* Sign Out */}
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name='log-out-outline' size={20} color='#EF4444' />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={getTimeAsDate(preferences.daily_reminder_time)}
            mode='time'
            is24Hour={false}
            display='spinner'
            onChange={handleTimeChange}
            themeVariant='dark'
          />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

// Helper Components
function QuickStat({ value, label, icon, color }: any) {
  return (
    <View style={styles.quickStat}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.quickStatValue}>{value.toLocaleString()}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  )
}

function SettingsSection({ title, children }: any) {
  return (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  )
}

function SettingsRow({
  icon,
  label,
  sublabel,
  value,
  onPress,
  rightElement,
}: any) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsRow,
        pressed && onPress && { backgroundColor: 'rgba(255,255,255,0.05)' },
      ]}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onPress()
        }
      }}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingsRowLeft}>
        <View style={styles.settingsIcon}>
          <Ionicons name={icon} size={18} color={DARK.text.secondary} />
        </View>
        <View>
          <Text style={styles.settingsLabel}>{label}</Text>
          {sublabel && <Text style={styles.settingsSublabel}>{sublabel}</Text>}
        </View>
      </View>

      {rightElement || (
        <View style={styles.settingsRowRight}>
          {value && <Text style={styles.settingsValue}>{value}</Text>}
          {onPress && (
            <Ionicons
              name='chevron-forward'
              size={16}
              color={DARK.text.tertiary}
            />
          )}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['4xl'],
  },
  glowSpot: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: DARK.accent.violet,
    opacity: 0.12,
  },

  // Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 55,
    backgroundColor: DARK.accent.rose,
    opacity: 0.2,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 40,
    color: '#FFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: DARK.bg.secondary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: DARK.bg.primary,
  },
  levelText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: DARK.accent.gold,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: DARK.text.primary,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: DARK.text.secondary,
    marginTop: 4,
  },

  // Stats
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.lg,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: DARK.text.primary,
    marginTop: 4,
  },
  quickStatLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: DARK.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Settings
  settingsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: DARK.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingsLabel: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: DARK.text.primary,
  },
  settingsSublabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: DARK.text.tertiary,
    marginTop: 2,
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  settingsValue: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: DARK.text.tertiary,
  },

  // Test button
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  testButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.accent.violet,
  },

  // Debug
  debugSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  debugTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: DARK.accent.violet,
    marginBottom: 4,
  },
  debugText: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: DARK.text.tertiary,
  },

  // Premium
  premiumCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  premiumGradient: {
    padding: SPACING.md,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFF',
  },
  premiumSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Sign Out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  signOutText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: '#EF4444',
  },
})
