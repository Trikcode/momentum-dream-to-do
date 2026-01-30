// app/(tabs)/profile.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/src/store/authStore'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { LANGUAGE } from '@/src/constants/language'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { profile, signOut } = useAuthStore()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
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
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        {/* Ambient Glow */}
        <View
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: 200,
            backgroundColor: DARK.accent.violet,
            opacity: 0.15,
            filter: 'blur(80px)',
          }}
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
        {/* Profile Header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.profileHeader}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {/* Glow Ring */}
            <View style={styles.avatarGlow} />

            <LinearGradient
              colors={DARK.gradients.primary as [string, string]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>

            {/* Level Badge */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                {profile?.current_level || 1}
              </Text>
            </View>
          </View>

          <Text style={styles.userName}>{profile?.full_name || 'Dreamer'}</Text>
          <Text style={styles.userEmail}>{profile?.email}</Text>

          {/* Quick stats */}
          <View style={styles.quickStats}>
            <QuickStat
              value={profile?.current_streak || 0}
              label='Momentum'
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
              label={LANGUAGE.chapter.name}
              icon='book'
              color={DARK.accent.violet}
            />
          </View>
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          {/* Premium Banner */}
          <Pressable style={styles.premiumCard}>
            <LinearGradient
              colors={[DARK.accent.gold, '#B45309']}
              style={styles.premiumGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.premiumContent}>
                <View style={styles.premiumIcon}>
                  <Ionicons name='diamond' size={20} color={DARK.accent.gold} />
                </View>
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                  <Text style={styles.premiumSubtitle}>
                    Unlock unlimited dreams & AI coaching
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

          {/* Account Section */}
          <SettingsSection title='Account'>
            <SettingsRow
              icon='person'
              label='Edit Profile'
              onPress={() => console.log('Edit profile')} // TODO: Create Edit Profile screen
            />
            <SettingsRow
              icon='notifications'
              label='Notifications'
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setNotificationsEnabled(value)
                  }}
                  trackColor={{
                    false: 'rgba(255,255,255,0.1)',
                    true: DARK.accent.rose,
                  }}
                  thumbColor='#FFF'
                />
              }
            />
            <SettingsRow
              icon='time'
              label='Daily Reminder'
              value='9:00 AM'
              onPress={() => console.log('Set reminder')}
            />
          </SettingsSection>

          {/* Support Section */}
          <SettingsSection title='Support'>
            <SettingsRow
              icon='help-circle'
              label='Help Center'
              onPress={() => console.log('Help')}
            />
            <SettingsRow
              icon='chatbubble'
              label='Send Feedback'
              onPress={() => console.log('Feedback')}
            />
            <SettingsRow
              icon='star'
              label='Rate Momentum'
              onPress={() => console.log('Rate')}
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title='About'>
            <SettingsRow
              icon='document-text'
              label='Privacy Policy'
              onPress={() => console.log('Privacy')}
            />
            <SettingsRow
              icon='shield-checkmark'
              label='Terms of Service'
              onPress={() => console.log('Terms')}
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

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function QuickStat({
  value,
  label,
  icon,
  color,
}: {
  value: number
  label: string
  icon: string
  color: string
}) {
  return (
    <View style={styles.quickStat}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={styles.quickStatValue}>{value.toLocaleString()}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  )
}

function SettingsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  )
}

function SettingsRow({ icon, label, value, onPress, rightElement }: any) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsRow,
        pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
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
        <Text style={styles.settingsLabel}>{label}</Text>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: DARK.accent.rose,
    opacity: 0.3,
    filter: 'blur(20px)',
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
    borderColor: 'rgba(239, 68, 68, 0.2)', // Red border
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  signOutText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: '#EF4444',
  },
})
