import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { ConfettiCelebration, GradientButton } from '@/src/components/common';
import { colors, typography, spacing, borderRadius } from '@/src/constants/theme';
import { useStore } from '@/src/store/useStore';
import * as Haptics from 'expo-haptics';

// Try to import RevenueCat - will be undefined if not available
let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  console.log('RevenueCat not available');
}

// Feature item component
interface FeatureItemProps {
  icon: string;
  title: string;
  delay?: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, delay = 0 }) => (
  <Animated.View
    entering={FadeInDown.duration(400).delay(delay)}
    style={styles.featureItem}
  >
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{title}</Text>
  </Animated.View>
);

// Pricing card component
interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  savings?: string;
  selected: boolean;
  onSelect: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  savings,
  selected,
  onSelect,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    onSelect();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View style={animatedStyle}>
        {selected ? (
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.pricingCard, styles.pricingCardSelected]}
          >
            <View style={styles.pricingContent}>
              <Text style={styles.pricingTitle}>{title}:</Text>
              <View style={styles.priceRow}>
                <Text style={styles.pricingPrice}>{price}</Text>
                <Text style={styles.pricingPeriod}>{period}</Text>
              </View>
              {savings && <Text style={styles.savingsText}>{savings}</Text>}
            </View>
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={colors.accent.purple} />
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.pricingCard}>
            <View style={styles.pricingContent}>
              <Text style={styles.pricingTitle}>{title}:</Text>
              <View style={styles.priceRow}>
                <Text style={styles.pricingPrice}>{price}</Text>
                <Text style={styles.pricingPeriod}>{period}</Text>
              </View>
              {savings && <Text style={styles.savingsText}>{savings}</Text>}
            </View>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setIsPremium } = useStore();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);

  // Confetti animation
  const confettiRotation = useSharedValue(0);

  useEffect(() => {
    confettiRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1
    );

    // Initialize RevenueCat if available
    initRevenueCat();
  }, []);

  const initRevenueCat = async () => {
    if (!Purchases) return;

    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    if (!apiKey) {
      console.log('RevenueCat API key not configured');
      return;
    }

    try {
      Purchases.configure({ apiKey });
      const offerings = await Purchases.getOfferings();
      setOfferings(offerings);
    } catch (error) {
      console.error('RevenueCat init error:', error);
    }
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // Check if RevenueCat is configured
      if (Purchases && offerings?.current) {
        const packages = offerings.current.availablePackages;
        const selectedPackage = packages.find((pkg: any) =>
          selectedPlan === 'annual'
            ? pkg.identifier === '$rc_annual'
            : pkg.identifier === '$rc_monthly'
        );

        if (selectedPackage) {
          const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
          if (customerInfo.entitlements.active['premium']) {
            setIsPremium(true);
            setShowConfetti(true);
            setTimeout(() => {
              router.back();
            }, 2000);
          }
        }
      } else {
        // Demo mode - simulate purchase for development
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsPremium(true);
        setShowConfetti(true);
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Error', 'Unable to complete purchase. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);

    try {
      if (Purchases) {
        const customerInfo = await Purchases.restorePurchases();
        if (customerInfo.entitlements.active['premium']) {
          setIsPremium(true);
          Alert.alert('Success', 'Your purchase has been restored!');
          router.back();
        } else {
          Alert.alert('No Purchases Found', 'We could not find any previous purchases.');
        }
      } else {
        Alert.alert('Info', 'Purchase restoration is not available in demo mode.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: '✨', title: 'Unlimited Dreams' },
    { icon: '🤖', title: 'AI Dream Coach & Vision Boards (Newell AI)' },
    { icon: '👥', title: 'Squad Goals & Social Features' },
    { icon: '🏆', title: 'Exclusive Achievement Badges' },
    { icon: '📊', title: 'Advanced Stats & Insights' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ConfettiCelebration
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Confetti decoration */}
          <View style={styles.confettiContainer}>
            <Text style={styles.confettiEmoji}>🎉</Text>
          </View>

          <Text style={styles.heroTitle}>
            Unlock Your Full{'\n'}Potential with{'\n'}
            <Text style={styles.heroTitleAccent}>DreamDo Pro!</Text>
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          {features.map((feature, index) => (
            <FeatureItem
              key={index}
              icon={feature.icon}
              title={feature.title}
              delay={index * 100}
            />
          ))}
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingSection}>
          <PricingCard
            title="Monthly"
            price="$9.99"
            period="/mo"
            selected={selectedPlan === 'monthly'}
            onSelect={() => setSelectedPlan('monthly')}
          />
          <PricingCard
            title="Annual"
            price="$79.99"
            period="/yr"
            savings="(Save 33%)"
            selected={selectedPlan === 'annual'}
            onSelect={() => setSelectedPlan('annual')}
          />
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <GradientButton
            title="Upgrade to Pro Now!"
            onPress={handlePurchase}
            loading={isLoading}
            size="large"
            style={{ width: '100%' }}
            gradient={['#EC4899', '#8B5CF6']}
          />

          <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          Subscription automatically renews unless canceled. Cancel anytime.
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </Text>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
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
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  confettiContainer: {
    marginBottom: spacing.md,
  },
  confettiEmoji: {
    fontSize: 48,
  },
  heroTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl + 4,
    textAlign: 'center',
    lineHeight: 38,
  },
  heroTitleAccent: {
    color: colors.accent.pink,
  },
  featuresSection: {
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    flex: 1,
  },
  pricingSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pricingCardSelected: {
    borderColor: colors.accent.purple,
  },
  pricingContent: {
    alignItems: 'center',
  },
  pricingTitle: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pricingPrice: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
  },
  pricingPeriod: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  savingsText: {
    color: colors.status.success,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  ctaSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  restoreButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  restoreText: {
    color: colors.accent.purple,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    textDecorationLine: 'underline',
  },
  termsText: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
});
