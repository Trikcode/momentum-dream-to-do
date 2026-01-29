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
import { Ionicons } from '@expo/vector-icons'
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
import { PlanCard } from '@/src/components/premium/PlanCard'
import { FeatureComparison } from '@/src/components/premium/FeatureComparison'
import { SuccessModal } from '@/src/components/premium/SuccessModal'
import { Button } from '@/src/components/ui/Button'
import { usePremiumStore } from '@/src/store/premiumStore'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
import { useHaptics } from '@/src/hooks/useHaptics'

const { width, height } = Dimensions.get('window')

export default function PremiumScreen() {
  const insets = useSafeAreaInsets()
  const { trigger } = useHaptics()

  const {
    offerings,
    selectedPackage,
    isLoading,
    purchaseError,
    showSuccess,
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
    // Fetch offerings if not loaded
    if (!offerings) {
      fetchOfferings()
    }

    // Floating animation
    diamondFloat.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )

    // Glow pulse
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 }),
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

  // Auto-select yearly as default
  useEffect(() => {
    if (offerings?.availablePackages && !selectedPackage) {
      const yearlyPkg = offerings.availablePackages.find(
        (p) => p.packageType === PACKAGE_TYPE.ANNUAL,
      )
      if (yearlyPkg) {
        setSelectedPackage(yearlyPkg)
      } else if (offerings.availablePackages.length > 0) {
        setSelectedPackage(offerings.availablePackages[0])
      }
    }
  }, [offerings])

  const handlePurchase = async () => {
    if (!selectedPackage) return

    trigger('tap')
    const success = await purchasePackage(selectedPackage)

    if (success) {
      trigger('celebration')
    }
  }

  const handleRestore = async () => {
    trigger('tap')
    const success = await restorePurchases()

    if (success) {
      trigger('celebration')
    }
  }

  const handleClose = () => {
    setShowPaywall(false)
    router.back()
  }

  const handleSuccessDismiss = () => {
    setShowSuccess(false)
    setShowPaywall(false)
    router.back()
  }

  const diamondStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: diamondFloat.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value * 0.6,
  }))

  const packages = offerings?.availablePackages || []

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.primary[50], COLORS.background, COLORS.secondary[50]]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Close button */}
      <Animated.View
        entering={FadeIn.delay(300)}
        style={[styles.closeButton, { top: insets.top + SPACING.sm }]}
      >
        <Pressable onPress={handleClose} style={styles.closeButtonInner}>
          <Ionicons name='close' size={24} color={COLORS.neutral[600]} />
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.header}
        >
          {/* Diamond icon */}
          <View style={styles.diamondContainer}>
            <Animated.View style={[styles.glow, glowStyle]} />
            <Animated.View style={diamondStyle}>
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                style={styles.diamondIcon}
              >
                <Ionicons name='diamond' size={40} color='#FFF' />
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={styles.title}>Unlock Your Full Potential</Text>
          <Text style={styles.subtitle}>
            Go Premium and achieve your dreams faster with unlimited access to
            all features
          </Text>
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
                onSelect={() => setSelectedPackage(pkg)}
              />
            ))
          ) : (
            <View style={styles.loadingPlans}>
              <ActivityIndicator color={COLORS.primary[500]} />
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          )}
        </Animated.View>

        {/* Feature comparison */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(600)}
          style={styles.featuresSection}
        >
          <Text style={styles.sectionTitle}>What You'll Get</Text>
          <FeatureComparison />
        </Animated.View>

        {/* Testimonial */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.testimonialCard}
        >
          <View style={styles.testimonialQuote}>
            <Ionicons
              name='chatbubble-ellipses'
              size={24}
              color={COLORS.primary[400]}
            />
          </View>
          <Text style={styles.testimonialText}>
            "Momentum Premium helped me finally take action on my bucket list.
            I've traveled to 5 new countries this year!"
          </Text>
          <View style={styles.testimonialAuthor}>
            <View style={styles.testimonialAvatar}>
              <Text style={styles.testimonialAvatarText}>S</Text>
            </View>
            <View>
              <Text style={styles.testimonialName}>Sarah M.</Text>
              <Text style={styles.testimonialRole}>Premium Member</Text>
            </View>
          </View>
        </Animated.View>

        {/* Guarantee */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(600)}
          style={styles.guarantee}
        >
          <Ionicons
            name='shield-checkmark'
            size={24}
            color={COLORS.success[500]}
          />
          <View style={styles.guaranteeText}>
            <Text style={styles.guaranteeTitle}>
              7-Day Money Back Guarantee
            </Text>
            <Text style={styles.guaranteeDesc}>
              Not happy? Get a full refund within 7 days
            </Text>
          </View>
        </Animated.View>

        {/* Restore link */}
        <Pressable onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>

        {/* Legal */}
        <Text style={styles.legal}>
          Payment will be charged to your Apple/Google account at confirmation.
          Subscription automatically renews unless cancelled at least 24 hours
          before the end of the current period.
        </Text>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(600)}
        style={[
          styles.bottomCTA,
          { paddingBottom: insets.bottom + SPACING.md },
        ]}
      >
        <BlurView intensity={80} tint='light' style={styles.bottomBlur}>
          <Pressable
            onPress={handlePurchase}
            disabled={!selectedPackage || isLoading}
            style={styles.purchaseButton}
          >
            <LinearGradient
              colors={
                selectedPackage && !isLoading
                  ? (COLORS.gradients.primary as [string, string])
                  : [COLORS.neutral[300], COLORS.neutral[400]]
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
                  <Text style={styles.purchaseText}>
                    Start Premium {selectedPackage?.product.priceString}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={styles.cancelAnytime}>
            Cancel anytime · No commitments
          </Text>
        </BlurView>
      </Animated.View>

      {/* Success modal */}
      {showSuccess && <SuccessModal onDismiss={handleSuccessDismiss} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.md,
    zIndex: 100,
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  diamondContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD700',
  },
  diamondIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  plansSection: {
    marginBottom: SPACING.xl,
  },
  loadingPlans: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  featuresSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.neutral[900],
    marginBottom: SPACING.md,
  },
  testimonialCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  testimonialQuote: {
    marginBottom: SPACING.sm,
  },
  testimonialText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.neutral[700],
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary[600],
  },
  testimonialName: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.neutral[900],
  },
  testimonialRole: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  guarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.success[50],
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  guaranteeText: {
    flex: 1,
  },
  guaranteeTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.success[700],
  },
  guaranteeDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.success[600],
  },
  restoreButton: {
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  restoreText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary[500],
  },
  legal: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.neutral[400],
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: SPACING.xl,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBlur: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
  },
  purchaseButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  purchaseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
  },
  purchaseText: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#FFF',
  },
  cancelAnytime: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[400],
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
})
