import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { AnimatedCheckbox } from '@/src/components/common/AnimatedCheckbox';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { colors, borderRadius, typography, spacing } from '@/src/constants/theme';
import { MicroAction, DreamCategory } from '@/src/types';
import { getCategoryById } from '@/src/constants/categories';
import * as Haptics from 'expo-haptics';

interface DreamDropItemProps {
  action: MicroAction & { category?: DreamCategory; dreamTitle?: string };
  onToggle: () => void;
}

export const DreamDropItem: React.FC<DreamDropItemProps> = ({ action, onToggle }) => {
  const scale = useSharedValue(1);
  const categoryInfo = action.category ? getCategoryById(action.category) : null;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(0.98),
      withSpring(1.02),
      withSpring(1)
    );
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progress = action.target_count && action.current_count
    ? (action.current_count / action.target_count) * 100
    : action.is_completed ? 100 : 0;

  const progressLabel = action.target_count
    ? `${action.current_count || 0}/${action.target_count}`
    : null;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={0.9} onPress={handleToggle}>
        <LinearGradient
          colors={
            action.is_completed
              ? ['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.05)']
              : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            action.is_completed && styles.completedContainer,
          ]}
        >
          <View style={styles.checkboxContainer}>
            <AnimatedCheckbox
              checked={action.is_completed}
              onToggle={handleToggle}
              size={24}
              gradient={categoryInfo?.gradient || colors.gradients.primary}
            />
          </View>

          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                action.is_completed && styles.completedTitle,
              ]}
            >
              {action.title}
            </Text>
            {action.dreamTitle && (
              <Text style={styles.dreamTitle}>{action.dreamTitle}</Text>
            )}
            {!action.is_completed && (
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={progress}
                  height={4}
                  gradient={categoryInfo?.gradient || colors.gradients.primary}
                />
              </View>
            )}
          </View>

          {progressLabel && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{progressLabel}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  completedContainer: {
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  checkboxContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.text.secondary,
  },
  dreamTitle: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  countText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
  },
});
