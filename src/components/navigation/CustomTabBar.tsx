import React, { useEffect } from 'react'
import { View, StyleSheet, Pressable, Dimensions } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'
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
import { DARK, SPACING, SPRING_CONFIGS } from '@/src/constants/theme'

// -----------------------------------------------------------------------------
// CONFIG
// -----------------------------------------------------------------------------

interface TabConfig {
  name: string
  icon: keyof typeof Ionicons.glyphMap
  iconFocused: keyof typeof Ionicons.glyphMap
  label: string
}

const TAB_CONFIG: Record<string, TabConfig> = {
  index: {
    name: 'index',
    icon: 'sunny-outline', // Updated icon (Sun = Today/Brightness)
    iconFocused: 'sunny',
    label: 'Today',
  },
  dreams: {
    name: 'dreams',
    icon: 'planet-outline',
    iconFocused: 'planet',
    label: 'Dreams',
  },
  journey: {
    name: 'journey',
    icon: 'map-outline',
    iconFocused: 'map',
    label: 'Journey',
  },
  profile: {
    name: 'profile',
    icon: 'person-outline',
    iconFocused: 'person',
    label: 'You',
  },
}

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <BlurView
        intensity={90}
        tint='dark'
        style={[styles.blurContainer, { paddingBottom: insets.bottom }]}
      >
        {/* Top Border Line for definition */}
        <View style={styles.topBorder} />

        <View style={styles.tabsRow}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index
            const tab = TAB_CONFIG[route.name]

            if (!tab) return null

            return (
              <TabButton
                key={route.key}
                tab={tab}
                isFocused={isFocused}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  })

                  if (!isFocused && !event.defaultPrevented) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    navigation.navigate(route.name)
                  }
                }}
              />
            )
          })}
        </View>
      </BlurView>
    </View>
  )
}

// -----------------------------------------------------------------------------
// INDIVIDUAL TAB BUTTON
// -----------------------------------------------------------------------------

function TabButton({
  tab,
  isFocused,
  onPress,
}: {
  tab: TabConfig
  isFocused: boolean
  onPress: () => void
}) {
  const scale = useSharedValue(1)
  const animValue = useSharedValue(0) // 0 to 1 based on focus

  useEffect(() => {
    animValue.value = withTiming(isFocused ? 1 : 0, { duration: 300 })
  }, [isFocused])

  const handlePressIn = () => {
    scale.value = withSpring(0.9, SPRING_CONFIGS.snappy)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIGS.snappy)
  }

  // Icon floats up slightly when active
  const animatedIconStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animValue.value, [0, 1], [0, -4])
    return {
      transform: [{ scale: scale.value }, { translateY }],
    }
  })

  // Dot scales up and gains opacity
  const dotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isFocused ? 1 : 0) }],
      opacity: animValue.value,
    }
  })

  // Active color logic
  const iconColor = isFocused ? '#FFFFFF' : 'rgba(255,255,255,0.4)'

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <View style={styles.innerContainer}>
        {/* Icon */}
        <Animated.View style={animatedIconStyle}>
          <Ionicons
            name={isFocused ? tab.iconFocused : tab.icon}
            size={26} // Slightly larger for tapability
            color={iconColor}
          />
        </Animated.View>

        {/* Active Dot Indicator */}
        <Animated.View style={[styles.activeDot, dotStyle]} />
      </View>
    </Pressable>
  )
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 100,
    elevation: 20, // Shadow for Android
  },
  blurContainer: {
    width: '100%',
    backgroundColor: 'rgba(10, 12, 16, 0.85)', // Dark semi-transparent
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12, // Comfortable touch area
    paddingHorizontal: SPACING.md,
    height: 60, // Fixed height for consistency
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: DARK.accent.rose,
    position: 'absolute',
    bottom: 4, // Positions the dot near the bottom of the tab area
    shadowColor: DARK.accent.rose,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
})
