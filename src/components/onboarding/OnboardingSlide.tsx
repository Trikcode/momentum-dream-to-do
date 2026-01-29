// src/components/onboarding/OnboardingSlide.tsx
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ImageSourcePropType,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'

const { width, height } = Dimensions.get('window')

interface OnboardingSlideProps {
  title: string
  subtitle: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  gradientColors: [string, string]
  index: number
}

export function OnboardingSlide({
  title,
  subtitle,
  description,
  icon,
  iconColor,
  gradientColors,
  index,
}: OnboardingSlideProps) {
  return (
    <View style={styles.container}>
      {/* Animated Background Circle */}
      <Animated.View
        entering={FadeIn.delay(100).duration(600)}
        style={styles.backgroundCircle}
      >
        <LinearGradient
          colors={[gradientColors[0] + '20', gradientColors[1] + '10']}
          style={styles.gradientCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Icon Container */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(600).springify()}
        style={styles.iconContainer}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={64} color='#FFF' />
        </LinearGradient>

        {/* Decorative dots */}
        <View
          style={[
            styles.dot,
            styles.dot1,
            { backgroundColor: gradientColors[0] },
          ]}
        />
        <View
          style={[
            styles.dot,
            styles.dot2,
            { backgroundColor: gradientColors[1] },
          ]}
        />
        <View
          style={[
            styles.dot,
            styles.dot3,
            { backgroundColor: gradientColors[0] + '60' },
          ]}
        />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.Text
          entering={FadeInUp.delay(300).duration(500)}
          style={[styles.subtitle, { color: iconColor }]}
        >
          {subtitle}
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.title}
        >
          {title}
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(500).duration(500)}
          style={styles.description}
        >
          {description}
        </Animated.Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  backgroundCircle: {
    position: 'absolute',
    top: height * 0.05,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    overflow: 'hidden',
  },
  gradientCircle: {
    flex: 1,
    borderRadius: width,
  },
  iconContainer: {
    marginTop: height * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  dot: {
    position: 'absolute',
    borderRadius: 50,
  },
  dot1: {
    width: 20,
    height: 20,
    top: -10,
    right: -20,
  },
  dot2: {
    width: 14,
    height: 14,
    bottom: 10,
    left: -30,
  },
  dot3: {
    width: 10,
    height: 10,
    top: 40,
    right: -40,
  },
  content: {
    marginTop: height * 0.08,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  subtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
  },
})
