import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/src/constants/theme';
import { useStore } from '@/src/store/useStore';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

// Simple bar chart component
const WeeklyChart: React.FC<{ data: number[] }> = ({ data }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...data, 1);

  return (
    <View style={styles.chartContainer}>
      {data.map((value, index) => {
        const height = (value / maxValue) * 100;
        const isToday = index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6);

        return (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <LinearGradient
                colors={isToday ? colors.gradients.primary as [string, string] : ['#4A4A5A', '#3A3A4A']}
                style={[styles.bar, { height: `${Math.max(height, 5)}%` }]}
              />
            </View>
            <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>
              {days[index]}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// Stats card component
interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Achievement badge component
interface AchievementBadgeProps {
  icon: string;
  title: string;
  unlocked: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ icon, title, unlocked }) => (
  <View style={[styles.achievementBadge, !unlocked && styles.achievementLocked]}>
    <Text style={[styles.achievementIcon, !unlocked && styles.achievementIconLocked]}>
      {icon}
    </Text>
    <Text style={[styles.achievementTitle, !unlocked && styles.achievementTitleLocked]} numberOfLines={2}>
      {title}
    </Text>
  </View>
);

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { stats, achievements, dreams, currentStreak } = useStore();

  // Calculate stats
  const totalTasks = dreams.reduce((acc, d) => acc + d.micro_actions.length, 0);
  const completedTasks = dreams.reduce(
    (acc, d) => acc + d.micro_actions.filter((a) => a.is_completed).length,
    0
  );
  const dreamsCompleted = dreams.filter((d) => d.progress === 100).length;

  // Weekly progress (mock data for demo)
  const weeklyData = stats.weeklyProgress.length ? stats.weeklyProgress : [3, 5, 2, 8, 4, 6, 3];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.title}>Your Journey</Text>
        <Text style={styles.subtitle}>Track your progress and achievements</Text>

        {/* Weekly Progress Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.05)']}
            style={styles.chartCard}
          >
            <WeeklyChart data={weeklyData} />
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="🔥"
              value={currentStreak || 0}
              label="Day Streak"
              color={colors.accent.gold}
            />
            <StatCard
              icon="✅"
              value={completedTasks}
              label="Tasks Done"
              color={colors.status.success}
            />
            <StatCard
              icon="🎯"
              value={dreams.length}
              label="Active Dreams"
              color={colors.accent.purple}
            />
            <StatCard
              icon="🏆"
              value={dreamsCompleted}
              label="Dreams Achieved"
              color={colors.accent.pink}
            />
          </View>
        </View>

        {/* Achievement Gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement Gallery</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                icon={achievement.icon}
                title={achievement.title}
                unlocked={achievement.unlocked}
              />
            ))}
          </View>
        </View>

        {/* Motivation Card */}
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.15)', 'rgba(251, 146, 60, 0.1)']}
          style={styles.motivationCard}
        >
          <Text style={styles.motivationEmoji}>💪</Text>
          <View style={styles.motivationText}>
            <Text style={styles.motivationTitle}>Keep Going!</Text>
            <Text style={styles.motivationSubtitle}>
              You're {Math.round((completedTasks / Math.max(totalTasks, 1)) * 100)}% of the way to achieving your dreams!
            </Text>
          </View>
        </LinearGradient>

        <View style={{ height: 100 }} />
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
  scrollContent: {
    padding: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
  },
  subtitle: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
  },
  chartCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: spacing.sm,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 100,
    width: 24,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  dayLabelActive: {
    color: colors.accent.purple,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: (width - 48) / 2 - 8,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
  },
  statLabel: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  achievementBadge: {
    width: (width - 56) / 3 - 8,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  achievementIconLocked: {
    opacity: 0.5,
  },
  achievementTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: colors.text.muted,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  motivationEmoji: {
    fontSize: 40,
  },
  motivationText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  motivationTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
  },
  motivationSubtitle: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
});
