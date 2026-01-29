import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'

export function OfflineBar() {
  const [isOffline, setIsOffline] = useState(false)
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(-50)
  const pulse = useSharedValue(1)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOffline(!state.isConnected)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (isOffline) {
      translateY.value = withSpring(0, { damping: 15 })
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      )
    } else {
      translateY.value = withSpring(-50, { damping: 15 })
    }
  }, [isOffline])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: pulse.value }],
  }))

  if (!isOffline) return null

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top + SPACING.xs },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <Ionicons name='cloud-offline' size={18} color='#FFF' />
        <Text style={styles.text}>No internet connection</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.neutral[800],
    zIndex: 9998,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#FFF',
  },
})
