// src/components/premium/FeatureComparison.tsx
import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { COLORS, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { PREMIUM_FEATURES, PremiumFeature } from '@/src/store/premiumStore'

interface FeatureComparisonProps {
  compact?: boolean
}

export function FeatureComparison({ compact = false }: FeatureComparisonProps) {
  const displayFeatures = compact
    ? PREMIUM_FEATURES.slice(0, 4)
    : PREMIUM_FEATURES

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Features</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerLabel}>Free</Text>
          <LinearGradient
            colors={COLORS.gradients.primary as [string, string]}
            style={styles.premiumLabel}
          >
            <Ionicons name='diamond' size={12} color='#FFF' />
            <Text style={styles.premiumLabelText}>Premium</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Features */}
      {displayFeatures.map((feature, index) => (
        <Animated.View
          key={feature.id}
          entering={FadeInUp.delay(index * 100).duration(400)}
        >
          <FeatureRow feature={feature} />
        </Animated.View>
      ))}
    </View>
  )
}

function FeatureRow({ feature }: { feature: PremiumFeature }) {
  return (
    <View style={styles.row}>
      {/* Feature info */}
      <View style={styles.featureInfo}>
        <View
          style={[styles.featureIcon, { backgroundColor: COLORS.primary[100] }]}
        >
          <Ionicons
            name={feature.icon as any}
            size={18}
            color={COLORS.primary[600]}
          />
        </View>
        <View style={styles.featureText}>
          <Text style={styles.featureName}>{feature.name}</Text>
          <Text style={styles.featureDesc} numberOfLines={1}>
            {feature.description}
          </Text>
        </View>
      </View>

      {/* Comparison */}
      <View style={styles.comparison}>
        {/* Free */}
        <View style={styles.comparisonCell}>
          {feature.freeLimit === 'None' ? (
            <Ionicons name='close' size={18} color={COLORS.neutral[300]} />
          ) : (
            <Text style={styles.freeValue}>{feature.freeLimit}</Text>
          )}
        </View>

        {/* Premium */}
        <View style={styles.comparisonCell}>
          <View style={styles.premiumValue}>
            <Ionicons name='checkmark' size={16} color={COLORS.success[500]} />
            <Text style={styles.premiumValueText}>{feature.premiumValue}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    backgroundColor: COLORS.neutral[50],
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.neutral[400],
    width: 50,
    textAlign: 'center',
  },
  premiumLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumLabelText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#FFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[50],
  },
  featureInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.neutral[900],
  },
  featureDesc: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: 1,
  },
  comparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  comparisonCell: {
    width: 60,
    alignItems: 'center',
  },
  freeValue: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  premiumValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  premiumValueText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.success[700],
  },
})
