import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { colors, borderRadius, typography, spacing } from '@/src/constants/theme';
import { Dream } from '@/src/types';
import { getCategoryById } from '@/src/constants/categories';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface DreamCardProps {
  dream: Dream;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const DreamCard: React.FC<DreamCardProps> = ({ dream, onPress }) => {
  const scale = useSharedValue(1);
  const categoryInfo = getCategoryById(dream.category);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const completedMilestones = dream.milestones.filter((m) => m.is_completed).length;
  const totalMilestones = dream.milestones.length;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={animatedStyle}
    >
      <View style={styles.container}>
        {/* Image Header */}
        <View style={styles.imageContainer}>
          {dream.image_url ? (
            <Image
              source={{ uri: dream.image_url }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={categoryInfo?.gradient || colors.gradients.purple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.placeholderImage}
            >
              <Text style={styles.placeholderEmoji}>{categoryInfo?.icon || '✨'}</Text>
            </LinearGradient>
          )}
          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(13, 11, 30, 0.8)', 'rgba(13, 11, 30, 1)']}
            style={styles.imageOverlay}
          />
          {/* AI badge */}
          {dream.image_url && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>Created via Newell AI</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{dream.title}</Text>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <ProgressBar
              progress={dream.progress}
              gradient={categoryInfo?.gradient || colors.gradients.primary}
              height={8}
            />
            <Text style={styles.progressText}>{dream.progress}%</Text>
          </View>

          {/* Milestones row */}
          <View style={styles.milestonesRow}>
            <Text style={styles.milestonesLabel}>Milestones</Text>
            <View style={styles.milestonesIcons}>
              {dream.milestones.slice(0, 3).map((milestone, index) => (
                <View
                  key={milestone.id}
                  style={[
                    styles.milestoneIcon,
                    milestone.is_completed && styles.milestoneCompleted,
                  ]}
                >
                  {milestone.is_completed ? (
                    <Text style={styles.checkIcon}>✓</Text>
                  ) : (
                    <Text style={styles.milestoneNumber}>{index + 1}</Text>
                  )}
                </View>
              ))}
              {totalMilestones > 3 && (
                <Text style={styles.moreText}>+{totalMilestones - 3}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  aiBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  aiBadgeText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.xl,
    marginBottom: spacing.md,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.md,
    width: 40,
  },
  milestonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestonesLabel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  milestonesIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  milestoneCompleted: {
    backgroundColor: colors.status.success,
  },
  checkIcon: {
    color: colors.text.primary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
  },
  milestoneNumber: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.medium,
  },
  moreText: {
    color: colors.text.muted,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.medium,
    marginLeft: 6,
  },
});
