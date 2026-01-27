import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from '@/src/components/common';
import { colors, typography, spacing, borderRadius } from '@/src/constants/theme';
import { useStore } from '@/src/store/useStore';
import { DREAM_CATEGORIES } from '@/src/constants/categories';
import { DreamCategory, Milestone, MicroAction } from '@/src/types';
import * as Haptics from 'expo-haptics';

export default function CreateDreamScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addDream, isPremium, dreams } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DreamCategory>('career');
  const [milestones, setMilestones] = useState<string[]>(['']);
  const [microActions, setMicroActions] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const canCreateDream = isPremium || dreams.length < 3;

  const handleAddMilestone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMilestones([...milestones, '']);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (text: string, index: number) => {
    const newMilestones = [...milestones];
    newMilestones[index] = text;
    setMilestones(newMilestones);
  };

  const handleAddMicroAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMicroActions([...microActions, '']);
  };

  const handleRemoveMicroAction = (index: number) => {
    setMicroActions(microActions.filter((_, i) => i !== index));
  };

  const handleMicroActionChange = (text: string, index: number) => {
    const newActions = [...microActions];
    newActions[index] = text;
    setMicroActions(newActions);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a dream title');
      return;
    }

    if (!canCreateDream) {
      router.push('/paywall');
      return;
    }

    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Create milestones
    const dreamMilestones: Milestone[] = milestones
      .filter((m) => m.trim())
      .map((m, i) => ({
        id: `milestone-${Date.now()}-${i}`,
        dream_id: '',
        title: m.trim(),
        is_completed: false,
        order: i,
      }));

    // Create micro actions
    const dreamMicroActions: MicroAction[] = microActions
      .filter((a) => a.trim())
      .map((a, i) => ({
        id: `action-${Date.now()}-${i}`,
        dream_id: '',
        title: a.trim(),
        is_completed: false,
        is_daily: true,
      }));

    const dreamId = Date.now().toString();

    // Update IDs
    dreamMilestones.forEach((m) => (m.dream_id = dreamId));
    dreamMicroActions.forEach((a) => (a.dream_id = dreamId));

    const newDream = {
      id: dreamId,
      user_id: 'demo-user',
      title: title.trim(),
      description: description.trim(),
      category,
      progress: 0,
      streak_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      milestones: dreamMilestones,
      micro_actions: dreamMicroActions,
    };

    addDream(newDream);

    setTimeout(() => {
      setIsLoading(false);
      router.back();
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Dream</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dream Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="What's your dream?"
              placeholderTextColor={colors.text.muted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your dream in detail..."
              placeholderTextColor={colors.text.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesRow}>
                {DREAM_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    {category === cat.id ? (
                      <LinearGradient
                        colors={cat.gradient as [string, string]}
                        style={styles.categoryChip}
                      >
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text style={styles.categoryText}>{cat.title}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.categoryChip, styles.categoryChipInactive]}>
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text style={styles.categoryTextInactive}>{cat.title}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Milestones */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Milestones</Text>
              <TouchableOpacity onPress={handleAddMilestone}>
                <Ionicons name="add-circle" size={24} color={colors.accent.purple} />
              </TouchableOpacity>
            </View>
            {milestones.map((milestone, index) => (
              <View key={index} style={styles.listItemContainer}>
                <TextInput
                  style={[styles.input, styles.listInput]}
                  placeholder={`Milestone ${index + 1}`}
                  placeholderTextColor={colors.text.muted}
                  value={milestone}
                  onChangeText={(text) => handleMilestoneChange(text, index)}
                />
                {milestones.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveMilestone(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="remove-circle" size={22} color={colors.status.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Micro Actions */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Daily Micro-Actions</Text>
              <TouchableOpacity onPress={handleAddMicroAction}>
                <Ionicons name="add-circle" size={24} color={colors.accent.purple} />
              </TouchableOpacity>
            </View>
            {microActions.map((action, index) => (
              <View key={index} style={styles.listItemContainer}>
                <TextInput
                  style={[styles.input, styles.listInput]}
                  placeholder={`Action ${index + 1}`}
                  placeholderTextColor={colors.text.muted}
                  value={action}
                  onChangeText={(text) => handleMicroActionChange(text, index)}
                />
                {microActions.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveMicroAction(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="remove-circle" size={22} color={colors.status.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* AI Suggestion Banner */}
          <TouchableOpacity
            onPress={() => router.push('/ai-coach')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.2)', 'rgba(139, 92, 246, 0.2)']}
              style={styles.aiBanner}
            >
              <Text style={styles.aiBannerEmoji}>🤖</Text>
              <View style={styles.aiBannerText}>
                <Text style={styles.aiBannerTitle}>Need help?</Text>
                <Text style={styles.aiBannerSubtitle}>
                  Ask AI Dream Coach to suggest milestones and actions
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.accent.pink} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Create Button */}
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}>
          {!canCreateDream ? (
            <GradientButton
              title="Upgrade to Pro for Unlimited Dreams"
              onPress={() => router.push('/paywall')}
              gradient={['#F59E0B', '#FB923C']}
              size="large"
              style={{ width: '100%' }}
            />
          ) : (
            <GradientButton
              title="Create Dream"
              onPress={handleCreate}
              loading={isLoading}
              disabled={!title.trim()}
              size="large"
              style={{ width: '100%' }}
            />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.md,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  categoryChipInactive: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  categoryTextInactive: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  listInput: {
    flex: 1,
  },
  removeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  aiBannerEmoji: {
    fontSize: 32,
  },
  aiBannerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  aiBannerTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.md,
  },
  aiBannerSubtitle: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  bottomContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
});
