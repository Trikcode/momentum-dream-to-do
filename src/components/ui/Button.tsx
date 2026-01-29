// src/components/ui/Button.tsx
import React from 'react'
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent'
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
}: ButtonProps) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 20, stiffness: 300 })
    opacity.value = withSpring(0.9)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 })
    opacity.value = withSpring(1)
  }

  const handlePress = () => {
    if (disabled || isLoading) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const sizeConfig = SIZE_CONFIG[size]
  const variantConfig = VARIANT_CONFIG[variant]
  const isDisabled = disabled || isLoading

  const content = (
    <View style={styles.content}>
      {isLoading ? (
        <ActivityIndicator size='small' color={variantConfig.textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={{ marginRight: SPACING.sm }}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              { fontSize: sizeConfig.fontSize, color: variantConfig.textColor },
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={{ marginLeft: SPACING.sm }}>{icon}</View>
          )}
        </>
      )}
    </View>
  )

  // Accent variant uses gradient
  if (variant === 'accent') {
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
          colors={['#6C7CFF', '#8B98FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            {
              height: sizeConfig.height,
              paddingHorizontal: sizeConfig.paddingX,
            },
            SHADOWS.glow,
          ]}
        >
          {content}
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
      {content}
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
    opacity: 0.4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.medium,
    letterSpacing: 0.2,
  },
})

const SIZE_CONFIG = {
  sm: { height: 40, paddingX: 16, fontSize: 14 },
  md: { height: 48, paddingX: 20, fontSize: 15 },
  lg: { height: 56, paddingX: 24, fontSize: 16 },
}

const VARIANT_CONFIG = {
  primary: {
    backgroundColor: COLORS.white,
    textColor: COLORS.background.primary,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: COLORS.overlay.medium,
    textColor: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: COLORS.text.secondary,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  accent: {
    backgroundColor: COLORS.accent.primary,
    textColor: COLORS.white,
    borderWidth: 0,
    borderColor: 'transparent',
  },
}
