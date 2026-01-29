// src/components/premium/SuccessModal.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated'
import { Confetti } from '@/src/components/celebrations/Confetti'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
import { useHaptics } from '@/src/hooks/useHaptics'

const { width, height } = Dimensions.get('window')

interface SuccessModalProps {
  onDismiss: () => void
}

export function SuccessModal({ onDismiss }: SuccessModalProps) {
  const { trigger } = useHaptics()
  const diamondScale = useSharedValue(0)
  const raysRotate = useSharedValue(0)

  useEffect(() => {
    trigger('celebration')

    diamondScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.3, { damping: 6 }),
        withSpring(1, { damping: 10 }),
      ),
    )

    raysRotate.value = withDelay(
      500,
      withSpring(360, { damping: 20, stiffness: 30 }),
    )
  }, [])

  const diamondStyle = useAnimatedStyle(() => ({
    transform: [{ scale: diamondScale.value }],
  }))

  const raysStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${raysRotate.value}deg` }],
  }))

  return (
    <View style={styles.container}>
      <BlurView intensity={40} style={StyleSheet.absoluteFill} tint='dark' />

      <Confetti count={100} />

      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        style={styles.modal}
      >
        {/* Diamond icon with rays */}
        <View style={styles.iconContainer}>
          {/* Rotating rays */}
          <Animated.View style={[styles.rays, raysStyle]}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.ray,
                  { transform: [{ rotate: `${i * 45}deg` }] },
                ]}
              >
                <LinearGradient
                  colors={['#FFD700', 'transparent']}
                  style={styles.rayGradient}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                />
              </View>
            ))}
          </Animated.View>

          {/* Diamond */}
          <Animated.View style={[styles.diamond, diamondStyle]}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.diamondGradient}
            >
              <Ionicons name='diamond' size={48} color='#FFF' />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Text */}
        <Animated.View entering={FadeIn.delay(500)}>
          <Text style={styles.title}>Welcome to Premium!</Text>
          <Text style={styles.subtitle}>
            You've unlocked the full Momentum experience
          </Text>
        </Animated.View>

        {/* Features unlocked */}
        <Animated.View
          entering={FadeIn.delay(700)}
          style={styles.featuresContainer}
        >
          <FeatureUnlocked icon='planet' label='Unlimited Dreams' />
          <FeatureUnlocked icon='sparkles' label='AI Coaching' />
          <FeatureUnlocked icon='analytics' label='Advanced Insights' />
        </Animated.View>

        {/* Continue button */}
        <Animated.View entering={FadeIn.delay(1000)}>
          <Pressable onPress={onDismiss}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.continueButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueText}>Start Dreaming Bigger</Text>
              <Ionicons name='arrow-forward' size={20} color='#FFF' />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

function FeatureUnlocked({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureCheck}>
        <Ionicons name='checkmark' size={14} color='#FFF' />
      </View>
      <Ionicons name={icon as any} size={18} color={COLORS.neutral[600]} />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl * 1.5,
    padding: SPACING.xl,
    alignItems: 'center',
    width: width * 0.88,
    maxWidth: 360,
    ...SHADOWS.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  rays: {
    position: 'absolute',
    width: 140,
    height: 140,
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: 70,
    left: 68,
    top: 0,
  },
  rayGradient: {
    flex: 1,
    borderRadius: 2,
  },
  diamond: {
    ...SHADOWS.lg,
  },
  diamondGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.success[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  continueText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFF',
  },
})
