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
import { MomentumFlame } from '@/src/components/celebrations/MomentumFlame'
import { GlassCard } from '@/src/components/shared/GlassCard'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles.profileHeader}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={COLORS.gradients.dream as [string, string]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>

            {/* Momentum badge */}
            <View style={styles.momentumBadge}>
              <MomentumFlame
                days={profile?.current_streak || 0}
                size='sm'
                showLabel={false}
              />
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
            />
            <View style={styles.statDivider} />
            <QuickStat
              value={profile?.total_xp || 0}
              label={LANGUAGE.spark.name}
              icon='sparkles'
            />
            <View style={styles.statDivider} />
            <QuickStat
              value={profile?.current_level || 1}
              label={LANGUAGE.chapter.name}
              icon='book'
            />
          </View>
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          {/* Account Section */}
          <SettingsSection title='Account'>
            <SettingsRow
              icon='person'
              label='Edit Profile'
              onPress={() => console.log('Edit profile')}
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
                    false: COLORS.neutral[200],
                    true: COLORS.primary[400],
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

          {/* Premium Section */}
          <SettingsSection title='Premium'>
            <Pressable style={styles.premiumCard}>
              <LinearGradient
                colors={COLORS.gradients.dream as [string, string]}
                style={styles.premiumGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.premiumContent}>
                  <View style={styles.premiumIcon}>
                    <Ionicons name='diamond' size={24} color='#FFF' />
                  </View>
                  <View style={styles.premiumText}>
                    <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                    <Text style={styles.premiumSubtitle}>
                      Unlock unlimited dreams, AI coaching & more
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
            <Ionicons name='log-out-outline' size={20} color={COLORS.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

function QuickStat({
  value,
  label,
  icon,
}: {
  value: number
  label: string
  icon: string
}) {
  return (
    <View style={styles.quickStat}>
      <Ionicons name={icon as any} size={16} color={COLORS.primary[500]} />
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

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
}: {
  icon: string
  label: string
  value?: string
  onPress?: () => void
  rightElement?: React.ReactNode
}) {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }
  }

  return (
    <Pressable
      style={styles.settingsRow}
      onPress={handlePress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingsRowLeft}>
        <View style={styles.settingsIcon}>
          <Ionicons name={icon as any} size={20} color={COLORS.neutral[600]} />
        </View>
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>

      {rightElement || (
        <View style={styles.settingsRowRight}>
          {value && <Text style={styles.settingsValue}>{value}</Text>}
          {onPress && (
            <Ionicons
              name='chevron-forward'
              size={18}
              color={COLORS.neutral[300]}
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
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
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
    ...SHADOWS.lg,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 40,
    color: '#FFF',
  },
  momentumBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.neutral[900],
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.neutral[900],
    marginTop: 4,
  },
  quickStatLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.neutral[500],
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.neutral[200],
  },
  settingsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingsLabel: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.neutral[900],
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  settingsValue: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.neutral[400],
  },
  premiumCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  premiumGradient: {
    padding: SPACING.md,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFF',
  },
  premiumSubtitle: {
    fontFamily: FONTS.regular,
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
    backgroundColor: COLORS.error + '10',
    borderRadius: RADIUS.lg,
  },
  signOutText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.error,
  },
})
