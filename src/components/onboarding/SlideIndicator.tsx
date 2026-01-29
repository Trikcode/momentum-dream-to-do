import React from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  SharedValue,
} from 'react-native-reanimated'
import { COLORS, SPACING } from '@/src/constants/theme'

interface SlideIndicatorProps {
  total: number
  currentIndex: SharedValue<number>
}

export function SlideIndicator({ total, currentIndex }: SlideIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={index} index={index} currentIndex={currentIndex} />
      ))}
    </View>
  )
}

interface DotProps {
  index: number
  currentIndex: SharedValue<number>
}

function Dot({ index, currentIndex }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = Math.round(currentIndex.value) === index

    const width = withSpring(isActive ? 32 : 10, {
      damping: 15,
      stiffness: 150,
    })

    const opacity = withSpring(isActive ? 1 : 0.3, {
      damping: 15,
      stiffness: 150,
    })

    return {
      width,
      opacity,
      backgroundColor: isActive ? COLORS.primary[500] : COLORS.neutral[400],
    }
  })

  return <Animated.View style={[styles.dot, animatedStyle]} />
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
})
