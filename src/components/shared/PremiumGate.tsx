// src/components/shared/PremiumGate.tsx
import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { COLORS, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { usePremiumStore } from '@/src/store/premiumStore'

interface PremiumGateProps {
  children: React.ReactNode
  featureId: string
  featureName: string
  fallback?: React.ReactNode
  blurContent?: boolean
}

export function PremiumGate({
  children,
  featureId,
  featureName,
  fallback,
  blurContent = true,
}: PremiumGateProps) {
  const { isPremium, setShowPaywall } = usePremiumStore()

  if (isPremium) {
    return <>{children}</>
  }

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setShowPaywall(true)
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <View style={styles.container}>
      {/* Blurred content */}
      {blurContent && (
        <View style={styles.contentContainer}>
          {children}
          <BlurView intensity={20} style={styles.blur} tint='light' />
        </View>
      )}

      {/* Lock overlay */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
        <Pressable onPress={handleUpgrade} style={styles.lockContent}>
          <View style={styles.lockIcon}>
            <LinearGradient
              colors={COLORS.gradients.dream as [string, string]}
              style={styles.lockGradient}
            >
              <Ionicons name='lock-closed' size={24} color='#FFF' />
            </LinearGradient>
          </View>

          <Text style={styles.lockTitle}>Premium Feature</Text>
          <Text style={styles.lockMessage}>
            Unlock {featureName} with Premium
          </Text>

          <View style={styles.upgradeButton}>
            <LinearGradient
              colors={COLORS.gradients.primary as [string, string]}
              style={styles.upgradeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name='diamond' size={16} color='#FFF' />
              <Text style={styles.upgradeText}>Upgrade Now</Text>
            </LinearGradient>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  )
}

// Inline premium gate for smaller elements
export function InlinePremiumGate({
  children,
  featureName,
}: {
  children: React.ReactNode
  featureName: string
}) {
  const { isPremium, setShowPaywall } = usePremiumStore()

  const handlePress = () => {
    if (!isPremium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      setShowPaywall(true)
    }
  }

  if (isPremium) {
    return <>{children}</>
  }

  return (
    <Pressable onPress={handlePress} style={styles.inlineContainer}>
      <View style={styles.inlineContent}>
        {children}
        <View style={styles.inlineOverlay}>
          <Ionicons name='lock-closed' size={16} color={COLORS.neutral[400]} />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  contentContainer: {
    opacity: 0.5,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  lockIcon: {
    marginBottom: SPACING.md,
  },
  lockGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  lockMessage: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  upgradeButton: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  upgradeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: '#FFF',
  },
  inlineContainer: {
    position: 'relative',
  },
  inlineContent: {
    opacity: 0.5,
  },
  inlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: RADIUS.md,
  },
})
