import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GreetingHeader } from '@/src/components/home/GreetingHeader';
import { StreakCard } from '@/src/components/home/StreakCard';
import { QuoteCard } from '@/src/components/home/QuoteCard';
import { DreamDropItem } from '@/src/components/home/DreamDropItem';
import { FloatingActionButton, ConfettiCelebration } from '@/src/components/common';
import { colors, typography, spacing } from '@/src/constants/theme';
import { useStore } from '@/src/store/useStore';
import { MicroAction } from '@/src/types';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { dreams, dailyQuote, currentStreak, toggleMicroAction, user } = useStore();

  // Get today's tasks from all active dreams
  const todaysTasks: (MicroAction & { dreamId: string; dreamTitle: string; category: string })[] =
    dreams.flatMap((dream) =>
      dream.micro_actions
        .filter((action) => action.is_daily || !action.is_completed)
        .map((action) => ({
          ...action,
          dreamId: dream.id,
          dreamTitle: dream.title,
          category: dream.category,
        }))
    ).slice(0, 10);

  const handleToggleAction = (dreamId: string, actionId: string) => {
    const action = todaysTasks.find((a) => a.id === actionId);
    if (action && !action.is_completed) {
      // Show confetti for completing a task
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowConfetti(true);
    }
    toggleMicroAction(dreamId, actionId);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const userName = user?.name || 'Alex';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ConfettiCelebration
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.purple}
          />
        }
      >
        {/* Greeting Header */}
        <GreetingHeader name={userName} />

        {/* Streak Card */}
        <StreakCard streakCount={currentStreak || 5} />

        {/* Quote Card */}
        <View style={styles.section}>
          <QuoteCard quote={dailyQuote} />
        </View>

        {/* Today's Dream Drops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Dream Drops</Text>

          {todaysTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyText}>No tasks for today!</Text>
              <Text style={styles.emptySubtext}>Create a dream to get started</Text>
            </View>
          ) : (
            todaysTasks.map((task) => (
              <DreamDropItem
                key={task.id}
                action={task}
                onToggle={() => handleToggleAction(task.dreamId, task.id)}
              />
            ))
          )}
        </View>

        {/* Bottom padding for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => router.push('/create-dream')}
        icon="add"
      />
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
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.card,
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.lg,
  },
  emptySubtext: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
});
