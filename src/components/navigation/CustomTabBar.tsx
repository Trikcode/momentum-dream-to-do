import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  DARK,
  FONTS,
  SPACING,
  RADIUS,
  SPRING_CONFIGS,
} from '@/src/constants/theme'

interface TabConfig {
  name: string
  icon: keyof typeof Ionicons.glyphMap
  iconFocused: keyof typeof Ionicons.glyphMap
  label: string
}

const TAB_CONFIG: Record<string, TabConfig> = {
  index: {
    name: 'index',
    icon: 'flash-outline',
    iconFocused: 'flash',
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

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={30} tint='dark' style={styles.blurContainer}>
          <TabContent state={state} navigation={navigation} />
        </BlurView>
      ) : (
        <View style={[styles.blurContainer, styles.androidFallback]}>
          <TabContent state={state} navigation={navigation} />
        </View>
      )}
    </View>
  )
}

function TabContent({ state, navigation }: { state: any; navigation: any }) {
  return (
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
  )
}

interface TabButtonProps {
  tab: TabConfig
  isFocused: boolean
  onPress: () => void
}

function TabButton({ tab, isFocused, onPress }: TabButtonProps) {
  const scale = useSharedValue(1)
  const iconY = useSharedValue(0)

  useEffect(() => {
    if (isFocused) {
      iconY.value = withSpring(-2, SPRING_CONFIGS.bouncy)
    } else {
      iconY.value = withSpring(0)
    }
  }, [isFocused])

  const handlePressIn = () => {
    scale.value = withSpring(0.9, SPRING_CONFIGS.snappy)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIGS.snappy)
  }

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: iconY.value }],
  }))

  // Label fades in/out and moves slightly
  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0.5, { duration: 200 }),
    transform: [
      { translateY: withTiming(isFocused ? 0 : 2, { duration: 200 }) },
    ],
  }))

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <View style={styles.iconContainer}>
        {isFocused && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.activePill}
          >
            <LinearGradient
              colors={DARK.gradients.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        <Animated.View style={animatedIconStyle}>
          <Ionicons
            name={isFocused ? tab.iconFocused : tab.icon}
            size={22}
            color={isFocused ? '#FFF' : DARK.text.secondary}
          />
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.label,
          animatedLabelStyle,
          isFocused && styles.labelFocused,
        ]}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    // Ensure this sits above everything else
    zIndex: 100,
    elevation: 20,
  },
  blurContainer: {
    width: '100%',
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: 'rgba(0,0,0,0.3)', // Fallback tint for blur
  },
  androidFallback: {
    backgroundColor: '#1E232E',
    opacity: 0.98,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12, // Fixed height padding
    paddingHorizontal: SPACING.xs,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    ...DARK.glow.rose,
  },
  label: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: DARK.text.secondary,
  },
  labelFocused: {
    color: '#FFF',
    fontFamily: FONTS.semiBold,
  },
})
