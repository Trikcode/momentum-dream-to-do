import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors, borderRadius, typography, spacing } from '@/src/constants/theme';

interface StreakCardProps {
  streakCount: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streakCount }) => {
  const fireScale = useSharedValue(1);
  const fireOpacity = useSharedValue(1);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    // Fire animation
    fireScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    fireOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 300 }),
        withTiming(1, { duration: 300 })
      ),
      -1,
      true
    );

    // Glow animation
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const fireAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
    opacity: fireOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.3,
  }));

  return (
    <LinearGradient
      colors={['rgba(251, 146, 60, 0.15)', 'rgba(239, 68, 68, 0.1)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.fireContainer}>
          {/* Glow effect */}
          <Animated.View style={[styles.glow, glowAnimatedStyle]}>
            <LinearGradient
              colors={['#FB923C', '#EF4444', 'transparent']}
              style={styles.glowGradient}
            />
          </Animated.View>
          {/* Fire emoji */}
          <Animated.Text style={[styles.fireEmoji, fireAnimatedStyle]}>
            🔥
          </Animated.Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.streakNumber}>{streakCount} Day Streak!</Text>
          <Text style={styles.streakText}>Keep the fire burning!</Text>
        </View>

        {/* Progress ring indicator */}
        <View style={styles.ringContainer}>
          <LinearGradient
            colors={colors.gradients.sunset as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ring}
          >
            <View style={styles.ringInner} />
          </LinearGradient>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  fireEmoji: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  streakNumber: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
  },
  streakText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  ringContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.primary,
  },
});
