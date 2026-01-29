// src/components/ui/Input.tsx
import React, { useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated'
import { COLORS, FONTS, RADIUS, SPACING } from '@/src/constants/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  leftIcon?: keyof typeof Ionicons.glyphMap
  rightIcon?: keyof typeof Ionicons.glyphMap
  onRightIconPress?: () => void
}

const AnimatedView = Animated.createAnimatedComponent(View)

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const focusAnim = useSharedValue(0)

  const handleFocus = () => {
    setIsFocused(true)
    focusAnim.value = withTiming(1, { duration: 200 })
  }

  const handleBlur = () => {
    setIsFocused(false)
    focusAnim.value = withTiming(0, { duration: 200 })
  }

  const borderStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? COLORS.error
      : interpolateColor(
          focusAnim.value,
          [0, 1],
          [COLORS.neutral[200], COLORS.primary[500]],
        )

    return {
      borderColor,
      borderWidth: focusAnim.value === 1 || error ? 2 : 1,
    }
  })

  const isPassword = secureTextEntry !== undefined
  const showSecureText = isPassword && !isPasswordVisible

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <AnimatedView style={[styles.inputContainer, borderStyle]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? COLORS.primary[500] : COLORS.neutral[400]}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={COLORS.neutral[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={showSecureText}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.neutral[400]}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color={COLORS.neutral[400]} />
          </TouchableOpacity>
        )}
      </AnimatedView>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[700],
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING.xs,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.xs,
  },
  leftIcon: {
    marginLeft: SPACING.md,
  },
  rightIcon: {
    padding: SPACING.md,
  },
  error: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  hint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: SPACING.xs,
  },
})
