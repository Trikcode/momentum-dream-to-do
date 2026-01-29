// app/(auth)/welcome.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { router, Href } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInUp,
  interpolate,
} from 'react-native-reanimated'
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg'
import { Button } from '@/src/components/ui/Button'
import { COLORS, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const { width, height } = Dimensions.get('window')
const AnimatedPath = Animated.createAnimatedComponent(Path)

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets()

  // Animation values
  const pathProgress = useSharedValue(0)
  const glowOpacity = useSharedValue(0.3)
  const orbFloat = useSharedValue(0)

  useEffect(() => {
    // Animate the momentum path drawing
    pathProgress.value = withDelay(
      500,
      withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) }),
    )

    // Subtle glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )

    // Floating orb animation
    orbFloat.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )
  }, [])

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: orbFloat.value }],
  }))

  // Animated path props for the momentum curve
  const animatedPathProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(pathProgress.value, [0, 1], [400, 0])
    return {
      strokeDashoffset,
    }
  })

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.background.primary, COLORS.background.secondary]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Subtle grid pattern overlay */}
      <View style={styles.gridOverlay} />

      {/* Ambient glow */}
      <Animated.View style={[styles.ambientGlow, glowStyle]} />

      {/* Main content */}
      <View
        style={[styles.content, { paddingTop: insets.top + SPACING['4xl'] }]}
      >
        {/* Logo and visual */}
        <Animated.View
          entering={FadeIn.delay(200).duration(1000)}
          style={styles.visualContainer}
        >
          {/* Abstract momentum curve */}
          <View style={styles.curveContainer}>
            <Svg width={200} height={120} viewBox='0 0 200 120'>
              <Defs>
                <SvgGradient
                  id='curveGradient'
                  x1='0%'
                  y1='0%'
                  x2='100%'
                  y2='0%'
                >
                  <Stop
                    offset='0%'
                    stopColor={COLORS.accent.primary}
                    stopOpacity={0.2}
                  />
                  <Stop
                    offset='50%'
                    stopColor={COLORS.accent.primary}
                    stopOpacity={1}
                  />
                  <Stop
                    offset='100%'
                    stopColor={COLORS.progress.primary}
                    stopOpacity={0.8}
                  />
                </SvgGradient>
              </Defs>
              <AnimatedPath
                d='M 20 100 Q 60 100 80 70 Q 100 40 130 40 Q 160 40 180 20'
                stroke='url(#curveGradient)'
                strokeWidth={3}
                strokeLinecap='round'
                fill='none'
                strokeDasharray={400}
                animatedProps={animatedPathProps}
              />
            </Svg>

            {/* Glowing orb at the end of path */}
            <Animated.View style={[styles.orb, orbStyle]}>
              <View style={styles.orbCore} />
              <View style={styles.orbGlow} />
            </Animated.View>
          </View>

          {/* App name */}
          <Text style={styles.appName}>Momentum</Text>
        </Animated.View>

        {/* Headline section */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(800)}
          style={styles.headlineContainer}
        >
          <Text style={styles.headline}>Build momentum,{'\n'}every day.</Text>
          <Text style={styles.subheadline}>
            Transform your goals into daily progress with{'\n'}
            intelligent coaching that adapts to you.
          </Text>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTA section */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(800)}
          style={[
            styles.ctaContainer,
            { paddingBottom: insets.bottom + SPACING.lg },
          ]}
        >
          <Button
            title='Get Started'
            onPress={() => router.push('/(auth)/sign-up' as Href)}
            variant='primary'
            size='lg'
            fullWidth
          />

          <Button
            title='I already have an account'
            onPress={() => router.push('/(auth)/sign-in' as Href)}
            variant='ghost'
            size='md'
            fullWidth
          />

          {/* Terms text */}
          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service{'\n'}and Privacy
            Policy.
          </Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    // This creates a subtle grid effect
    // You can add a subtle pattern image here if desired
  },
  ambientGlow: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.3,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: COLORS.accent.primary,
    transform: [{ scaleX: 1.5 }],
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING['2xl'],
  },
  visualContainer: {
    alignItems: 'center',
    marginTop: SPACING['5xl'],
  },
  curveContainer: {
    width: 200,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['2xl'],
  },
  orb: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.progress.primary,
  },
  orbGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.progress.primary,
    opacity: 0.3,
  },
  appName: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  headlineContainer: {
    marginTop: SPACING['6xl'],
  },
  headline: {
    fontFamily: FONTS.bold,
    fontSize: 40,
    lineHeight: 48,
    color: COLORS.text.primary,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subheadline: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  spacer: {
    flex: 1,
  },
  ctaContainer: {
    gap: SPACING.md,
  },
  terms: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
})
