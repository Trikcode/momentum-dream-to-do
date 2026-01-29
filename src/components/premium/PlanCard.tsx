import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'

interface PlanCardProps {
  pkg: PurchasesPackage
  isSelected: boolean
  isPopular?: boolean
  onSelect: () => void
}

export function PlanCard({
  pkg,
  isSelected,
  isPopular,
  onSelect,
}: PlanCardProps) {
  const scale = useSharedValue(1)
  const borderOpacity = useSharedValue(0)
  const shimmer = useSharedValue(0)

  // Parse package info
  const { product } = pkg
  const price = product.priceString
  const period = getPeriodLabel(pkg.packageType)
  const perMonth = getMonthlyEquivalent(pkg)
  const savings = getSavings(pkg)

  useEffect(() => {
    if (isSelected) {
      borderOpacity.value = withSpring(1)
      scale.value = withSequence(withSpring(1.02), withSpring(1))
    } else {
      borderOpacity.value = withSpring(0)
    }
  }, [isSelected])

  useEffect(() => {
    if (isPopular) {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false,
      )
    }
  }, [isPopular])

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onSelect()
  }

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }))

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -200 + shimmer.value * 400 }],
  }))

  const isMonthly = pkg.packageType === PACKAGE_TYPE.MONTHLY

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.View style={[styles.selectionBorder, borderStyle]}>
          <LinearGradient
            colors={COLORS.gradients.primary as [string, string]}
            style={styles.borderGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Card content */}
        <View style={[styles.card, isSelected && styles.cardSelected]}>
          {/* Popular badge */}
          {isPopular && (
            <View style={styles.popularBadge}>
              <LinearGradient
                colors={COLORS.gradients.accent as [string, string]}
                style={styles.popularGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Animated.View style={[styles.shimmer, shimmerStyle]}>
                  <LinearGradient
                    colors={[
                      'transparent',
                      'rgba(255,255,255,0.4)',
                      'transparent',
                    ]}
                    style={styles.shimmerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </Animated.View>
                <Ionicons name='star' size={12} color='#FFF' />
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </LinearGradient>
            </View>
          )}

          {/* Main content */}
          <View style={styles.content}>
            {/* Period */}
            <Text style={styles.period}>{period}</Text>

            {/* Price */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{price}</Text>
              {perMonth && !isMonthly && (
                <Text style={styles.perMonth}>{perMonth}/mo</Text>
              )}
            </View>

            {savings && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save {savings}</Text>
              </View>
            )}
          </View>

          {/* Selection indicator */}
          <View
            style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
          >
            {isSelected && (
              <LinearGradient
                colors={COLORS.gradients.primary as [string, string]}
                style={styles.radioInner}
              >
                <Ionicons name='checkmark' size={14} color='#FFF' />
              </LinearGradient>
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  )
}

function getPeriodLabel(packageType: PACKAGE_TYPE): string {
  switch (packageType) {
    case PACKAGE_TYPE.MONTHLY:
      return 'Monthly'
    case PACKAGE_TYPE.ANNUAL:
      return 'Yearly'
    case PACKAGE_TYPE.LIFETIME:
      return 'Lifetime'
    case PACKAGE_TYPE.WEEKLY:
      return 'Weekly'
    case PACKAGE_TYPE.TWO_MONTH:
      return '2 Months'
    case PACKAGE_TYPE.THREE_MONTH:
      return '3 Months'
    case PACKAGE_TYPE.SIX_MONTH:
      return '6 Months'
    default:
      return 'Subscription'
  }
}

function getMonthlyEquivalent(pkg: PurchasesPackage): string | null {
  const { product, packageType } = pkg

  if (packageType === PACKAGE_TYPE.ANNUAL) {
    const yearlyPrice = product.price
    const monthlyEquiv = yearlyPrice / 12
    return `$${monthlyEquiv.toFixed(2)}`
  }

  return null
}

function getSavings(pkg: PurchasesPackage): string | null {
  if (pkg.packageType === PACKAGE_TYPE.ANNUAL) {
    return '40%'
  }
  return null
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  selectionBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: RADIUS.xl + 2,
    overflow: 'hidden',
  },
  borderGradient: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
  },
  cardSelected: {
    borderColor: 'transparent',
    backgroundColor: COLORS.primary[50],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: SPACING.lg,
    overflow: 'hidden',
    borderRadius: 8,
    ...SHADOWS.sm,
  },
  popularGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 200,
  },
  shimmerGradient: {
    flex: 1,
    width: 200,
  },
  popularText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#FFF',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  period: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.neutral[900],
  },
  perMonth: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  savingsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: SPACING.xs,
  },
  savingsText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.success[700],
  },
  radioOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary[500],
  },
  radioInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
