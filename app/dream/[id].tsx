import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MilestoneItem } from '@/src/components/dreams/MilestoneItem';
import { MicroActionItem } from '@/src/components/dreams/MicroActionItem';
import { ProgressBar, GradientButton, ConfettiCelebration } from '@/src/components/common';
import { colors, typography, spacing, borderRadius } from '@/src/constants/theme';
import { useStore } from '@/src/store/useStore';
import { getCategoryById } from '@/src/constants/categories';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

// Liquid progress ring component
const LiquidProgressRing: React.FC<{ progress: number; size?: number }> = ({
  progress,
  size = 100,
}) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, { damping: 15, stiffness: 80 });
  }, [progress]);

  const circumference = 2 * Math.PI * ((size - 8) / 2);
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <View style={[styles.progressRingContainer, { width: size, height: size }]}>
      {/* Background ring */}
      <View style={[styles.progressRingBg, { width: size, height: size, borderRadius: size / 2 }]} />

      {/* Progress indicator */}
      <LinearGradient
        colors={colors.gradients.primary as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.progressRingFill,
          {
            width: size - 16,
            height: size - 16,
            borderRadius: (size - 16) / 2,
          },
        ]}
      >
        <View
          style={[
            styles.progressRingInner,
            {
              width: size - 32,
              height: size - 32,
              borderRadius: (size - 32) / 2,
            },
          ]}
        >
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default function DreamDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showConfetti, setShowConfetti] = useState(false);

  const { dreams, toggleMicroAction, toggleMilestone, deleteDream } = useStore();

  const dream = dreams.find((d) => d.id === id);
  const categoryInfo = dream ? getCategoryById(dream.category) : null;

  if (!dream) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Dream not found</Text>
          <GradientButton title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const handleToggleMicroAction = (actionId: string) => {
    const action = dream.micro_actions.find((a) => a.id === actionId);
    if (action && !action.is_completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfetti(true);
    }
    toggleMicroAction(dream.id, actionId);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    const milestone = dream.milestones.find((m) => m.id === milestoneId);
    if (milestone && !milestone.is_completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfetti(true);
    }
    toggleMilestone(dream.id, milestoneId);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteDream(dream.id);
            router.back();
          },
        },
      ]
    );
  };

  const completedMilestones = dream.milestones.filter((m) => m.is_completed).length;

  return (
    <View style={styles.container}>
      <ConfettiCelebration
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Image */}
        <View style={styles.headerContainer}>
          {dream.image_url ? (
            <Image
              source={{ uri: dream.image_url }}
              style={styles.headerImage}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={categoryInfo?.gradient || colors.gradients.purple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerImage}
            >
              <Text style={styles.headerEmoji}>{categoryInfo?.icon || '✨'}</Text>
            </LinearGradient>
          )}

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(13, 11, 30, 0.8)', colors.background.primary]}
            style={styles.headerOverlay}
          />

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <View style={styles.backButtonBg}>
              <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
            </View>
          </TouchableOpacity>

          {/* Actions button */}
          <TouchableOpacity
            style={[styles.actionsButton, { top: insets.top + 10 }]}
            onPress={handleDelete}
          >
            <View style={styles.backButtonBg}>
              <Ionicons name="trash-outline" size={22} color={colors.status.error} />
            </View>
          </TouchableOpacity>

          {/* AI badge */}
          {dream.image_url && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>Created via Newell AI</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Progress */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{dream.title}</Text>
              <LiquidProgressRing progress={dream.progress} size={80} />
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={dream.progress}
                height={10}
                gradient={categoryInfo?.gradient || colors.gradients.primary}
              />
              <Text style={styles.progressLabel}>{dream.progress}%</Text>
            </View>
          </View>

          {/* Milestones Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Milestones</Text>
              <Text style={styles.sectionCount}>
                {completedMilestones}/{dream.milestones.length}
              </Text>
            </View>

            {dream.milestones.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No milestones yet</Text>
              </View>
            ) : (
              dream.milestones.map((milestone, index) => (
                <MilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  index={index}
                  isLast={index === dream.milestones.length - 1}
                  onToggle={() => handleToggleMilestone(milestone.id)}
                />
              ))
            )}
          </View>

          {/* Micro Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Micro-Actions</Text>

            {dream.micro_actions.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>No micro-actions yet</Text>
              </View>
            ) : (
              dream.micro_actions.map((action) => (
                <MicroActionItem
                  key={action.id}
                  action={action}
                  onToggle={() => handleToggleMicroAction(action.id)}
                  onCelebrate={() => setShowConfetti(true)}
                />
              ))
            )}
          </View>

          {/* AI Coach CTA */}
          <TouchableOpacity
            onPress={() => router.push('/ai-coach')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.15)', 'rgba(139, 92, 246, 0.15)']}
              style={styles.aiCoachBanner}
            >
              <View style={styles.aiCoachContent}>
                <Text style={styles.aiCoachEmoji}>🤖</Text>
                <Text style={styles.aiCoachTitle}>Dream Coach</Text>
              </View>
              <Text style={styles.aiCoachText}>Get AI suggestions</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: insets.bottom + 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 72,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  actionsButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  backButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  aiBadgeText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
  },
  content: {
    padding: spacing.md,
    marginTop: -spacing.xl,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    marginRight: spacing.md,
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingBg: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressRingFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingInner: {
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  progressLabel: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.md,
    minWidth: 40,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.lg,
  },
  sectionCount: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  emptySection: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptySectionText: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
  },
  aiCoachBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  aiCoachContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiCoachEmoji: {
    fontSize: 28,
  },
  aiCoachTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.md,
    marginLeft: spacing.sm,
  },
  aiCoachText: {
    color: colors.accent.pink,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.lg,
  },
});
