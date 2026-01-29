// src/components/premium/PremiumBadge.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { COLORS, FONTS, SPACING, SHADOWS } from '@/src/constants/theme'
import { usePremiumStore } from '@/src/store/premiumStore'

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  onPress?: () => void
}

export function PremiumBadge({
  size = 'md',
  showLabel = true,
  onPress,
}: PremiumBadgeProps) {
  const { isPremium } = usePremiumStore()
  const shimmer = useSharedValue(0)

  const sizeConfig = {
    sm: { badge: 24, icon: 12, font: 10, padding: 4 },
    md: { badge: 32, icon: 16, font: 12, padding: 6 },
    lg: { badge: 44, icon: 22, font: 14, padding: 8 },
  }

  const config = sizeConfig[size]

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    )
  }, [])

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -50 + shimmer.value * 100 }],
  }))

  if (!isPremium) {
    return (
      <Pressable onPress={onPress}>
        <View style={[styles.freeBadge, { padding: config.padding }]}>
          <Ionicons
            name='lock-closed'
            size={config.icon}
            color={COLORS.neutral[400]}
          />
          {showLabel && (
            <Text style={[styles.freeText, { fontSize: config.font }]}>
              Upgrade
            </Text>
          )}
        </View>
      </Pressable>
    )
  }

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <LinearGradient
        colors={['#FFD700', '#FFA500', '#FF8C00']}
        style={[
          styles.premiumBadge,
          {
            height: config.badge,
            paddingHorizontal: config.padding + 4,
            borderRadius: config.badge / 2,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Shimmer effect */}
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
            style={styles.shimmerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>

        <Ionicons name='diamond' size={config.icon} color='#FFF' />
        {showLabel && (
          <Text style={[styles.premiumText, { fontSize: config.font }]}>
            PREMIUM
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 20,
  },
  freeText: {
    fontFamily: FONTS.medium,
    color: COLORS.neutral[500],
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 50,
  },
  shimmerGradient: {
    flex: 1,
    width: 50,
  },
  premiumText: {
    fontFamily: FONTS.bold,
    color: '#FFF',
    letterSpacing: 1,
  },
})
