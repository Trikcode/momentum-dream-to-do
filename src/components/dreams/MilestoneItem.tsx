import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing } from '@/src/constants/theme';
import { Milestone } from '@/src/types';
import * as Haptics from 'expo-haptics';

interface MilestoneItemProps {
  milestone: Milestone;
  onToggle: () => void;
  index: number;
  isLast?: boolean;
}

export const MilestoneItem: React.FC<MilestoneItemProps> = ({
  milestone,
  onToggle,
  index,
  isLast = false,
}) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1.05),
      withSpring(1)
    );
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={styles.container}>
        {/* Timeline connector */}
        <View style={styles.timelineContainer}>
          {/* Connector line */}
          {!isLast && (
            <View
              style={[
                styles.connectorLine,
                milestone.is_completed && styles.connectorCompleted,
              ]}
            />
          )}

          {/* Circle indicator */}
          <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
            {milestone.is_completed ? (
              <LinearGradient
                colors={colors.gradients.primary as [string, string]}
                style={styles.circleCompleted}
              >
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </LinearGradient>
            ) : (
              <View style={styles.circleIncomplete}>
                <Text style={styles.circleNumber}>{index + 1}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={styles.contentTouchable}
        >
          <LinearGradient
            colors={
              milestone.is_completed
                ? ['rgba(139, 92, 246, 0.15)', 'rgba(99, 102, 241, 0.1)']
                : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.content,
              milestone.is_completed && styles.contentCompleted,
            ]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🎯</Text>
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  milestone.is_completed && styles.titleCompleted,
                ]}
              >
                {milestone.title}
              </Text>
              {milestone.description && (
                <Text style={styles.description}>{milestone.description}</Text>
              )}
            </View>
            {milestone.is_completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>Done!</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  timelineContainer: {
    width: 40,
    alignItems: 'center',
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    top: 32,
    bottom: -spacing.sm,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  connectorCompleted: {
    backgroundColor: colors.accent.purple,
  },
  circleCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIncomplete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
  },
  circleNumber: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
  },
  contentTouchable: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  contentCompleted: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.md,
  },
  titleCompleted: {
    color: colors.accent.purple,
  },
  description: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  completedBadge: {
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  completedText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
  },
});
