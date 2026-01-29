// src/components/navigation/CustomTabBar.tsx
import React from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  COLORS,
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  SPRING_CONFIGS,
} from '@/src/constants/theme'

const { width } = Dimensions.get('window')

interface TabConfig {
  name: string
  icon: keyof typeof Ionicons.glyphMap
  iconFocused: keyof typeof Ionicons.glyphMap
  label: string
}

const TABS: TabConfig[] = [
  {
    name: 'index',
    icon: 'flash-outline',
    iconFocused: 'flash',
    label: 'Today',
  },
  {
    name: 'dreams',
    icon: 'planet-outline',
    iconFocused: 'planet',
    label: 'Dreams',
  },
  {
    name: 'journey',
    icon: 'map-outline',
    iconFocused: 'map',
    label: 'Journey',
  },
  {
    name: 'profile',
    icon: 'person-outline',
    iconFocused: 'person',
    label: 'You',
  },
]

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint='light' style={styles.blur}>
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index
            const tab = TABS[index]

            if (!tab) return null

            return (
              <TabButton
                key={route.key}
                tab={tab}
                isFocused={isFocused}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  navigation.navigate(route.name)
                }}
              />
            )
          })}
        </View>
      </BlurView>
    </View>
  )
}

interface TabButtonProps {
  tab: TabConfig
  isFocused: boolean
  onPress: () => void
}

function TabButton({ tab, isFocused, onPress }: TabButtonProps) {
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)

  const handlePressIn = () => {
    scale.value = withSpring(0.9, SPRING_CONFIGS.snappy)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIGS.snappy)
  }

  React.useEffect(() => {
    if (isFocused) {
      translateY.value = withSpring(-2, SPRING_CONFIGS.snappy)
    } else {
      translateY.value = withSpring(0, SPRING_CONFIGS.snappy)
    }
  }, [isFocused])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        {isFocused ? (
          <LinearGradient
            colors={COLORS.gradients.primary as [string, string]}
            style={styles.activeBackground}
          >
            <Ionicons name={tab.iconFocused} size={22} color='#FFF' />
          </LinearGradient>
        ) : (
          <View style={styles.inactiveIcon}>
            <Ionicons name={tab.icon} size={22} color={COLORS.neutral[400]} />
          </View>
        )}

        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  blur: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    ...SHADOWS.lg,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  activeBackground: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow(COLORS.primary[500]),
  },
  inactiveIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.neutral[400],
  },
  tabLabelActive: {
    color: COLORS.primary[600],
    fontFamily: FONTS.semiBold,
  },
})
