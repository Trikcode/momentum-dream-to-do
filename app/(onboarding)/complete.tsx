// app/(onboarding)/complete.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInUp,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Confetti } from '@/src/components/celebrations/Confetti'
import { SuccessCheck } from '@/src/components/celebrations/SuccessCheck'
import { Button } from '@/src/components/ui/Button'
import { useAuthStore } from '@/src/store/authStore'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'

export default function CompleteScreen() {
  const insets = useSafeAreaInsets()
  const { profile, refreshProfile, setHasOnboarded } = useAuthStore()

  useEffect(() => {
    // Vibrate on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // Refresh profile to get updated data
    refreshProfile()
    setHasOnboarded(true)
  }, [])

  const handleStart = () => {
    router.replace('/(tabs)')
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Confetti */}
      <Confetti count={60} />

      {/* Content */}
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View
          entering={FadeIn.delay(200).duration(600)}
          style={styles.checkContainer}
        >
          <SuccessCheck size={120} delay={300} />
        </Animated.View>

        {/* Celebration Text */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(600)}
          style={styles.textContainer}
        >
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Welcome to Momentum,{' '}
            {profile?.full_name?.split(' ')[0] || 'Dreamer'}!
          </Text>
          <Text style={styles.description}>
            Your journey to achieving your dreams starts now. We'll help you
            break them down into simple daily actions.
          </Text>
        </Animated.View>

        {/* Stats Preview */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(600)}
          style={styles.statsContainer}
        >
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: COLORS.primary[100] },
              ]}
            >
              <Ionicons name='sparkles' size={20} color={COLORS.primary[500]} />
            </View>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Dream Created</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View
              style={[styles.statIcon, { backgroundColor: COLORS.accent[100] }]}
            >
              <Ionicons name='flame' size={20} color={COLORS.accent[500]} />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: COLORS.secondary[100] },
              ]}
            >
              <Ionicons name='star' size={20} color={COLORS.secondary[500]} />
            </View>
            <Text style={styles.statValue}>50</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Button */}
      <Animated.View
        entering={SlideInUp.delay(1300).duration(600)}
        style={[
          styles.bottomSection,
          { paddingBottom: insets.bottom + SPACING.lg },
        ]}
      >
        <Button
          title="Let's Start Dreaming"
          onPress={handleStart}
          size='lg'
          fullWidth
          icon={<Ionicons name='arrow-forward' size={20} color='#FFF' />}
          iconPosition='right'
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  checkContainer: {
    marginBottom: SPACING.xl,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.primary[500],
    marginBottom: SPACING.md,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.neutral[900],
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.neutral[200],
    marginHorizontal: SPACING.sm,
  },
  bottomSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
})
