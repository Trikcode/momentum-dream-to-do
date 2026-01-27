import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DreamCard } from '@/src/components/dreams/DreamCard';
import { FloatingActionButton, GradientButton } from '@/src/components/common';
import { colors, typography, spacing, borderRadius } from '@/src/constants/theme';
import { useStore } from '@/src/store/useStore';
import { DreamCategory } from '@/src/types';
import { DREAM_CATEGORIES } from '@/src/constants/categories';

type FilterType = 'all' | DreamCategory;

export default function DreamsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const { dreams, isPremium } = useStore();

  const filteredDreams = activeFilter === 'all'
    ? dreams
    : dreams.filter((d) => d.category === activeFilter);

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    ...DREAM_CATEGORIES.map((cat) => ({ id: cat.id as FilterType, label: cat.title })),
  ];

  const handleDreamPress = (dreamId: string) => {
    router.push(`/dream/${dreamId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Dreams</Text>
        <TouchableOpacity
          onPress={() => router.push('/ai-coach')}
          style={styles.aiButton}
        >
          <LinearGradient
            colors={['#EC4899', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiButtonGradient}
          >
            <Text style={styles.aiButtonText}>🤖 AI Coach</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setActiveFilter(filter.id)}
            activeOpacity={0.8}
          >
            {activeFilter === filter.id ? (
              <LinearGradient
                colors={colors.gradients.primary as [string, string]}
                style={styles.filterButton}
              >
                <Text style={styles.filterTextActive}>{filter.label}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.filterButton, styles.filterButtonInactive]}>
                <Text style={styles.filterText}>{filter.label}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dreams list */}
      <ScrollView
        style={styles.dreamsList}
        contentContainerStyle={styles.dreamsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredDreams.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌟</Text>
            <Text style={styles.emptyTitle}>No dreams yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first dream and start your journey!
            </Text>
            <View style={{ marginTop: spacing.lg }}>
              <GradientButton
                title="Create Dream"
                onPress={() => router.push('/create-dream')}
              />
            </View>
          </View>
        ) : (
          <>
            {filteredDreams.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                onPress={() => handleDreamPress(dream.id)}
              />
            ))}

            {/* Premium upsell if not premium and has >= 3 dreams */}
            {!isPremium && dreams.length >= 3 && (
              <TouchableOpacity
                onPress={() => router.push('/paywall')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
                  style={styles.premiumBanner}
                >
                  <Text style={styles.premiumEmoji}>👑</Text>
                  <View style={styles.premiumText}>
                    <Text style={styles.premiumTitle}>Unlock Unlimited Dreams</Text>
                    <Text style={styles.premiumSubtitle}>
                      Upgrade to Pro for unlimited dreams and AI features
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={colors.accent.purple} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
  },
  aiButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  aiButtonGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  aiButtonText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  filterButtonInactive: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  filterTextActive: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
  },
  dreamsList: {
    flex: 1,
    marginTop: spacing.md,
  },
  dreamsContent: {
    paddingHorizontal: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
  },
  emptySubtitle: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  premiumEmoji: {
    fontSize: 32,
  },
  premiumText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  premiumTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.md,
  },
  premiumSubtitle: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
});
