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
  withTiming,
  withRepeat,
  Easing,
  FadeIn,
  SlideInDown,
  ZoomIn,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Confetti } from '@/src/components/celebrations/Confetti'

const { width } = Dimensions.get('window')

// ============================================================================
// THEME (Premium Gold Edition)
// ============================================================================
const THEME = {
  colors: {
    gold: ['#F59E0B', '#D97706'] as const,
    glass: 'rgba(30, 35, 45, 0.9)',
    glassLight: 'rgba(255,255,255,0.05)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#FFFFFF',
    textDim: '#94A3B8',
  },
}

interface SuccessModalProps {
  onDismiss: () => void
  isTrial?: boolean
}

// ============================================================================
// COMPONENT: ROTATING SUNBURST
// ============================================================================
const Sunburst = () => {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View style={[styles.sunburstContainer, animatedStyle]}>
      {[...Array(12)].map((_, i) => (
        <View
          key={i}
          style={[styles.sunRay, { transform: [{ rotate: `${i * 30}deg` }] }]}
        />
      ))}
    </Animated.View>
  )
}

export function SuccessModal({
  onDismiss,
  isTrial = false,
}: SuccessModalProps) {
  // Animation Values
  const iconScale = useSharedValue(0)
  const glowOpacity = useSharedValue(0)

  useEffect(() => {
    // 1. Haptics
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // 2. Icon Pop
    iconScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 100 }),
    )

    // 3. Glow Pulse
    glowOpacity.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 }),
          withTiming(0.4, { duration: 1500 }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1 + glowOpacity.value * 0.1 }],
  }))

  const content = {
    label: isTrial ? 'TRIAL STARTED' : 'UNLIMITED ACCESS',
    title: isTrial ? 'Your Trial Has Begun!' : 'You are Premium!',
    subtitle: isTrial
      ? 'Explore all premium features free. Your journey to greatness starts now.'
      : 'Your full potential is now unlocked. Go build your empire.',
    buttonText: isTrial ? 'Start Exploring' : "Let's Go",
  }

  return (
    <View style={styles.container}>
      {/* 1. Backdrop */}
      <BlurView intensity={60} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.backdropDim} />

      <Confetti count={150} />

      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      {/* 2. Glass Card */}
      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        style={styles.modal}
      >
        {/* Border Glow */}
        <View style={styles.borderGlow} />

        {/* --- Header Label --- */}
        <Animated.View entering={FadeIn.delay(300)}>
          <View style={styles.labelContainer}>
            <View style={styles.labelLine} />
            <Text style={styles.label}>{content.label}</Text>
            <View style={styles.labelLine} />
          </View>
        </Animated.View>

        {/* --- Hero Section --- */}
        <View style={styles.heroContainer}>
          {/* Rotating Rays */}
          <Sunburst />

          {/* Back Glow */}
          <Animated.View style={[styles.glowBehind, glowStyle]} />

          {/* Diamond Icon */}
          <Animated.View style={[styles.iconWrapper, iconStyle]}>
            <LinearGradient
              colors={THEME.colors.gold}
              style={styles.iconGradient}
            >
              <View style={styles.iconGloss} />
              <Ionicons name='diamond' size={48} color='#FFF' />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* --- Text Content --- */}
        <Animated.View
          entering={FadeIn.delay(500)}
          style={styles.textContainer}
        >
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.subtitle}</Text>
        </Animated.View>

        {/* --- Features List --- */}
        <View style={styles.featuresContainer}>
          <FeatureRow delay={700} icon='infinite' label='Unlimited Dreams' />
          <FeatureRow
            delay={800}
            icon='sparkles'
            label='Unlimited AI Coaching'
          />
          <FeatureRow delay={900} icon='analytics' label='Advanced Insights' />
        </View>

        {/* --- Button --- */}
        <Animated.View entering={ZoomIn.delay(1100)} style={{ width: '100%' }}>
          <Pressable onPress={onDismiss}>
            {({ pressed }) => (
              <Animated.View
                style={[styles.button, pressed && styles.buttonPressed]}
              >
                <LinearGradient
                  colors={THEME.colors.gold}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.buttonText}>{content.buttonText}</Text>
                <Ionicons name='arrow-forward' size={20} color='#FFF' />
              </Animated.View>
            )}
          </Pressable>
        </Animated.View>

        {/* Trial reminder */}
        {isTrial && (
          <Animated.Text
            entering={FadeIn.delay(1200)}
            style={styles.trialReminder}
          >
            You'll be reminded before your trial ends
          </Animated.Text>
        )}
      </Animated.View>
    </View>
  )
}

function FeatureRow({
  icon,
  label,
  delay,
}: {
  icon: string
  label: string
  delay: number
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(400)}
      style={styles.featureRow}
    >
      <View style={styles.checkCircle}>
        <Ionicons name='checkmark' size={12} color='#FFF' />
      </View>
      <Ionicons
        name={icon as any}
        size={16}
        color={THEME.colors.gold[1]}
        style={{ marginRight: 8 }}
      />
      <Text style={styles.featureText}>{label}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: THEME.colors.glass,
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
    width: width * 0.88,
    maxWidth: 380,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 40,
    opacity: 0.5,
  },

  // Header Label
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  labelLine: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#FCD34D',
    letterSpacing: 2,
  },

  // Hero
  heroContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  sunburstContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.1,
  },
  sunRay: {
    position: 'absolute',
    width: 4,
    height: 300,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  glowBehind: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F59E0B',
  },
  iconWrapper: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  iconGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },

  // Text
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: THEME.colors.textDim,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Features
  featuresContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.glassLight,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#FFF',
  },

  // Button
  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFF',
  },

  trialReminder: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: THEME.colors.textDim,
    marginTop: 16,
    textAlign: 'center',
  },
})
