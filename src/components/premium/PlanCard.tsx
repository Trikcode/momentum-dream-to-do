// src/components/premium/PlanCard.tsx
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

// (Helper functions getPeriodLabel, getMonthlyEquivalent, getSavings remain the same)
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
  const shimmer = useSharedValue(0)

  const price = pkg.product.priceString
  const period = getPeriodLabel(pkg.packageType)
  const perMonth = getMonthlyEquivalent(pkg)
  const savings = getSavings(pkg)

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
          <View>
            <Text style={styles.period}>{period}</Text>
            {savings && <Text style={styles.savings}>{savings}</Text>}
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
    backgroundColor: 'rgba(245, 158, 11, 0.1)', // Gold tint
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
  period: { fontSize: 16, fontFamily: FONTS.bold, color: '#FFF' },
  savings: {
    fontSize: 12,
    color: DARK.accent.gold,
    marginTop: 2,
    fontFamily: FONTS.bold,
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
