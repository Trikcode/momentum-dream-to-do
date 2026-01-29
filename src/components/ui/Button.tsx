// src/components/ui/Button.tsx
import React from 'react'
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import {
  COLORS,
  DARK_COLORS,
  FONTS,
  SPACING,
  RADIUS,
} from '@/src/constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// Button variants
type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'accent'
  // Dark theme variants
  | 'dark-primary'
  | 'dark-secondary'
  | 'dark-ghost'
  | 'dark-accent'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  isLoading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 300 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
  }

  const handlePress = () => {
    if (disabled || isLoading) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const sizeConfig = SIZE_CONFIG[size]
  const variantConfig = VARIANT_CONFIG[variant]
  const isDisabled = disabled || isLoading

  const buttonContent = (
    <View style={styles.content}>
      {isLoading ? (
        <ActivityIndicator size='small' color={variantConfig.textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeConfig.fontSize,
                color: variantConfig.textColor,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </>
      )}
    </View>
  )

  // Gradient variants (accent, dark-accent)
  if (variant === 'accent' || variant === 'dark-accent') {
    const gradientColors =
      variant === 'accent'
        ? ([COLORS.primary[500], COLORS.primary[600]] as const)
        : ([DARK_COLORS.accent.primary, DARK_COLORS.accent.secondary] as const)

    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            {
              height: sizeConfig.height,
              paddingHorizontal: sizeConfig.paddingX,
            },
          ]}
        >
          {buttonContent}
        </LinearGradient>
      </AnimatedPressable>
    )
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingX,
          backgroundColor: variantConfig.backgroundColor,
          borderWidth: variantConfig.borderWidth,
          borderColor: variantConfig.borderColor,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {buttonContent}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
})

// Size configurations
const SIZE_CONFIG: Record<
  ButtonSize,
  { height: number; paddingX: number; fontSize: number }
> = {
  sm: { height: 40, paddingX: 16, fontSize: 14 },
  md: { height: 48, paddingX: 20, fontSize: 15 },
  lg: { height: 56, paddingX: 24, fontSize: 16 },
}

// Variant configurations
const VARIANT_CONFIG: Record<
  ButtonVariant,
  {
    backgroundColor: string
    textColor: string
    borderWidth: number
    borderColor: string
  }
> = {
  // ============ LIGHT THEME VARIANTS ============
  primary: {
    backgroundColor: COLORS.primary[500],
    textColor: COLORS.neutral[0],
    borderWidth: 0,
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: COLORS.neutral[100],
    textColor: COLORS.neutral[900],
    borderWidth: 0,
    borderColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    textColor: COLORS.neutral[700],
    borderWidth: 1.5,
    borderColor: COLORS.neutral[300],
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: COLORS.neutral[600],
    borderWidth: 0,
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.error,
    textColor: COLORS.neutral[0],
    borderWidth: 0,
    borderColor: 'transparent',
  },
  accent: {
    // Handled by gradient
    backgroundColor: COLORS.primary[500],
    textColor: COLORS.neutral[0],
    borderWidth: 0,
    borderColor: 'transparent',
  },

  // ============ DARK THEME VARIANTS ============
  'dark-primary': {
    backgroundColor: COLORS.neutral[0],
    textColor: DARK_COLORS.background.primary,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  'dark-secondary': {
    backgroundColor: DARK_COLORS.overlay.medium,
    textColor: DARK_COLORS.text.primary,
    borderWidth: 1,
    borderColor: DARK_COLORS.border.primary,
  },
  'dark-ghost': {
    backgroundColor: 'transparent',
    textColor: DARK_COLORS.text.secondary,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  'dark-accent': {
    // Handled by gradient
    backgroundColor: DARK_COLORS.accent.primary,
    textColor: COLORS.neutral[0],
    borderWidth: 0,
    borderColor: 'transparent',
  },
}
