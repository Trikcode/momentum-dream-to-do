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
  interpolate,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Confetti } from './Confetti' // Assuming you have this

const { width } = Dimensions.get('window')

// ============================================================================
// THEME (Consistent with System)
// ============================================================================
const THEME = {
  colors: {
    primary: ['#A855F7', '#7C3AED'], // Violet Gradient
    accent: '#F472B6', // Pinkish accent
    glass: 'rgba(30, 35, 45, 0.8)',
    glassLight: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.15)',
    text: '#FFFFFF',
    textDim: '#94A3B8',
    success: '#10B981',
  },
}

interface LevelUpData {
  previousChapter: number
  newChapter: number
  unlockedFeatures?: string[]
}

interface LevelUpModalProps {
  data: LevelUpData
  onDismiss: () => void
}

// ============================================================================
// COMPONENT: ROTATING RINGS (Sacred Geometry)
// ============================================================================
const RotatingRings = () => {
  const rotate1 = useSharedValue(0)
  const rotate2 = useSharedValue(0)

  useEffect(() => {
    rotate1.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    )
    rotate2.value = withRepeat(
      withTiming(-360, { duration: 15000, easing: Easing.linear }),
      -1,
      false,
    )
  }, [])

  const style1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate1.value}deg` }],
  }))
  const style2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate2.value}deg` }],
  }))

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents='none'>
      <Animated.View style={[styles.ring, styles.ring1, style1]} />
      <Animated.View style={[styles.ring, styles.ring2, style2]} />
    </View>
  )
}

export function LevelUpModal({ data, onDismiss }: LevelUpModalProps) {
  // Animation Values
  const containerScale = useSharedValue(0.8)
  const oldNumY = useSharedValue(0)
  const oldNumOp = useSharedValue(1)
  const newNumY = useSharedValue(40) // Start below
  const newNumOp = useSharedValue(0)
  const glowIntensity = useSharedValue(0)

  useEffect(() => {
    // 1. Haptics
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // 2. Main Card Entrance
    containerScale.value = withSpring(1)

    // 3. Number Swap Animation sequence
    setTimeout(() => {
      // Old leaves up
      oldNumY.value = withTiming(-40, { duration: 400, easing: Easing.back(2) })
      oldNumOp.value = withTiming(0, { duration: 300 })

      // New enters from below
      newNumY.value = withDelay(
        100,
        withSpring(0, { damping: 12, stiffness: 100 }),
      )
      newNumOp.value = withDelay(100, withTiming(1, { duration: 400 }))

      // Impact Haptic
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      }, 300)

      // Glow Pulse on impact
      glowIntensity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0.4, { duration: 1000 }),
      )
    }, 800)
  }, [])

  // Styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }))

  const oldStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: oldNumY.value }],
    opacity: oldNumOp.value,
  }))

  const newStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: newNumY.value }],
    opacity: newNumOp.value,
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
    transform: [{ scale: 1 + glowIntensity.value * 0.2 }],
  }))

  return (
    <View style={styles.container}>
      {/* 1. Backdrop */}
      <BlurView intensity={50} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.dimmer} />
      <Confetti count={150} />

      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      {/* 2. Main Card */}
      <Animated.View style={[styles.card, containerStyle]}>
        {/* Glass Background */}
        <View style={styles.cardBg} />

        {/* --- Header --- */}
        <Animated.View entering={FadeIn.delay(300)}>
          <Text style={styles.overline}>MOMENTUM UPGRADE</Text>
        </Animated.View>

        {/* --- Hero: Level Circle --- */}
        <View style={styles.heroSection}>
          <RotatingRings />

          {/* Back Glow */}
          <Animated.View style={[styles.backGlow, glowStyle]} />

          <View style={styles.circleContainer}>
            <LinearGradient
              colors={THEME.colors.primary as [string, string]}
              style={styles.gradientCircle}
            >
              <View style={styles.innerCircleBorder} />

              {/* Number Container for masking */}
              <View style={styles.numberMask}>
                <Animated.Text style={[styles.levelNum, oldStyle]}>
                  {data.previousChapter}
                </Animated.Text>
                <Animated.Text
                  style={[styles.levelNum, styles.newLevelNum, newStyle]}
                >
                  {data.newChapter}
                </Animated.Text>
              </View>

              <Text style={styles.chapterLabel}>CHAPTER</Text>
            </LinearGradient>
          </View>
        </View>

        {/* --- Text --- */}
        <Animated.View entering={FadeIn.delay(1200)} style={styles.textSection}>
          <Text style={styles.title}>Story Unlocked</Text>
          <Text style={styles.description}>
            You've reached the next stage of your journey.
          </Text>
        </Animated.View>

        {/* --- Features List --- */}
        {data.unlockedFeatures && data.unlockedFeatures.length > 0 && (
          <View style={styles.featureList}>
            {data.unlockedFeatures.map((feature, i) => (
              <Animated.View
                key={i}
                entering={SlideInDown.delay(1400 + i * 200).springify()}
                style={styles.featureRow}
              >
                <View style={styles.checkCircle}>
                  <Ionicons name='checkmark' size={12} color='#FFF' />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </Animated.View>
            ))}
          </View>
        )}

        {/* --- Button --- */}
        <Animated.View
          entering={ZoomIn.delay(1800)}
          style={{ width: '100%', marginTop: 24 }}
        >
          <Pressable onPress={onDismiss}>
            {({ pressed }) => (
              <Animated.View style={[styles.button, pressed && styles.pressed]}>
                <LinearGradient
                  colors={THEME.colors.primary as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.btnText}>Continue</Text>
                <Ionicons
                  name='arrow-forward'
                  size={18}
                  color='#FFF'
                  style={{ marginLeft: 8 }}
                />
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
  dimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    width: width * 0.85,
    maxWidth: 360,
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.glass,
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  overline: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: THEME.colors.textDim,
    letterSpacing: 2,
    marginBottom: 32,
  },
  // Hero
  heroSection: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)', // Violet low opacity
  },
  ring1: { width: 180, height: 180, borderStyle: 'dashed' },
  ring2: { width: 220, height: 220, opacity: 0.5 },

  backGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#A855F7',
    filter: 'blur(50px)',
  },
  circleContainer: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  innerCircleBorder: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  numberMask: {
    height: 80,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Essential for the slide effect
  },
  levelNum: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 64,
    color: '#FFF',
    lineHeight: 80,
    position: 'absolute',
  },
  newLevelNum: {
    color: '#FFF',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  chapterLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: -5,
    letterSpacing: 1,
  },
  // Text
  textSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#FFF',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: THEME.colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Feature List
  featureList: {
    width: '100%',
    gap: 12,
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
    backgroundColor: THEME.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#FFF',
  },
  // Button
  button: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  btnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#FFF',
  },
})
