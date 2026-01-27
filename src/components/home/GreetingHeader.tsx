import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '@/src/constants/theme';

interface GreetingHeaderProps {
  name: string;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ name }) => {
  const sunRotation = useSharedValue(0);
  const sunScale = useSharedValue(1);

  React.useEffect(() => {
    sunRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1
    );

    sunScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, []);

  const sunAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${sunRotation.value}deg` },
      { scale: sunScale.value },
    ],
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.sunContainer, sunAnimatedStyle]}>
        <Text style={styles.sunEmoji}>🌤️</Text>
      </Animated.View>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{getGreeting()}, {name}!</Text>
        <Text style={styles.subtitle}>Ready to crush your day?</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sunContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunEmoji: {
    fontSize: 42,
  },
  textContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  greeting: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
  },
  subtitle: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    marginTop: 2,
  },
});
