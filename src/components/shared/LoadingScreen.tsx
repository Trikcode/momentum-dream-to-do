// src/components/shared/LoadingScreen.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  SharedValue,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'

const { width, height } = Dimensions.get('window')

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({
  message = 'Loading your dreams...',
}: LoadingScreenProps) {
  const rotate = useSharedValue(0)
  const scale = useSharedValue(1)
  const dotOpacity1 = useSharedValue(0.3)
  const dotOpacity2 = useSharedValue(0.3)
  const dotOpacity3 = useSharedValue(0.3)

  useEffect(() => {
    // Rotation animation
    rotate.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false,
    )

    // Pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )

    const animateDot = (dotValue: SharedValue<number>, delay: number) => {
      dotValue.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 }),
          ),
          -1,
          true,
        ),
      )
    }

    animateDot(dotOpacity1, 0)
    animateDot(dotOpacity2, 200)
    animateDot(dotOpacity3, 400)
  }, [])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }))

  const dot1Style = useAnimatedStyle(() => ({ opacity: dotOpacity1.value }))
  const dot2Style = useAnimatedStyle(() => ({ opacity: dotOpacity2.value }))
  const dot3Style = useAnimatedStyle(() => ({ opacity: dotOpacity3.value }))

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          COLORS.primary[50],
          COLORS.background.primary,
          COLORS.secondary[50],
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
        {/* Animated icon */}
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <LinearGradient
            colors={COLORS.gradients.dream as [string, string]}
            style={styles.iconGradient}
          >
            <Ionicons name='sparkles' size={40} color='#FFF' />
          </LinearGradient>
        </Animated.View>

        {/* Loading text with animated dots */}
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, dot1Style]} />
            <Animated.View style={[styles.dot, dot2Style]} />
            <Animated.View style={[styles.dot, dot3Style]} />
          </View>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconGradient: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.neutral[600],
  },
  dots: {
    flexDirection: 'row',
    marginLeft: 4,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary[500],
  },
})
