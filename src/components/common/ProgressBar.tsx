import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, borderRadius, typography } from '@/src/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  gradient?: string[];
  height?: number;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
  animated?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  gradient = colors.gradients.primary,
  height = 8,
  showLabel = false,
  label,
  style,
  animated = true,
}) => {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressWidth.value = withSpring(Math.min(100, Math.max(0, progress)), {
        damping: 15,
        stiffness: 100,
      });
    } else {
      progressWidth.value = Math.min(100, Math.max(0, progress));
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={styles.percentage}>{Math.round(progress)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <AnimatedLinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { height }, animatedStyle]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  percentage: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
  },
  track: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});
