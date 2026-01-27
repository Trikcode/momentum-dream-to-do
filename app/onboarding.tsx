import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GradientButton } from '@/src/components/common';
import { colors, typography, spacing, borderRadius } from '@/src/constants/theme';
import { useStore } from '@/src/store/useStore';
import { DREAM_CATEGORIES } from '@/src/constants/categories';
import { DreamCategory } from '@/src/types';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Onboarding slides data
const slides = [
  {
    id: '1',
    emoji: '✨',
    title: 'Welcome to DreamDo',
    subtitle: 'Turn your dreams into daily actions',
    gradient: ['#8B5CF6', '#6366F1'],
  },
  {
    id: '2',
    emoji: '🎯',
    title: 'Set Your Dreams',
    subtitle: 'Create meaningful goals and break them down into achievable milestones',
    gradient: ['#EC4899', '#8B5CF6'],
  },
  {
    id: '3',
    emoji: '🔥',
    title: 'Build Habits',
    subtitle: 'Track your streaks and stay motivated with daily micro-actions',
    gradient: ['#F59E0B', '#FB923C'],
  },
  {
    id: '4',
    emoji: '🤖',
    title: 'AI-Powered Coach',
    subtitle: 'Get personalized guidance to achieve your goals faster',
    gradient: ['#14B8A6', '#3B82F6'],
  },
];

interface SlideProps {
  item: typeof slides[0];
  index: number;
}

const Slide: React.FC<SlideProps> = ({ item }) => (
  <View style={styles.slide}>
    <LinearGradient
      colors={item.gradient as [string, string]}
      style={styles.emojiContainer}
    >
      <Text style={styles.slideEmoji}>{item.emoji}</Text>
    </LinearGradient>
    <Text style={styles.slideTitle}>{item.title}</Text>
    <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
  </View>
);

interface CategoryCardProps {
  category: typeof DREAM_CATEGORIES[0];
  selected: boolean;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, selected, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95);
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={
            selected
              ? (category.gradient as [string, string])
              : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
          }
          style={[styles.categoryCard, selected && styles.categoryCardSelected]}
        >
          <Text style={styles.categoryEmoji}>{category.icon}</Text>
          <Text style={[styles.categoryTitle, selected && styles.categoryTitleSelected]}>
            {category.title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [currentStep, setCurrentStep] = useState(0); // 0-3: slides, 4: categories, 5: first dream
  const [selectedCategories, setSelectedCategories] = useState<DreamCategory[]>([]);
  const [firstDreamTitle, setFirstDreamTitle] = useState('');

  const { setHasCompletedOnboarding, setSelectedCategories: saveCategories, addDream } = useStore();

  const totalSteps = slides.length + 2; // slides + categories + first dream

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      // Navigate to next slide
      flatListRef.current?.scrollToIndex({ index: currentStep + 1, animated: true });
      setCurrentStep(currentStep + 1);
    } else if (currentStep === slides.length - 1) {
      // Move to category selection
      setCurrentStep(slides.length);
    } else if (currentStep === slides.length) {
      // Move to first dream creation
      saveCategories(selectedCategories);
      setCurrentStep(slides.length + 1);
    } else {
      // Complete onboarding
      if (firstDreamTitle.trim()) {
        // Create the first dream
        const newDream = {
          id: Date.now().toString(),
          user_id: 'demo-user',
          title: firstDreamTitle.trim(),
          description: '',
          category: selectedCategories[0] || 'career',
          progress: 0,
          streak_count: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          milestones: [],
          micro_actions: [],
        };
        addDream(newDream);
      }
      setHasCompletedOnboarding(true);
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)');
  };

  const toggleCategory = (category: DreamCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const canProceed = () => {
    if (currentStep < slides.length) return true;
    if (currentStep === slides.length) return selectedCategories.length > 0;
    if (currentStep === slides.length + 1) return true; // Can skip first dream
    return true;
  };

  const getButtonText = () => {
    if (currentStep < slides.length - 1) return 'Next';
    if (currentStep === slides.length - 1) return 'Get Started';
    if (currentStep === slides.length) return 'Continue';
    if (firstDreamTitle.trim()) return 'Create Dream';
    return 'Skip for Now';
  };

  const renderSlides = () => (
    <View style={styles.slidesContainer}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item, index }) => <Slide item={item} index={index} />}
        keyExtractor={(item) => item.id}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentStep && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.stepTitle}>What are you dreaming about?</Text>
      <Text style={styles.stepSubtitle}>Select categories that interest you</Text>

      <View style={styles.categoriesGrid}>
        {DREAM_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            selected={selectedCategories.includes(category.id)}
            onPress={() => toggleCategory(category.id)}
          />
        ))}
      </View>
    </View>
  );

  const renderFirstDream = () => (
    <View style={styles.firstDreamContainer}>
      <Text style={styles.stepTitle}>What's your biggest dream?</Text>
      <Text style={styles.stepSubtitle}>Let's start with your first goal</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.dreamInput}
          placeholder="e.g., Learn to play guitar"
          placeholderTextColor={colors.text.muted}
          value={firstDreamTitle}
          onChangeText={setFirstDreamTitle}
          autoFocus
        />
      </View>

      <View style={styles.suggestionContainer}>
        <Text style={styles.suggestionLabel}>Ideas:</Text>
        <View style={styles.suggestions}>
          {['Visit Japan 🗼', 'Run a marathon 🏃', 'Write a book 📚', 'Learn Spanish 🇪🇸'].map(
            (suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => setFirstDreamTitle(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip button */}
      {currentStep < slides.length && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.content}>
        {currentStep < slides.length && renderSlides()}
        {currentStep === slides.length && renderCategories()}
        {currentStep === slides.length + 1 && renderFirstDream()}
      </View>

      {/* Bottom action */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <GradientButton
          title={getButtonText()}
          onPress={handleNext}
          disabled={!canProceed()}
          size="large"
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.md,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  slideEmoji: {
    fontSize: 56,
  },
  slideTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideSubtitle: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.accent.purple,
    width: 24,
  },
  categoriesContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
  },
  stepTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  categoryCard: {
    width: (width - 56) / 2,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryCardSelected: {
    borderColor: 'transparent',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  categoryTitle: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
  },
  categoryTitleSelected: {
    color: colors.text.primary,
  },
  firstDreamContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
  },
  inputContainer: {
    marginTop: spacing.lg,
  },
  dreamInput: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  suggestionContainer: {
    marginTop: spacing.xl,
  },
  suggestionLabel: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  suggestionText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  bottomContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});
