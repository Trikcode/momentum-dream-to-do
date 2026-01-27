import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { AnimatedCheckbox } from '@/src/components/common/AnimatedCheckbox';
import { colors, borderRadius, typography, spacing } from '@/src/constants/theme';
import { MicroAction } from '@/src/types';

interface MicroActionItemProps {
  action: MicroAction;
  onToggle: () => void;
  onCelebrate?: () => void;
}

export const MicroActionItem: React.FC<MicroActionItemProps> = ({
  action,
  onToggle,
  onCelebrate,
}) => {
  const scale = useSharedValue(1);

  const handleToggle = () => {
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1.05),
      withSpring(1)
    );
    onToggle();

    // Trigger celebration if completing the action
    if (!action.is_completed && onCelebrate) {
      setTimeout(() => onCelebrate(), 300);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Progress indicator for actions with count
  const hasProgress = action.target_count && action.target_count > 0;
  const progressPercent = hasProgress
    ? ((action.current_count || 0) / action.target_count!) * 100
    : 0;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleToggle}
        style={styles.touchable}
      >
        <View style={styles.container}>
          <AnimatedCheckbox
            checked={action.is_completed}
            onToggle={handleToggle}
            size={22}
          />

          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                action.is_completed && styles.completedTitle,
              ]}
            >
              {action.title}
            </Text>

            {hasProgress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(progressPercent, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {action.current_count || 0}/{action.target_count}
                </Text>
              </View>
            )}
          </View>

          {/* Progress ring */}
          <View style={styles.ringContainer}>
            <View style={styles.ringOuter}>
              <View
                style={[
                  styles.ringProgress,
                  {
                    transform: [
                      { rotate: `${(action.is_completed ? 100 : progressPercent) * 3.6}deg` },
                    ],
                  },
                ]}
              />
              <View style={styles.ringInner} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: spacing.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.text.muted,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.purple,
    borderRadius: 2,
  },
  progressText: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    minWidth: 40,
    textAlign: 'right',
  },
  ringContainer: {
    width: 36,
    height: 36,
    marginLeft: spacing.sm,
  },
  ringOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringProgress: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.accent.purple,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ringInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.card,
  },
});
