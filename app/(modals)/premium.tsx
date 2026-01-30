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

// Components
import { PlanCard } from '@/src/components/premium/PlanCard'
import { FeatureComparison } from '@/src/components/premium/FeatureComparison'
import { SuccessModal } from '@/src/components/premium/SuccessModal'
import { usePremiumStore } from '@/src/store/premiumStore'
import { DARK, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
import * as Haptics from 'expo-haptics'

// Mocking useHaptics for now if not available, or import it
const triggerHaptic = (type: string) => {
  if (type === 'celebration')
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

const { width } = Dimensions.get('window')

export default function PremiumScreen() {
  const insets = useSafeAreaInsets()

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
    if (purchaseError)
      Alert.alert('Error', purchaseError, [{ text: 'OK', onPress: clearError }])
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
    triggerHaptic('tap')
    const success = await purchasePackage(selectedPackage)
    if (success) triggerHaptic('celebration')
  }

  const handleRestore = async () => {
    triggerHaptic('tap')
    const success = await restorePurchases()
    if (success) triggerHaptic('celebration')
  }

  const handleClose = () => {
    setShowPaywall(false)
    router.back()
  }

  const diamondStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: diamondFloat.value }],
  }))
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowPulse.value }))

  const packages = offerings?.availablePackages || []

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: '#000' }} />
        <LinearGradient
          colors={['#1F1205', '#000', '#1F0510']} // Deep Gold/Dark/Deep Rose
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Glow Spots */}
        <View
          style={{
            position: 'absolute',
            top: -100,
            left: -50,
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: DARK.accent.gold,
            opacity: 0.15,
            filter: 'blur(80px)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: DARK.accent.rose,
            opacity: 0.1,
            filter: 'blur(80px)',
          }}
        />
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
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 120 },
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

          <Text style={styles.title}>Unlock Limitless Potential</Text>
          <Text style={styles.subtitle}>
            Unlimited dreams, AI coaching, and advanced insights to accelerate
            your growth.
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

        {/* Testimonial */}
        <Animated.View
          entering={FadeInUp.delay(600)}
          style={styles.testimonialCard}
        >
          <FontAwesome6
            name='quote-outline'
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
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>

        <Text style={styles.legal}>
          Recurring billing. Cancel anytime in settings.
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
                  <Text style={styles.purchaseText}>
                    Start Premium {selectedPackage?.product.priceString}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
          <Text style={styles.cancelAnytime}>7-day money-back guarantee</Text>
        </View>
      </Animated.View>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
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
  closeButton: { position: 'absolute', right: SPACING.md, zIndex: 100 },
  closeButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    backgroundColor: DARK.accent.gold,
    filter: 'blur(40px)',
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
    fontSize: 28,
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

  plansSection: { marginBottom: SPACING.xl },
  loadingPlans: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.md },
  loadingText: { color: DARK.text.muted },

  featuresSection: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: DARK.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },

  testimonialCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
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
  testimonialName: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  testimonialRole: { color: DARK.accent.gold, fontSize: 12 },

  restoreButton: {
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  restoreText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: DARK.text.tertiary,
  },
  legal: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: DARK.text.muted,
    textAlign: 'center',
    marginBottom: 20,
  },

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
    ...DARK.glow.gold,
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
