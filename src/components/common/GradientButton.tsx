import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, borderRadius, typography, shadows } from '@/src/constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradient?: string[];
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'filled' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  gradient = colors.gradients.primary,
  disabled = false,
  loading = false,
  style,
  textStyle,
  variant = 'filled',
  size = 'medium',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 14, paddingHorizontal: 24 },
    large: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const fontSizes = {
    small: typography.sizes.sm,
    medium: typography.sizes.md,
    large: typography.sizes.lg,
  };

  if (variant === 'outline') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animatedStyle]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.outlineGradient, style]}
        >
          <Animated.View style={[styles.outlineInner, sizeStyles[size]]}>
            {loading ? (
              <ActivityIndicator color={gradient[0]} />
            ) : (
              <Text
                style={[
                  styles.outlineText,
                  { fontSize: fontSizes[size], color: gradient[0] },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            )}
          </Animated.View>
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#4A4A5A', '#3A3A4A'] : (gradient as [string, string])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, sizeStyles[size], shadows.button, style]}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={[styles.text, { fontSize: fontSizes[size] }, textStyle]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  outlineGradient: {
    borderRadius: borderRadius.full,
    padding: 2,
  },
  outlineInner: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.full - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
});
