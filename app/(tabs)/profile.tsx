import React, { useState } from 'react'
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
import { useNotificationStore } from '@/src/store/notificationStore'
import { usePremiumStore } from '@/src/store/premiumStore'
import { useTheme } from '@/src/context/ThemeContext'
import {
  FONTS,
  SPACING,
  RADIUS,
  GRADIENTS,
  PALETTE,
} from '@/src/constants/new-theme'

type ThemeOption = 'light' | 'dark' | 'system'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { colors, isDark, preference, setPreference } = useTheme()
  const { profile, signOut, deleteAccount } = useAuthStore()
  const {
    isEnabled,
    isLoading,
    preferences,
    enableNotifications,
    disableNotifications,
    updatePreference,
  } = useNotificationStore()
  const { isPremium } = usePremiumStore()

  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

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

  const handleThemeChange = (option: ThemeOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPreference(option)
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete your account, all dreams, progress, and data. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setIsDeletingAccount(true)
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Warning,
                      )
                      await disableNotifications()
                      await deleteAccount()
                      router.replace('/(auth)/welcome')
                    } catch (error: any) {
                      Alert.alert(
                        'Error',
                        error.message || 'Failed to delete account',
                      )
                    } finally {
                      setIsDeletingAccount(false)
                    }
                  },
                },
              ],
            )
          },
        },
      ],
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Dreamer'

  const themedStyles = createThemedStyles(colors, isDark)

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={
            isDark
              ? [
                  PALETTE.midnight.obsidian,
                  PALETTE.midnight.slate,
                  PALETTE.midnight.obsidian,
                ]
              : [
                  colors.background,
                  colors.backgroundSecondary,
                  colors.background,
                ]
          }
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.glowSpot,
            { backgroundColor: PALETTE.electric.indigo },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatarGlow,
                { backgroundColor: PALETTE.electric.cyan },
              ]}
            />
            <LinearGradient
              colors={GRADIENTS.electric}
              style={[styles.avatar, { borderColor: colors.borderLight }]}
            >
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View
              style={[
                styles.levelBadge,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.background,
                },
              ]}
            >
              <Text
                style={[styles.levelText, { color: PALETTE.electric.emerald }]}
              >
                {profile?.current_level || 1}
              </Text>
            </View>
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>
            {profile?.full_name || 'Dreamer'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {profile?.email}
          </Text>

          <View
            style={[
              styles.quickStats,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <QuickStat
              value={profile?.current_streak || 0}
              label='Streak'
              icon='flame'
              color={PALETTE.status.error}
              textColor={colors.text}
              mutedColor={colors.textTertiary}
            />
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <QuickStat
              value={profile?.total_xp || 0}
              label='XP'
              icon='sparkles'
              color={PALETTE.status.warning}
              textColor={colors.text}
              mutedColor={colors.textTertiary}
            />
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <QuickStat
              value={profile?.current_level || 1}
              label='Level'
              icon='star'
              color={PALETTE.electric.indigo}
              textColor={colors.text}
              mutedColor={colors.textTertiary}
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
                colors={GRADIENTS.electric}
                style={styles.premiumGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.premiumContent}>
                  <View style={styles.premiumIcon}>
                    <Ionicons
                      name='diamond'
                      size={20}
                      color={PALETTE.electric.cyan}
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

          <SettingsSection title='Appearance' colors={colors}>
            <View style={themedStyles.themeSelector}>
              <ThemeOptionButton
                label='Light'
                icon='sunny'
                isSelected={preference === 'light'}
                onPress={() => handleThemeChange('light')}
                colors={colors}
              />
              <ThemeOptionButton
                label='Dark'
                icon='moon'
                isSelected={preference === 'dark'}
                onPress={() => handleThemeChange('dark')}
                colors={colors}
              />
              <ThemeOptionButton
                label='System'
                icon='phone-portrait-outline'
                isSelected={preference === 'system'}
                onPress={() => handleThemeChange('system')}
                colors={colors}
              />
            </View>
          </SettingsSection>

          <SettingsSection title='Notifications' colors={colors}>
            <SettingsRow
              icon='notifications'
              label='Push Notifications'
              sublabel={isEnabled ? 'Enabled' : 'Disabled'}
              colors={colors}
              rightElement={
                isLoading ? (
                  <ActivityIndicator
                    size='small'
                    color={PALETTE.electric.cyan}
                  />
                ) : (
                  <Switch
                    value={isEnabled}
                    onValueChange={handleToggleNotifications}
                    trackColor={{
                      false: isDark
                        ? 'rgba(255,255,255,0.1)'
                        : PALETTE.slate[200],
                      true: PALETTE.electric.cyan,
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
                  colors={colors}
                  rightElement={
                    <Switch
                      value={preferences.daily_reminder}
                      onValueChange={(v) =>
                        updatePreference('daily_reminder', v)
                      }
                      trackColor={{
                        false: isDark
                          ? 'rgba(255,255,255,0.1)'
                          : PALETTE.slate[200],
                        true: PALETTE.electric.cyan,
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
                    colors={colors}
                  />
                )}

                <SettingsRow
                  icon='flame'
                  label='Streak Alerts'
                  colors={colors}
                  rightElement={
                    <Switch
                      value={preferences.streak_alerts}
                      onValueChange={(v) =>
                        updatePreference('streak_alerts', v)
                      }
                      trackColor={{
                        false: isDark
                          ? 'rgba(255,255,255,0.1)'
                          : PALETTE.slate[200],
                        true: PALETTE.electric.cyan,
                      }}
                      thumbColor='#FFF'
                    />
                  }
                />

                <SettingsRow
                  icon='trophy'
                  label='Achievement Alerts'
                  colors={colors}
                  rightElement={
                    <Switch
                      value={preferences.achievement_alerts}
                      onValueChange={(v) =>
                        updatePreference('achievement_alerts', v)
                      }
                      trackColor={{
                        false: isDark
                          ? 'rgba(255,255,255,0.1)'
                          : PALETTE.slate[200],
                        true: PALETTE.electric.cyan,
                      }}
                      thumbColor='#FFF'
                    />
                  }
                />
              </>
            )}
          </SettingsSection>

          <SettingsSection title='Account' colors={colors}>
            <SettingsRow
              icon='person'
              label='Edit Profile'
              onPress={() => router.push('/(modals)/edit-profile')}
              colors={colors}
            />
          </SettingsSection>

          <SettingsSection title='Support' colors={colors}>
            <SettingsRow
              icon='help-circle'
              label='Help Center'
              onPress={() => router.push('/(modals)/help-center')}
              colors={colors}
            />
            <SettingsRow
              icon='chatbubble'
              label='Send Feedback'
              onPress={() => router.push('/(modals)/feedback')}
              colors={colors}
            />
          </SettingsSection>

          <SettingsSection title='About' colors={colors}>
            <SettingsRow
              icon='document-text'
              label='Privacy Policy'
              onPress={() => router.push('/(modals)/privacy')}
              colors={colors}
            />
            <SettingsRow
              icon='information-circle'
              label='Version'
              value='1.0.0'
              colors={colors}
            />
          </SettingsSection>

          <Pressable
            style={[
              styles.signOutButton,
              {
                borderColor: `${PALETTE.status.errorDark}30`,
                backgroundColor: `${PALETTE.status.errorDark}10`,
              },
            ]}
            onPress={handleSignOut}
          >
            <Ionicons
              name='log-out-outline'
              size={20}
              color={PALETTE.status.errorDark}
            />
            <Text
              style={[styles.signOutText, { color: PALETTE.status.errorDark }]}
            >
              Sign Out
            </Text>
          </Pressable>

          <Pressable
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
          >
            {isDeletingAccount ? (
              <ActivityIndicator size='small' color={PALETTE.status.error} />
            ) : (
              <Text style={styles.deleteAccountText}>Delete My Account</Text>
            )}
          </Pressable>
        </Animated.View>

        {showTimePicker && (
          <DateTimePicker
            value={getTimeAsDate(preferences.daily_reminder_time)}
            mode='time'
            is24Hour={false}
            display='spinner'
            onChange={handleTimeChange}
            themeVariant={isDark ? 'dark' : 'light'}
          />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

function QuickStat({
  value,
  label,
  icon,
  color,
  textColor,
  mutedColor,
}: {
  value: number
  label: string
  icon: string
  color: string
  textColor: string
  mutedColor: string
}) {
  return (
    <View style={styles.quickStat}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={[styles.quickStatValue, { color: textColor }]}>
        {value.toLocaleString()}
      </Text>
      <Text style={[styles.quickStatLabel, { color: mutedColor }]}>
        {label}
      </Text>
    </View>
  )
}

function SettingsSection({
  title,
  children,
  colors,
}: {
  title: string
  children: React.ReactNode
  colors: any
}) {
  return (
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionContent,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.borderLight,
          },
        ]}
      >
        {children}
      </View>
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
  colors,
}: {
  icon: string
  label: string
  sublabel?: string
  value?: string
  onPress?: () => void
  rightElement?: React.ReactNode
  colors: any
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsRow,
        { borderBottomColor: colors.borderLight },
        pressed && onPress && { backgroundColor: colors.surfaceMuted },
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
        <View
          style={[
            styles.settingsIcon,
            { backgroundColor: colors.surfaceMuted },
          ]}
        >
          <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
        </View>
        <View>
          <Text style={[styles.settingsLabel, { color: colors.text }]}>
            {label}
          </Text>
          {sublabel && (
            <Text
              style={[styles.settingsSublabel, { color: colors.textTertiary }]}
            >
              {sublabel}
            </Text>
          )}
        </View>
      </View>

      {rightElement || (
        <View style={styles.settingsRowRight}>
          {value && (
            <Text
              style={[styles.settingsValue, { color: colors.textTertiary }]}
            >
              {value}
            </Text>
          )}
          {onPress && (
            <Ionicons
              name='chevron-forward'
              size={16}
              color={colors.textTertiary}
            />
          )}
        </View>
      )}
    </Pressable>
  )
}

function ThemeOptionButton({
  label,
  icon,
  isSelected,
  onPress,
  colors,
}: {
  label: string
  icon: string
  isSelected: boolean
  onPress: () => void
  colors: any
}) {
  return (
    <Pressable
      style={[
        styles.themeOption,
        {
          backgroundColor: isSelected
            ? `${PALETTE.electric.cyan}20`
            : 'transparent',
          borderColor: isSelected ? PALETTE.electric.cyan : colors.borderLight,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={isSelected ? PALETTE.electric.cyan : colors.textSecondary}
      />
      <Text
        style={[
          styles.themeOptionText,
          {
            color: isSelected ? PALETTE.electric.cyan : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const createThemedStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    themeSelector: {
      flexDirection: 'row',
      padding: SPACING.sm,
      gap: SPACING.sm,
    },
  })

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    opacity: 0.12,
  },
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
  },
  avatarGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 55,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  levelText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    marginTop: 4,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    marginHorizontal: SPACING.lg,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginTop: 4,
  },
  quickStatLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  settingsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionContent: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingsLabel: {
    fontFamily: FONTS.medium,
    fontSize: 15,
  },
  settingsSublabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
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
  },
  themeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    gap: SPACING.xs,
  },
  themeOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
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
  },
  signOutText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  deleteAccountButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  deleteAccountText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: PALETTE.status.error,
    textDecorationLine: 'underline',
  },
})
