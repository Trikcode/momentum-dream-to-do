// src/components/celebrations/VictoryModal.tsx
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
  interpolate,
  ZoomIn,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Confetti } from './Confetti'
import { FONTS, PALETTE, GRADIENTS, SHADOWS } from '@/src/constants/new-theme'

const { width } = Dimensions.get('window')

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
  const badgeScale = useSharedValue(0)
  const shimmer = useSharedValue(0)
  const glowOpacity = useSharedValue(0)

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    badgeScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 100 }),
    )

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

  const getGradient = (): readonly [string, string] => {
    switch (victory.category) {
      case 'dreams':
        return GRADIENTS.electricAlt
      case 'streak':
        return GRADIENTS.electric
      default:
        return [PALETTE.status.warning, PALETTE.status.warningDark]
    }
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint='dark' style={StyleSheet.absoluteFill} />
      <View style={styles.backdropOverlay} />

      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents='none'>
          <Confetti count={120} />
        </View>
      )}

      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />

      <Animated.View
        entering={SlideInDown.springify().damping(15)}
        style={styles.modalCard}
      >
        <View style={styles.cardGlassBg} />

        <Animated.View entering={FadeIn.delay(400)}>
          <View style={styles.labelContainer}>
            <View style={styles.labelLine} />
            <Text style={styles.label}>VICTORY UNLOCKED</Text>
            <View style={styles.labelLine} />
          </View>
        </Animated.View>

        <View style={styles.heroContainer}>
          <Sunburst />

          <Animated.View
            style={[
              styles.glowBehind,
              glowStyle,
              { backgroundColor: getGradient()[0] },
            ]}
          />

          <Animated.View style={[styles.badge, badgeStyle]}>
            <LinearGradient
              colors={getGradient()}
              style={styles.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View style={[styles.shimmerOverlay, shimmerStyle]} />
              <Ionicons
                name={victory.iconName as any}
                size={72}
                color={PALETTE.midnight.obsidian}
              />
            </LinearGradient>

            <View style={styles.badgeGloss} />
          </Animated.View>
        </View>

        <Animated.View
          entering={FadeIn.delay(600).springify()}
          style={styles.textContainer}
        >
          <Text style={styles.victoryName}>{victory.name}</Text>
          <Text style={styles.victoryDesc}>{victory.description}</Text>
        </Animated.View>

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
            <Ionicons
              name='sparkles'
              size={16}
              color={PALETTE.electric.emerald}
            />
          </View>
          <Text style={styles.rewardText}>
            <Text style={styles.rewardValue}>+{victory.sparkReward}</Text>{' '}
            Sparks Earned
          </Text>
        </Animated.View>

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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    width: width * 0.85,
    maxWidth: 360,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  cardGlassBg: {
    ...StyleSheet.absoluteFillObject,
  },
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
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: PALETTE.electric.emerald,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
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
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  victoryName: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  victoryDesc: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: PALETTE.slate[400],
    textAlign: 'center',
    lineHeight: 22,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: `${PALETTE.electric.emerald}15`,
    borderWidth: 1,
    borderColor: `${PALETTE.electric.emerald}30`,
    marginBottom: 24,
  },
  sparkIcon: {
    marginRight: 8,
  },
  rewardText: {
    fontFamily: FONTS.medium,
    color: PALETTE.electric.emeraldLight,
    fontSize: 14,
  },
  rewardValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...SHADOWS.glow(PALETTE.electric.cyan),
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: PALETTE.midnight.obsidian,
    letterSpacing: 0.5,
  },
})
