// app/(onboarding)/intro.tsx
import React, { useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  FadeInDown,
} from 'react-native-reanimated'
import { OnboardingSlide } from '@/src/components/onboarding/OnboardingSlide'
import { SlideIndicator } from '@/src/components/onboarding/SlideIndicator'
import { Button } from '@/src/components/ui/Button'
import { COLORS, SPACING } from '@/src/constants/theme'

const { width } = Dimensions.get('window')

// ✅ Define the slide data type
interface SlideData {
  id: string
  title: string
  subtitle: string
  description: string
  icon: 'sparkles' | 'flame' | 'trophy'
  iconColor: string
  gradientColors: [string, string]
}

// ✅ Type the AnimatedFlatList properly
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<SlideData>)

const SLIDES: SlideData[] = [
  {
    id: '1',
    title: 'Dream Big, Start Small',
    subtitle: 'Welcome',
    description:
      'Turn your biggest dreams into achievable daily actions. Every journey starts with a single step.',
    icon: 'sparkles',
    iconColor: COLORS.primary[500],
    gradientColors: [COLORS.primary[400], COLORS.primary[600]],
  },
  {
    id: '2',
    title: 'Build Unstoppable Habits',
    subtitle: 'Daily Progress',
    description:
      'Complete micro-actions every day. Watch your streaks grow and celebrate every win along the way.',
    icon: 'flame',
    iconColor: COLORS.accent[500],
    gradientColors: [COLORS.accent[400], COLORS.accent[600]],
  },
  {
    id: '3',
    title: 'Celebrate Your Wins',
    subtitle: 'Achievement Unlocked',
    description:
      'Earn badges, level up, and share your achievements. You deserve to celebrate every milestone.',
    icon: 'trophy',
    iconColor: COLORS.secondary[500],
    gradientColors: [COLORS.secondary[400], COLORS.secondary[600]],
  },
]

export default function IntroScreen() {
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList<SlideData>>(null)
  const scrollX = useSharedValue(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x / width
    },
  })

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
      setCurrentIndex(currentIndex + 1)
    } else {
      router.push('/(onboarding)/pick-dreams')
    }
  }

  const handleSkip = () => {
    router.push('/(onboarding)/pick-dreams')
  }

  const isLastSlide = currentIndex === SLIDES.length - 1

  // ✅ Type the renderItem function
  const renderItem = ({ item, index }: { item: SlideData; index: number }) => (
    <OnboardingSlide {...item} index={index} />
  )

  // ✅ Type the keyExtractor
  const keyExtractor = (item: SlideData) => item.id

  // ✅ Type the onMomentumScrollEnd handler
  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width)
    setCurrentIndex(index)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Slides */}
      <AnimatedFlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={renderItem}
      />

      {/* Bottom Section */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(500)}
        style={[
          styles.bottomSection,
          { paddingBottom: insets.bottom + SPACING.lg },
        ]}
      >
        {/* Indicators */}
        <SlideIndicator total={SLIDES.length} currentIndex={scrollX} />

        {/* Buttons */}
        <View style={styles.buttons}>
          {!isLastSlide && (
            <Button
              title='Skip'
              onPress={handleSkip}
              variant='ghost'
              size='lg'
              style={styles.skipButton}
            />
          )}

          <Button
            title={isLastSlide ? "Let's Go!" : 'Next'}
            onPress={handleNext}
            size='lg'
            style={styles.nextButton}
          />
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    gap: SPACING.xl,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
})
