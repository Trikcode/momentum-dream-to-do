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
  withTiming,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

function getPeriodLabel(packageType: PACKAGE_TYPE): string {
  switch (packageType) {
    case PACKAGE_TYPE.MONTHLY:
      return 'Monthly'
    case PACKAGE_TYPE.ANNUAL:
      return 'Yearly'
    default:
      return 'Subscription'
  }
}

function getMonthlyEquivalent(pkg: PurchasesPackage): string | null {
  if (pkg.packageType === PACKAGE_TYPE.ANNUAL) {
    return `$${(pkg.product.price / 12).toFixed(2)}`
  }
  return null
}

function getSavings(pkg: PurchasesPackage): string | null {
  if (pkg.packageType === PACKAGE_TYPE.ANNUAL) return 'SAVE 40%'
  return null
}

function getTrialText(pkg: PurchasesPackage): string | null {
  if (pkg.product.introPrice) {
    const intro = pkg.product.introPrice
    return `${intro.periodNumberOfUnits} ${intro.periodUnit.toLowerCase()} free`
  }
  return null
}

interface PlanCardProps {
  pkg: PurchasesPackage
  isSelected: boolean
  isPopular?: boolean
  hasFreeTrial?: boolean
  onSelect: () => void
}

export function PlanCard({
  pkg,
  isSelected,
  isPopular,
  hasFreeTrial = false,
  onSelect,
}: PlanCardProps) {
  const scale = useSharedValue(1)
  const shimmer = useSharedValue(0)

  const price = pkg.product.priceString
  const period = getPeriodLabel(pkg.packageType)
  const perMonth = getMonthlyEquivalent(pkg)
  const savings = getSavings(pkg)
  const trialText = hasFreeTrial ? getTrialText(pkg) : null

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onSelect()
  }

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -200 + shimmer.value * 400 }],
  }))

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          isPopular && !isSelected && styles.cardPopular,
        ]}
      >
        {/* Popular Badge */}
        {isPopular && (
          <View style={styles.popularBadge}>
            <LinearGradient
              colors={[DARK.accent.gold, '#B45309']}
              style={styles.popularGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Animated.View style={[styles.shimmer, shimmerStyle]}>
                <LinearGradient
                  colors={[
                    'transparent',
                    'rgba(255,255,255,0.5)',
                    'transparent',
                  ]}
                  style={{ flex: 1 }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
              <Text style={styles.popularText}>BEST VALUE</Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.leftContent}>
            <Text style={styles.period}>{period}</Text>
            <View style={styles.badgesRow}>
              {savings && <Text style={styles.savings}>{savings}</Text>}
              {trialText && (
                <View style={styles.trialBadge}>
                  <Ionicons
                    name='gift-outline'
                    size={10}
                    color={DARK.accent.emerald}
                  />
                  <Text style={styles.trialText}>{trialText}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.price}>{price}</Text>
            {perMonth && <Text style={styles.perMonth}>{perMonth}/mo</Text>}
          </View>
        </View>

        {/* Selection Radio */}
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: DARK.accent.gold,
  },
  cardPopular: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  popularGradient: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  shimmer: { position: 'absolute', top: 0, bottom: 0, width: 50 },
  popularText: { fontSize: 10, fontWeight: 'bold', color: '#FFF' },

  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: SPACING.lg,
  },
  leftContent: {
    flex: 1,
  },
  period: { fontSize: 16, fontFamily: FONTS.bold, color: '#FFF' },

  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  savings: {
    fontSize: 12,
    color: DARK.accent.gold,
    fontFamily: FONTS.bold,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trialText: {
    fontSize: 10,
    color: DARK.accent.emerald,
    fontFamily: FONTS.medium,
    textTransform: 'capitalize',
  },

  price: { fontSize: 18, fontFamily: FONTS.bold, color: '#FFF' },
  perMonth: { fontSize: 12, color: DARK.text.secondary },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DARK.text.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: DARK.accent.gold,
    backgroundColor: DARK.accent.gold,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
})
