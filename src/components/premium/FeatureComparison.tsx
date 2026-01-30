// src/components/premium/FeatureComparison.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { PREMIUM_FEATURES } from '@/src/store/premiumStore'

export function FeatureComparison() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <Text style={styles.headerLabel}>Free</Text>
        <Text style={[styles.headerLabel, { color: DARK.accent.gold }]}>
          Pro
        </Text>
      </View>

      {PREMIUM_FEATURES.map((feature, i) => (
        <Animated.View
          key={i}
          entering={FadeInUp.delay(i * 50)}
          style={styles.row}
        >
          <View style={styles.featureInfo}>
            <Ionicons
              name={feature.icon as any}
              size={16}
              color={DARK.text.secondary}
            />
            <Text style={styles.featureName}>{feature.name}</Text>
          </View>

          <View style={styles.valCol}>
            {feature.freeLimit === 'None' ? (
              <Ionicons name='close' size={16} color={DARK.text.muted} />
            ) : (
              <Text style={styles.valText}>{feature.freeLimit}</Text>
            )}
          </View>

          <View style={styles.valCol}>
            <Ionicons name='checkmark' size={16} color={DARK.accent.gold} />
          </View>
        </Animated.View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 8,
  },
  headerLabel: {
    width: 60,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: DARK.text.secondary,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  featureInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureName: { fontSize: 13, fontFamily: FONTS.medium, color: '#FFF' },
  valCol: { width: 60, alignItems: 'center' },
  valText: { fontSize: 12, color: DARK.text.secondary },
})
