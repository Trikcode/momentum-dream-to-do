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
import { Confetti } from './Confetti'
import { FONTS, PALETTE, GRADIENTS, SHADOWS } from '@/src/constants/new-theme'

const { width } = Dimensions.get('window')

interface LevelUpData {
  previousChapter: number
  newChapter: number
  unlockedFeatures?: string[]
}

interface LevelUpModalProps {
  data: LevelUpData
  onDismiss: () => void
}

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
  const containerScale = useSharedValue(0.8)
  const oldNumY = useSharedValue(0)
  const oldNumOp = useSharedValue(1)
  const newNumY = useSharedValue(40)
  const newNumOp = useSharedValue(0)
  const glowIntensity = useSharedValue(0)

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    containerScale.value = withSpring(1)

    setTimeout(() => {
      oldNumY.value = withTiming(-40, { duration: 400, easing: Easing.back(2) })
      oldNumOp.value = withTiming(0, { duration: 300 })

      newNumY.value = withDelay(
        100,
        withSpring(0, { damping: 12, stiffness: 100 }),
      )
      newNumOp.value = withDelay(100, withTiming(1, { duration: 400 }))

      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      }, 300)

      glowIntensity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0.4, { duration: 1000 }),
      )
    }, 800)
  }, [])

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
      <BlurView intensity={50} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.dimmer} />
      <Confetti count={150} />

      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      <Animated.View style={[styles.card, containerStyle]}>
        <View style={styles.cardBg} />

        <Animated.View entering={FadeIn.delay(300)}>
          <Text style={styles.overline}>MOMENTUM UPGRADE</Text>
        </Animated.View>

        <View style={styles.heroSection}>
          <RotatingRings />

          <Animated.View style={[styles.backGlow, glowStyle]} />

          <View style={styles.circleContainer}>
            <LinearGradient
              colors={GRADIENTS.electric}
              style={styles.gradientCircle}
            >
              <View style={styles.innerCircleBorder} />

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

        <Animated.View entering={FadeIn.delay(1200)} style={styles.textSection}>
          <Text style={styles.title}>Story Unlocked</Text>
          <Text style={styles.description}>
            You've reached the next stage of your journey.
          </Text>
        </Animated.View>

        {data.unlockedFeatures && data.unlockedFeatures.length > 0 && (
          <View style={styles.featureList}>
            {data.unlockedFeatures.map((feature, i) => (
              <Animated.View
                key={i}
                entering={SlideInDown.delay(1400 + i * 200).springify()}
                style={styles.featureRow}
              >
                <View style={styles.checkCircle}>
                  <Ionicons
                    name='checkmark'
                    size={12}
                    color={PALETTE.midnight.obsidian}
                  />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </Animated.View>
            ))}
          </View>
        )}

        <Animated.View
          entering={ZoomIn.delay(1800)}
          style={{ width: '100%', marginTop: 24 }}
        >
          <Pressable onPress={onDismiss}>
            {({ pressed }) => (
              <Animated.View style={[styles.button, pressed && styles.pressed]}>
                <LinearGradient
                  colors={GRADIENTS.electric}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.btnText}>Continue</Text>
                <Ionicons
                  name='arrow-forward'
                  size={18}
                  color={PALETTE.midnight.obsidian}
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
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: PALETTE.slate[400],
    letterSpacing: 2,
    marginBottom: 32,
  },
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
    borderColor: `${PALETTE.electric.cyan}40`,
  },
  ring1: { width: 180, height: 180, borderStyle: 'dashed' },
  ring2: { width: 220, height: 220, opacity: 0.5 },
  backGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: PALETTE.electric.cyan,
  },
  circleContainer: {
    ...SHADOWS.glow(PALETTE.electric.cyan),
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
    overflow: 'hidden',
  },
  levelNum: {
    fontFamily: FONTS.bold,
    fontSize: 64,
    color: PALETTE.midnight.obsidian,
    lineHeight: 80,
    position: 'absolute',
  },
  newLevelNum: {
    color: PALETTE.midnight.obsidian,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  chapterLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    color: 'rgba(2, 6, 23, 0.7)',
    marginTop: -5,
    letterSpacing: 1,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#FFF',
    marginBottom: 8,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: PALETTE.slate[400],
    textAlign: 'center',
    lineHeight: 20,
  },
  featureList: {
    width: '100%',
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PALETTE.electric.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#FFF',
  },
  button: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.glow(PALETTE.electric.cyan),
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  btnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: PALETTE.midnight.obsidian,
  },
})
