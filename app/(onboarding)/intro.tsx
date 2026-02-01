// app/(onboarding)/intro.tsx
import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const { width, height } = Dimensions.get('window')

// TYPES & DATA

interface SlideData {
  id: string
  title: string
  highlight: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
  color: string
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    title: 'Dream Big,',
    highlight: 'Start Small',
    description:
      'Turn your biggest ambitions into achievable daily actions. Every giant leap begins with a single step.',
    icon: 'sparkles',
    color: DARK.accent.rose,
  },
  {
    id: '2',
    title: 'Build Unstoppable',
    highlight: 'Habits',
    description:
      'Stack micro-wins every day. Watch your streaks grow and momentum build effortlessly.',
    icon: 'flame',
    color: DARK.accent.gold,
  },
  {
    id: '3',
    title: 'Celebrate Your',
    highlight: 'Wins',
    description:
      'Level up your life. Earn badges, track progress, and see how far you have come.',
    icon: 'trophy',
    color: DARK.accent.violet,
  },
]

// COMPONENTS

// Reusing the Blob from Welcome screen for consistency
const BreathingBlob = ({ color, size, top, left, delay = 0 }: any) => {
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, {
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, {
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.4,
        },
        animatedStyle,
      ]}
    />
  )
}

// Individual Slide Component
const IntroSlide = ({
  item,
  index,
  scrollX,
}: {
  item: SlideData
  index: number
  scrollX: any
}) => {
  // Parallax Animations
  const contentStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP,
    )

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    )

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, 50],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    }
  })

  return (
    <View style={styles.slideContainer}>
      <Animated.View style={[styles.slideContent, contentStyle]}>
        {/* Icon Container with Glass Effect */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconGlow, { backgroundColor: item.color }]} />
          <BlurView intensity={40} tint='dark' style={styles.iconGlass}>
            <Ionicons name={item.icon} size={64} color={item.color} />
          </BlurView>
          {/* Decorative ring */}
          <View style={[styles.iconBorder, { borderColor: item.color }]} />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {item.title}
            {'\n'}
            <Text style={{ color: item.color }}>{item.highlight}</Text>
          </Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </Animated.View>
    </View>
  )
}
// Add this component before Paginator
const PaginatorDot = ({ index, scrollX }: { index: number; scrollX: any }) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP,
    )

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP,
    )

    return {
      width: dotWidth,
      opacity,
      backgroundColor: DARK.text.primary,
    }
  })

  return <Animated.View style={[styles.dot, animatedDotStyle]} />
}

// Replace existing Paginator with this
const Paginator = ({ data, scrollX }: { data: SlideData[]; scrollX: any }) => {
  return (
    <View style={styles.paginatorContainer}>
      {data.map((_, i) => (
        <PaginatorDot key={i.toString()} index={i} scrollX={scrollX} />
      ))}
    </View>
  )
}

// MAIN SCREEN

export default function IntroScreen() {
  const insets = useSafeAreaInsets()
  const scrollX = useSharedValue(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x
  })

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
    } else {
      handleFinish()
    }
  }

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // Navigate to next onboarding step (e.g., Pick Dreams)
    router.push('/(onboarding)/pick-dreams')
  }

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push('/(onboarding)/pick-dreams')
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index)
    }
  }).current

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* BACKGROUND LAYER */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        <BreathingBlob
          color={DARK.accent.rose}
          size={300}
          top={-50}
          left={-100}
        />
        <BreathingBlob
          color={DARK.accent.violet}
          size={280}
          top={height * 0.5}
          left={width * 0.4}
          delay={1000}
        />
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={80}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      {/* HEADER (SKIP BUTTON) */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <Animated.View entering={FadeIn.delay(500)}>
          {currentIndex < SLIDES.length - 1 && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>

      {/* SLIDES */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <IntroSlide item={item} index={index} scrollX={scrollX} />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      {/* BOTTOM SECTION */}
      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        <Paginator data={SLIDES} scrollX={scrollX} />

        <Animated.View
          style={styles.buttonWrapper}
          entering={FadeInDown.delay(300).springify()}
        >
          <Pressable onPress={handleNext}>
            {({ pressed }) => (
              <Animated.View
                style={[styles.primaryButton, pressed && styles.buttonPressed]}
              >
                <LinearGradient
                  colors={DARK.gradients.primary as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                />
                <Text style={styles.buttonText}>
                  {currentIndex === SLIDES.length - 1 ? "Let's Go" : 'Next'}
                </Text>
                <Ionicons
                  name='arrow-forward'
                  size={20}
                  color='white'
                  style={{ marginLeft: 8 }}
                />
              </Animated.View>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  )
}

// STYLES

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    zIndex: 10,
  },
  skipButton: {
    padding: SPACING.sm,
  },
  skipText: {
    color: DARK.text.tertiary,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },

  // Slide Styles
  slideContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContent: {
    width: width * 0.85,
    alignItems: 'center',
    marginBottom: 80, // Space for bottom container
  },

  // Icon Styles
  iconContainer: {
    width: 160,
    height: 160,
    marginBottom: SPACING['4xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.5,
  },
  iconGlass: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconBorder: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    opacity: 0.3,
  },

  // Typography
  textContainer: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: DARK.text.primary,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -1,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: DARK.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },

  // Bottom Area
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    gap: SPACING.xl,
  },

  // Pagination
  paginatorContainer: {
    flexDirection: 'row',
    height: 10,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Button
  buttonWrapper: {
    width: '100%',
  },
  primaryButton: {
    height: 56,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...DARK.glow.rose, // From theme.ts
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
})
