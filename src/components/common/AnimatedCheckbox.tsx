import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '@/src/constants/theme';
import * as Haptics from 'expo-haptics';

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  gradient?: string[];
  disabled?: boolean;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({
  checked,
  onToggle,
  size = 24,
  gradient = colors.gradients.primary,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const progress = useSharedValue(checked ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0);
  }, [checked]);

  const handlePress = () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withSpring(0.8),
      withSpring(1.1),
      withSpring(1)
    );
    onToggle();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Animated.View style={[styles.container, { width: size, height: size }, containerStyle]}>
        {checked ? (
          <LinearGradient
            colors={gradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.checked, { width: size, height: size, borderRadius: size / 4 }]}
          >
            <Animated.View style={checkStyle}>
              <Ionicons name="checkmark" size={size * 0.6} color="#FFF" />
            </Animated.View>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.unchecked,
              {
                width: size,
                height: size,
                borderRadius: size / 4,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unchecked: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
  },
});
