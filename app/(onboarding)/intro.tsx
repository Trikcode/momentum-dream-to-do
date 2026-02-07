import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
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
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedProps,
} from 'react-native-reanimated'
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import {
  FONTS,
  SPACING,
  RADIUS,
  GRADIENTS,
  PALETTE,
  SHADOWS,
} from '@/src/constants/new-theme'

const { width, height } = Dimensions.get('window')

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)

const FocusVisual = ({ color }: { color: string }) => {
  const pulse = useSharedValue(1)
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000 }),
        withTiming(1, { duration: 2000 }),
      ),
      -1,
      true,
    )
  }, [])

  const pulseProps = useAnimatedProps(() => ({
    r: 10 * pulse.value,
    opacity: interpolate(pulse.value, [1, 1.1], [0.8, 0.4]),
  }))

  return (
    <Svg width={120} height={120} viewBox='0 0 120 120'>
      <Defs>
        <SvgGradient id='focusGrad' x1='0' y1='0' x2='1' y2='1'>
          <Stop offset='0' stopColor={color} stopOpacity='1' />
          <Stop offset='1' stopColor='#FFF' stopOpacity='0.2' />
        </SvgGradient>
      </Defs>
      <Circle
        cx='60'
        cy='60'
        r='45'
        stroke={color}
        strokeWidth='1'
        strokeOpacity='0.2'
        strokeDasharray='4 4'
      />
      <Circle
        cx='60'
        cy='60'
        r='30'
        stroke={color}
        strokeWidth='2'
        strokeOpacity='0.5'
      />
      <Circle cx='60' cy='60' r='8' fill='url(#focusGrad)' />
      <AnimatedCircle cx='60' cy='60' fill={color} animatedProps={pulseProps} />
      <Path
        d='M 60 10 L 60 20 M 60 100 L 60 110 M 10 60 L 20 60 M 100 60 L 110 60'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
      />
    </Svg>
  )
}

const AscentVisual = ({ color }: { color: string }) => {
  const progress = useSharedValue(0)
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [])

  return (
    <Svg width={120} height={120} viewBox='0 0 120 120'>
      <Defs>
        <SvgGradient id='ascentGrad' x1='0' y1='1' x2='1' y2='0'>
          <Stop offset='0' stopColor={color} stopOpacity='0.2' />
          <Stop offset='1' stopColor={color} stopOpacity='1' />
        </SvgGradient>
      </Defs>
      <Path
        d='M 30 90 C 50 90, 50 60, 90 30'
        stroke={color}
        strokeWidth='2'
        strokeOpacity='0.3'
        fill='none'
      />
      <Circle cx='30' cy='90' r='6' fill={color} fillOpacity='0.4' />
      <Circle cx='60' cy='60' r='8' fill={color} fillOpacity='0.7' />
      <Circle cx='90' cy='30' r='12' fill='url(#ascentGrad)' />
      <Circle cx='90' cy='30' r='20' fill={color} fillOpacity='0.15' />
    </Svg>
  )
}

const RadianceVisual = ({ color }: { color: string }) => {
  const rotate = useSharedValue(0)
  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false,
    )
  }, [])

  const spinProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }))

  return (
    <Svg width={120} height={120} viewBox='0 0 120 120'>
      <AnimatedPath
        d='M60 20 L60 10 M60 110 L60 100 M20 60 L10 60 M110 60 L100 60 M32 32 L25 25 M88 88 L95 95 M32 88 L25 95 M88 32 L95 25'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
        opacity='0.5'
        animatedProps={spinProps}
      />
      <Path
        d='M 60 30 L 90 60 L 60 90 L 30 60 Z'
        fill={color}
        fillOpacity='0.1'
        stroke={color}
        strokeWidth='1'
      />
      <Path d='M 60 45 L 75 60 L 60 75 L 45 60 Z' fill={color} />
      <Circle
        cx='60'
        cy='60'
        r='35'
        stroke={color}
        strokeWidth='0.5'
        strokeOpacity='0.3'
      />
    </Svg>
  )
}

interface SlideData {
  id: string
  title: string
  highlight: string
  description: string
  VisualComponent: React.FC<any>
  color: string
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    title: 'Design Your',
    highlight: 'Direction',
    description:
      'Turn vague dreams into laser-focused daily actions. Know exactly where you are going.',
    VisualComponent: FocusVisual,
    color: PALETTE.electric.cyan,
  },
  {
    id: '2',
    title: 'Build Unstoppable',
    highlight: 'Momentum',
    description:
      'Consistency compounds. Stack small wins every day to create massive, effortless growth.',
    VisualComponent: AscentVisual,
    color: PALETTE.electric.emerald,
  },
  {
    id: '3',
    title: 'Unlock Your',
    highlight: 'Potential',
    description:
      'Celebrate meaningful victories. See how far you have come and expand what is possible.',
    VisualComponent: RadianceVisual,
    color: PALETTE.electric.indigo,
  },
]

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

const IntroSlide = ({
  item,
  index,
  scrollX,
}: {
  item: SlideData
  index: number
  scrollX: any
}) => {
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
      [0.8, 1, 0.8],
      Extrapolation.CLAMP,
    )
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, 20],
      Extrapolation.CLAMP,
    )

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    }
  })

  const Visual = item.VisualComponent

  return (
    <View style={styles.slideContainer}>
      <Animated.View style={[styles.slideContent, contentStyle]}>
        <View style={styles.visualContainer}>
          <View style={[styles.visualGlow, { backgroundColor: item.color }]} />

          <View style={styles.visualBorder}>
            <BlurView intensity={30} tint='dark' style={styles.visualGlass}>
              <Visual color={item.color} />
            </BlurView>
          </View>
        </View>

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
    return { width: dotWidth, opacity, backgroundColor: '#FFF' }
  })
  return <Animated.View style={[styles.dot, animatedDotStyle]} />
}

const Paginator = ({ data, scrollX }: { data: SlideData[]; scrollX: any }) => {
  return (
    <View style={styles.paginatorContainer}>
      {data.map((_, i) => (
        <PaginatorDot key={i.toString()} index={i} scrollX={scrollX} />
      ))}
    </View>
  )
}

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
    <View
      style={[styles.container, { backgroundColor: PALETTE.midnight.obsidian }]}
    >
      <StatusBar barStyle='light-content' />

      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            PALETTE.midnight.obsidian,
            PALETTE.midnight.slate,
            PALETTE.midnight.obsidian,
          ]}
          style={StyleSheet.absoluteFill}
        />
        <BreathingBlob
          color={PALETTE.electric.cyan}
          size={300}
          top={-50}
          left={-100}
        />

        {Platform.OS === 'ios' && (
          <BlurView
            intensity={80}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      <View style={[styles.header, { marginTop: insets.top }]}>
        <Animated.View entering={FadeIn.delay(500)}>
          {currentIndex < SLIDES.length - 1 && (
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>

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
                  colors={GRADIENTS.electric}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.buttonText}>
                  {currentIndex === SLIDES.length - 1 ? "Let's Go" : 'Continue'}
                </Text>
                <Ionicons
                  name='arrow-forward'
                  size={20}
                  color={PALETTE.midnight.obsidian}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: PALETTE.slate[500],
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  slideContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContent: {
    width: width * 0.85,
    alignItems: 'center',
    marginBottom: 80,
  },
  visualContainer: {
    width: 200,
    height: 200,
    marginBottom: SPACING['4xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.25,
  },
  visualBorder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  visualGlass: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  textContainer: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -1,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: PALETTE.slate[400],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.sm,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    gap: SPACING.xl,
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 10,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
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
    ...SHADOWS.glow(PALETTE.electric.cyan),
  },
  buttonText: {
    color: PALETTE.midnight.obsidian,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
})
