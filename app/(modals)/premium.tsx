// app/(modals)/premium.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Feather, FontAwesome6, Ionicons } from '@expo/vector-icons'
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
import { PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases'
import * as Haptics from 'expo-haptics'

import { PlanCard } from '@/src/components/premium/PlanCard'
import { FeatureComparison } from '@/src/components/premium/FeatureComparison'
import { SuccessModal } from '@/src/components/premium/SuccessModal'
import { usePremiumStore } from '@/src/store/premiumStore'
import { DARK, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'

const { width } = Dimensions.get('window')

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

  // Auto-select yearly package
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

  // Get CTA text based on trial eligibility
  const getCtaText = () => {
    if (!selectedPackage) return 'Select a Plan'

    const hasTrialForSelected =
      introEligibility[selectedPackage.product.identifier]

    if (hasTrialForSelected && selectedPackage.product.introPrice) {
      const intro = selectedPackage.product.introPrice
      return `Start Free ${intro.periodNumberOfUnits}-${intro.periodUnit.toLowerCase()} Trial`
    }

    return `Start Premium ${selectedPackage.product.priceString}`
  }

  // Get subtitle text
  const getSubtitleText = () => {
    if (!selectedPackage) return ''

    const hasTrialForSelected =
      introEligibility[selectedPackage.product.identifier]

    if (hasTrialForSelected && selectedPackage.product.introPrice) {
      return `Then ${selectedPackage.product.priceString}/${selectedPackage.packageType === PACKAGE_TYPE.ANNUAL ? 'year' : 'month'}`
    }

    return 'Cancel anytime'
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#1F1205', '#000', '#1F0510']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.glowSpot, styles.glowSpot1]} />
        <View style={[styles.glowSpot, styles.glowSpot2]} />
      </View>

      {/* Close Button */}
      <Animated.View
        entering={FadeIn.delay(300)}
        style={[styles.closeButton, { top: insets.top + SPACING.sm }]}
      >
        <Pressable onPress={handleClose} style={styles.closeButtonInner}>
          <Ionicons name='close' size={24} color={DARK.text.secondary} />
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
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.header}
        >
          <View style={styles.diamondContainer}>
            <Animated.View style={[styles.glow, glowStyle]} />
            <Animated.View style={diamondStyle}>
              <LinearGradient
                colors={[DARK.accent.gold, '#B45309']}
                style={styles.diamondIcon}
              >
                <Ionicons name='diamond' size={48} color='#FFF' />
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={styles.title}>Unlock Your Full Potential</Text>
          <Text style={styles.subtitle}>
            Unlimited dreams, AI coaching, and advanced insights to accelerate
            your growth.
          </Text>

          {/* Trial Badge */}
          {isTrialEligible && trialDuration && (
            <Animated.View
              entering={FadeIn.delay(400)}
              style={styles.trialBadge}
            >
              <Ionicons name='gift' size={16} color={DARK.accent.gold} />
              <Text style={styles.trialBadgeText}>
                {trialDuration.toUpperCase()} FREE TRIAL
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Plans */}
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
              <ActivityIndicator color={DARK.accent.gold} />
              <Text style={styles.loadingText}>Loading premium plans...</Text>
            </View>
          )}
        </Animated.View>

        {/* Features */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(600)}
          style={styles.featuresSection}
        >
          <Text style={styles.sectionTitle}>What You Get</Text>
          <FeatureComparison />
        </Animated.View>

        {/* Guarantee */}
        <Animated.View
          entering={FadeInUp.delay(550)}
          style={styles.guaranteeCard}
        >
          <Ionicons
            name='shield-checkmark'
            size={24}
            color={DARK.accent.emerald}
          />
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>100% Money-Back Guarantee</Text>
            <Text style={styles.guaranteeText}>
              Not satisfied? Get a full refund within 7 days, no questions
              asked.
            </Text>
          </View>
        </Animated.View>

        {/* Testimonial */}
        <Animated.View
          entering={FadeInUp.delay(600)}
          style={styles.testimonialCard}
        >
          <FontAwesome6
            name='quote-left'
            size={24}
            color={DARK.accent.gold}
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

        {/* Restore */}
        <Pressable onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Already purchased? Restore</Text>
        </Pressable>

        <Text style={styles.legal}>
          Payment will be charged to your App Store or Google Play account.
          Subscription automatically renews unless cancelled at least 24 hours
          before the end of the current period.
        </Text>
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View
        entering={FadeInUp.delay(400)}
        style={[
          styles.bottomCTA,
          { paddingBottom: insets.bottom + SPACING.md },
        ]}
      >
        <BlurView intensity={80} tint='dark' style={StyleSheet.absoluteFill} />
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
                  ? [DARK.accent.gold, '#B45309']
                  : ['#333', '#444']
              }
              style={styles.purchaseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color='#FFF' />
              ) : (
                <>
                  <Ionicons name='diamond' size={20} color='#FFF' />
                  <Text style={styles.purchaseText}>{getCtaText()}</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={styles.cancelAnytime}>{getSubtitleText()}</Text>
        </View>
      </Animated.View>

      {/* Success Modal */}
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
  container: { flex: 1, backgroundColor: '#000' },

  glowSpot: {
    position: 'absolute',
    borderRadius: 150,
  },
  glowSpot1: {
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    backgroundColor: DARK.accent.gold,
    opacity: 0.15,
  },
  glowSpot2: {
    bottom: 0,
    right: -50,
    width: 300,
    height: 300,
    backgroundColor: DARK.accent.rose,
    opacity: 0.1,
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

  // Header
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
    backgroundColor: DARK.accent.gold,
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
    color: DARK.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: DARK.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Trial Badge
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  trialBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: DARK.accent.gold,
    letterSpacing: 0.5,
  },

  // Plans
  plansSection: { marginBottom: SPACING.xl, gap: SPACING.sm },
  loadingPlans: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  loadingText: { color: DARK.text.muted, fontFamily: FONTS.regular },

  // Features
  featuresSection: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: DARK.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },

  // Guarantee
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  guaranteeContent: { flex: 1 },
  guaranteeTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: DARK.accent.emerald,
    marginBottom: 4,
  },
  guaranteeText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: DARK.text.secondary,
    lineHeight: 18,
  },

  // Testimonial
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
    color: DARK.text.secondary,
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
    backgroundColor: DARK.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: 'bold', color: '#000' },
  testimonialName: { color: '#FFF', fontFamily: FONTS.semiBold, fontSize: 14 },
  testimonialRole: {
    color: DARK.accent.gold,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },

  // Restore
  restoreButton: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  restoreText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.tertiary,
    textDecorationLine: 'underline',
  },
  legal: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: DARK.text.muted,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 20,
  },

  // Bottom CTA
  bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0 },
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
  },
  purchaseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  purchaseText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFF' },
  cancelAnytime: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: DARK.text.muted,
    textAlign: 'center',
    marginTop: 12,
  },
})
