// src/components/onboarding/CategoryCard.tsx
import React from 'react'
import { StyleSheet, Text, Pressable, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { DreamCategory } from '@/src/constants/dreamCategories'
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '@/src/constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface CategoryCardProps {
  category: DreamCategory
  isSelected: boolean
  onToggle: () => void
}

export function CategoryCard({
  category,
  isSelected,
  onToggle,
}: CategoryCardProps) {
  const scale = useSharedValue(1)

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onToggle()
  }

  const handlePressIn = () => {
    scale.value = withSpring(0.96)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1)
  }

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: withSpring(isSelected ? category.color : COLORS.neutral[200], {
      damping: 15,
    }),
    borderWidth: withSpring(isSelected ? 2 : 1, { damping: 15 }),
  }))

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedContainerStyle, animatedBorderStyle]}
    >
      {/* Icon */}
      <View style={styles.iconRow}>
        <LinearGradient
          colors={
            isSelected
              ? category.gradient
              : [COLORS.neutral[100], COLORS.neutral[200]]
          }
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name={category.icon.name as any}
            size={24}
            color={isSelected ? '#FFF' : COLORS.neutral[400]}
          />
        </LinearGradient>

        {/* Checkmark */}
        {isSelected && (
          <Animated.View style={styles.checkContainer}>
            <LinearGradient
              colors={category.gradient}
              style={styles.checkGradient}
            >
              <Ionicons name='checkmark' size={14} color='#FFF' />
            </LinearGradient>
          </Animated.View>
        )}
      </View>

      {/* Text */}
      <Text style={[styles.name, isSelected && { color: category.color }]}>
        {category.name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {category.description}
      </Text>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '47%',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  checkGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  name: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.neutral[900],
    marginBottom: SPACING.xs,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[500],
    lineHeight: 16,
  },
})
