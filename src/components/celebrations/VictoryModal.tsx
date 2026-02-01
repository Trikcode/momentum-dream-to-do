import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native'
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
  interpolate,
  ZoomIn,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Confetti } from './Confetti' // Assuming you have this component

const { width, height } = Dimensions.get('window')

// ============================================================================
// LOCAL THEME (Premium Dark Mode)
// ============================================================================
const THEME = {
  colors: {
    gold: ['#F59E0B', '#D97706'],
    purple: ['#A855F7', '#7C3AED'],
    rose: ['#F43F5E', '#E11D48'],
    glass: 'rgba(30, 35, 45, 0.7)',
    border: 'rgba(255,255,255,0.15)',
    text: '#FFFFFF',
    textDim: '#94A3B8',
  },
}

interface Victory {
  id: string
  slug: string
  name: string
  description: string
  iconName: string
  category: string
  sparkReward: number
}

interface VictoryModalProps {
  victory: Victory
  onDismiss: () => void
  showConfetti?: boolean
}

// ============================================================================
// COMPONENT: SUNBURST (God Rays)
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

export function VictoryModal({
  victory,
  onDismiss,
  showConfetti = true,
}: VictoryModalProps) {
  // Animation Values
  const badgeScale = useSharedValue(0)
  const shimmer = useSharedValue(0)
  const glowOpacity = useSharedValue(0)

  useEffect(() => {
    // 1. Trigger Haptics
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // 2. Animate Badge Pop
    badgeScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 100 }),
    )

    // 3. Animate Glow Pulse
    glowOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 }),
        ),
        -1,
        true,
      ),
    )

    // 4. Shimmer Effect
    shimmer.value = withRepeat(
      withSequence(
        withDelay(
          2000,
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        ),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    )
  }, [])

  // Styles
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { scale: interpolate(glowOpacity.value, [0.3, 0.6], [0.9, 1.1]) },
    ],
  }))

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0, 0.3, 0]),
    transform: [
      { translateX: interpolate(shimmer.value, [0, 1], [-100, 100]) },
      { skewX: '-20deg' },
    ],
  }))

  // Determine Colors based on category
  const getGradient = (): readonly [string, string, ...string[]] => {
    switch (victory.category) {
      case 'dreams':
        return THEME.colors.purple as any
      case 'streak':
        return THEME.colors.rose as any
      default:
        return THEME.colors.gold as any // Default to Gold for generic victory
    }
  }

  return (
    <View style={styles.container}>
      {/* 1. Dark Backdrop Blur */}
      <BlurView intensity={40} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.backdropOverlay} />

      {/* 2. Confetti Layer */}
      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents='none'>
          <Confetti count={120} />
        </View>
      )}

      {/* 3. Dismiss Area */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      {/* 4. The Glass Card */}
      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        style={styles.modalCard}
      >
        {/* Glass Effect Inside Card */}
        <View style={styles.cardGlassBg} />

        {/* --- CONTENT --- */}

        {/* Header Label */}
        <Animated.View entering={FadeIn.delay(400)}>
          <View style={styles.labelContainer}>
            <View style={styles.labelLine} />
            <Text style={styles.label}>VICTORY UNLOCKED</Text>
            <View style={styles.labelLine} />
          </View>
        </Animated.View>

        {/* HERO: The Badge */}
        <View style={styles.heroContainer}>
          {/* Rotating Sunburst behind */}
          <Sunburst />

          {/* Pulsing Glow */}
          <Animated.View
            style={[
              styles.glowBehind,
              glowStyle,
              { backgroundColor: getGradient()[0] },
            ]}
          />

          {/* The Icon Bubble */}
          <Animated.View style={[styles.badge, badgeStyle]}>
            <LinearGradient
              colors={getGradient()}
              style={styles.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
              <Ionicons name={victory.iconName as any} size={72} color='#FFF' />
            </LinearGradient>

            {/* Glossy Reflection */}
            <View style={styles.badgeGloss} />
          </Animated.View>
        </View>

        {/* Text Details */}
        <Animated.View
          entering={FadeIn.delay(600).springify()}
          style={styles.textContainer}
        >
          <Text style={styles.victoryName}>{victory.name}</Text>
          <Text style={styles.victoryDesc}>{victory.description}</Text>
        </Animated.View>

        {/* Reward Pill */}
        <Animated.View
          entering={ZoomIn.delay(900)}
          style={styles.rewardContainer}
        >
          <BlurView
            intensity={20}
            tint='light'
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.sparkIcon}>
            <Ionicons name='sparkles' size={16} color={THEME.colors.gold[0]} />
          </View>
          <Text style={styles.rewardText}>
            <Text style={styles.rewardValue}>+{victory.sparkReward}</Text>{' '}
            Sparks Earned
          </Text>
        </Animated.View>

        {/* Main Action Button */}
        <Animated.View entering={FadeIn.delay(1200)} style={{ width: '100%' }}>
          <Pressable onPress={onDismiss}>
            {({ pressed }) => (
              <Animated.View
                style={[styles.button, pressed && styles.buttonPressed]}
              >
                <LinearGradient
                  colors={getGradient()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.buttonText}>Claim Victory</Text>
              </Animated.View>
            )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', // Darken the background further
  },
  // The Main Card
  modalCard: {
    width: width * 0.85,
    maxWidth: 360,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 32,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.glass,
  },
  cardGlassBg: {
    ...StyleSheet.absoluteFillObject,
    // Add noise or subtle texture here if desired
  },
  // Top Label
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  labelLine: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  label: {
    fontFamily: 'Poppins_600SemiBold', // Make sure fonts are loaded
    fontSize: 12,
    color: '#F59E0B',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // Hero Section
  heroContainer: {
    width: 200,
    height: 200,
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
    opacity: 0.15,
  },
  sunRay: {
    position: 'absolute',
    width: 4,
    height: 300,
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  glowBehind: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    filter: 'blur(40px)', // Web/Expo 50+ property, safe to leave
  },
  badge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  badgeGradient: {
    flex: 1,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  badgeGloss: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ scaleX: 0.8 }],
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  // Text
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  victoryName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  victoryDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: THEME.colors.textDim,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Reward Pill
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(245, 158, 11, 0.15)', // Low opacity gold
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 24,
  },
  sparkIcon: {
    marginRight: 8,
  },
  rewardText: {
    fontFamily: 'Poppins_500Medium',
    color: '#FCD34D', // Light Gold
    fontSize: 14,
  },
  rewardValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  // Button
  button: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 0.5,
  },
})
