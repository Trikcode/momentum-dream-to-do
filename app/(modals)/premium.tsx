import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { FontAwesome6, Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { PACKAGE_TYPE } from 'react-native-purchases'
import * as Haptics from 'expo-haptics'

import { PlanCard } from '@/src/components/premium/PlanCard'
import { FeatureComparison } from '@/src/components/premium/FeatureComparison'
import { SuccessModal } from '@/src/components/premium/SuccessModal'
import { usePremiumStore } from '@/src/store/premiumStore'
import {
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'
import { revenueCatService } from '@/src/lib/revenueCat'

export default function PremiumScreen() {
  const insets = useSafeAreaInsets()

  const {
    offerings,
    selectedPackage,
    isLoading,
    purchaseError,
    showSuccess,
    isTrialEligible,
    trialDuration,
    introEligibility,
    subscriptionInfo,
    setSelectedPackage,
    purchasePackage,
    restorePurchases,
    setShowPaywall,
    setShowSuccess,
    clearError,
    fetchOfferings,
  } = usePremiumStore()

  const diamondFloat = useSharedValue(0)
  const glowPulse = useSharedValue(0)

  useEffect(() => {
    if (!offerings) fetchOfferings()

    diamondFloat.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )

    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.4, { duration: 2000 }),
      ),
      -1,
      true,
    )
  }, [])

  useEffect(() => {
    if (purchaseError) {
      Alert.alert('Error', purchaseError, [{ text: 'OK', onPress: clearError }])
    }
  }, [purchaseError])

  useEffect(() => {
    if (offerings?.availablePackages && !selectedPackage) {
      const yearlyPkg = offerings.availablePackages.find(
        (p) => p.packageType === PACKAGE_TYPE.ANNUAL,
      )
      setSelectedPackage(yearlyPkg || offerings.availablePackages[0])
    }
  }, [offerings])

  const handlePurchase = async () => {
    if (!selectedPackage) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const success = await purchasePackage(selectedPackage)
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const success = await restorePurchases()
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }

  const handleClose = () => {
    setShowPaywall(false)
    router.back()
  }

  const diamondStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: diamondFloat.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
  }))

  const packages = offerings?.availablePackages || []

  const getCtaText = () => {
    if (!selectedPackage) return 'Select a Plan'

    const hasTrial = revenueCatService.hasFreeTrial(selectedPackage)
    const trialDur = revenueCatService.getFreeTrialDuration(selectedPackage)

    if (hasTrial && trialDur) {
      return `Start ${trialDur} Free Trial`
    }

    return `Start Premium ${selectedPackage.product.priceString}`
  }

  const getSubtitleText = () => {
    if (!selectedPackage) return ''

    const hasTrial = revenueCatService.hasFreeTrial(selectedPackage)

    if (hasTrial) {
      const period =
        selectedPackage.packageType === PACKAGE_TYPE.ANNUAL ? 'year' : 'month'
      return `Then ${selectedPackage.product.priceString}/${period}`
    }

    return 'Cancel anytime'
  }

  return (
    <View
      style={[styles.container, { backgroundColor: PALETTE.midnight.obsidian }]}
    >
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[
            PALETTE.midnight.obsidian,
            PALETTE.midnight.slate,
            PALETTE.midnight.obsidian,
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View
          style={[
            styles.glowSpot,
            styles.glowSpot1,
            { backgroundColor: PALETTE.electric.cyan },
          ]}
        />
        <View
          style={[
            styles.glowSpot,
            styles.glowSpot2,
            { backgroundColor: PALETTE.electric.indigo },
          ]}
        />
      </View>

      <Animated.View
        entering={FadeIn.delay(300)}
        style={[styles.closeButton, { top: insets.top + SPACING.sm }]}
      >
        <Pressable onPress={handleClose} style={styles.closeButtonInner}>
          <Ionicons name='close' size={24} color={PALETTE.slate[400]} />
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.header}
        >
          <View style={styles.diamondContainer}>
            <Animated.View
              style={[
                styles.glow,
                glowStyle,
                { backgroundColor: PALETTE.electric.cyan },
              ]}
            />
            <Animated.View style={diamondStyle}>
              <LinearGradient
                colors={GRADIENTS.electric}
                style={styles.diamondIcon}
              >
                <Ionicons
                  name='diamond'
                  size={48}
                  color={PALETTE.midnight.obsidian}
                />
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={styles.title}>Unlock Your Full Potential</Text>
          <Text style={styles.subtitle}>
            Unlimited dreams, AI coaching, and advanced insights to accelerate
            your growth.
          </Text>

          {isTrialEligible && trialDuration && (
            <Animated.View
              entering={FadeIn.delay(400)}
              style={styles.trialBadge}
            >
              <Ionicons
                name='gift'
                size={16}
                color={PALETTE.electric.emerald}
              />
              <Text style={styles.trialBadgeText}>
                {trialDuration.toUpperCase()} FREE TRIAL
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(600)}
          style={styles.plansSection}
        >
          {packages.length > 0 ? (
            packages.map((pkg) => (
              <PlanCard
                key={pkg.identifier}
                pkg={pkg}
                isSelected={selectedPackage?.identifier === pkg.identifier}
                isPopular={pkg.packageType === PACKAGE_TYPE.ANNUAL}
                hasFreeTrial={introEligibility[pkg.product.identifier]}
                onSelect={() => setSelectedPackage(pkg)}
              />
            ))
          ) : (
            <View style={styles.loadingPlans}>
              <ActivityIndicator color={PALETTE.electric.cyan} />
              <Text style={styles.loadingText}>Loading premium plans...</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(500).duration(600)}
          style={styles.featuresSection}
        >
          <Text style={styles.sectionTitle}>What You Get</Text>
          <FeatureComparison />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(550)}
          style={styles.guaranteeCard}
        >
          <Ionicons
            name='shield-checkmark'
            size={24}
            color={PALETTE.electric.emerald}
          />
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>100% Money-Back Guarantee</Text>
            <Text style={styles.guaranteeText}>
              Not satisfied? Get a full refund within 7 days, no questions
              asked.
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600)}
          style={styles.testimonialCard}
        >
          <FontAwesome6
            name='quote-left'
            size={24}
            color={PALETTE.electric.cyan}
            style={{ opacity: 0.5 }}
          />
          <Text style={styles.testimonialText}>
            "Momentum Premium changed how I approach my goals. The AI coach is
            like having a mentor in my pocket 24/7."
          </Text>
          <View style={styles.testimonialAuthor}>
            <View style={styles.testimonialAvatar}>
              <Text style={styles.avatarText}>J</Text>
            </View>
            <View>
              <Text style={styles.testimonialName}>James R.</Text>
              <Text style={styles.testimonialRole}>Premium Member</Text>
            </View>
          </View>
        </Animated.View>

        <Pressable onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Already purchased? Restore</Text>
        </Pressable>

        <Text style={styles.legal}>
          Payment will be charged to your App Store or Google Play account.
          Subscription automatically renews unless cancelled at least 24 hours
          before the end of the current period.
        </Text>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.delay(400)}
        style={[
          styles.bottomCTA,
          { paddingBottom: insets.bottom + SPACING.md },
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={80}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.ctaBorder} />

        <View style={styles.ctaContent}>
          <Pressable
            onPress={handlePurchase}
            disabled={!selectedPackage || isLoading}
            style={styles.purchaseButton}
          >
            <LinearGradient
              colors={
                selectedPackage && !isLoading
                  ? GRADIENTS.electric
                  : ([PALETTE.slate[700], PALETTE.slate[600]] as [
                      string,
                      string,
                    ])
              }
              style={styles.purchaseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color={PALETTE.midnight.obsidian} />
              ) : (
                <>
                  <Ionicons
                    name='diamond'
                    size={20}
                    color={PALETTE.midnight.obsidian}
                  />
                  <Text style={styles.purchaseText}>{getCtaText()}</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={styles.cancelAnytime}>{getSubtitleText()}</Text>
        </View>
      </Animated.View>

      {showSuccess && (
        <SuccessModal
          isTrial={subscriptionInfo?.isTrial}
          onDismiss={() => {
            setShowSuccess(false)
            setShowPaywall(false)
            router.back()
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  glowSpot: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.15,
  },
  glowSpot1: {
    top: -100,
    left: -50,
    width: 300,
    height: 300,
  },
  glowSpot2: {
    bottom: 0,
    right: -50,
    width: 300,
    height: 300,
  },

  closeButton: { position: 'absolute', right: SPACING.md, zIndex: 100 },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg },

  header: { alignItems: 'center', marginBottom: SPACING.xl },
  diamondContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  diamondIcon: {
    width: 90,
    height: 90,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: PALETTE.slate[400],
    textAlign: 'center',
    lineHeight: 22,
  },

  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${PALETTE.electric.emerald}15`,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: `${PALETTE.electric.emerald}30`,
  },
  trialBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: PALETTE.electric.emerald,
    letterSpacing: 0.5,
  },

  plansSection: { marginBottom: SPACING.xl, gap: SPACING.sm },
  loadingPlans: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  loadingText: { color: PALETTE.slate[600], fontFamily: FONTS.regular },

  featuresSection: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: '#FFF',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },

  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: `${PALETTE.electric.emerald}10`,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: `${PALETTE.electric.emerald}20`,
  },
  guaranteeContent: { flex: 1 },
  guaranteeTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: PALETTE.electric.emerald,
    marginBottom: 4,
  },
  guaranteeText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: PALETTE.slate[400],
    lineHeight: 18,
  },

  testimonialCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  testimonialText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: PALETTE.slate[400],
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    marginTop: 8,
  },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PALETTE.electric.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: 'bold', color: PALETTE.midnight.obsidian },
  testimonialName: { color: '#FFF', fontFamily: FONTS.semiBold, fontSize: 14 },
  testimonialRole: {
    color: PALETTE.electric.cyan,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },

  restoreButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  restoreText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: PALETTE.slate[500],
    textDecorationLine: 'underline',
  },
  legal: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: PALETTE.slate[600],
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 20,
  },

  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  ctaBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ctaContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  purchaseButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.glow(PALETTE.electric.cyan),
  },
  purchaseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  purchaseText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: PALETTE.midnight.obsidian,
  },
  cancelAnytime: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: PALETTE.slate[500],
    textAlign: 'center',
    marginTop: 12,
  },
})
