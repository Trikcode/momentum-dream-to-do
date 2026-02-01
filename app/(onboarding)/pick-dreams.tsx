import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeIn,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const { width, height } = Dimensions.get('window')
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / 2

const CATEGORIES = [
  {
    id: 'health',
    label: 'Fitness & Health',
    icon: 'fitness',
    color: '#F43F5E',
  },
  { id: 'career', label: 'Career & Biz', icon: 'briefcase', color: '#3B82F6' },
  { id: 'wealth', label: 'Wealth', icon: 'wallet', color: '#F59E0B' },
  { id: 'mind', label: 'Mindfulness', icon: 'leaf', color: '#10B981' },
  { id: 'skills', label: 'New Skills', icon: 'school', color: '#8B5CF6' },
  { id: 'travel', label: 'Travel', icon: 'airplane', color: '#06B6D4' },
  {
    id: 'relationships',
    label: 'Relationships',
    icon: 'heart',
    color: '#EC4899',
  },
  {
    id: 'creativity',
    label: 'Creativity',
    icon: 'color-palette',
    color: '#F97316',
  },
]

const BreathingBlob = ({ color, size, top, left, delay = 0 }: any) => {
  const scale = useSharedValue(1)
  const translateY = useSharedValue(0)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, {
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, {
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.4,
        },
        style,
      ]}
    />
  )
}

// ============================================================================
// COMPONENT: CATEGORY CARD
// ============================================================================
const CategoryCard = ({ item, isSelected, onToggle, index }: any) => {
  const scale = useSharedValue(1)
  const selectionProgress = useSharedValue(isSelected ? 1 : 0)

  useEffect(() => {
    selectionProgress.value = withTiming(isSelected ? 1 : 0, { duration: 300 })
  }, [isSelected])

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      selectionProgress.value,
      [0, 1],
      ['rgba(255,255,255,0.1)', item.color],
    )

    const bgOpacity = interpolate(selectionProgress.value, [0, 1], [0.03, 0.15])

    return {
      transform: [{ scale: scale.value }],
      borderColor,
      backgroundColor: `rgba(255,255,255, ${bgOpacity})`,
    }
  })

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(selectionProgress.value, [0, 1], [0.5, 1]),
    transform: [
      { scale: interpolate(selectionProgress.value, [0, 1], [1, 1.1]) },
    ],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.95)
  }
  const handlePressOut = () => {
    scale.value = withSpring(1)
  }

  return (
    <Pressable
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Glow Background when selected */}
        {isSelected && (
          <View style={[styles.cardGlow, { backgroundColor: item.color }]} />
        )}

        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isSelected
                ? item.color
                : 'rgba(255,255,255,0.05)',
            },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={24}
            color={isSelected ? '#FFF' : item.color}
          />
        </View>

        <Animated.Text style={[styles.cardLabel, iconStyle]}>
          {item.label}
        </Animated.Text>

        {/* Checkmark Badge */}
        {isSelected && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[styles.checkBadge, { backgroundColor: item.color }]}
          >
            <Ionicons name='checkmark' size={12} color='#FFF' />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  )
}

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function PickDreamsScreen() {
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (prev.length >= 3) return [...prev.slice(1), id] // Replace oldest
      return [...prev, id]
    })
  }

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // Pass real data in production
    router.push({
      pathname: '/(onboarding)/first-dream',
      params: { categories: selected.join(',') },
    })
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
        <BreathingBlob
          color={DARK.accent.rose}
          size={300}
          top={-50}
          left={-100}
        />
        <BreathingBlob
          color='#3B82F6'
          size={250}
          top={height * 0.4}
          left={width * 0.6}
          delay={1000}
        />
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={60}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      {/* HEADER */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.headerTitle}>
            Focus your <Text style={{ color: DARK.accent.gold }}>energy</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Select up to 3 areas to transform.
          </Text>
        </Animated.View>
      </View>

      {/* GRID */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {CATEGORIES.map((cat, index) => (
            <Animated.View
              key={cat.id}
              entering={FadeInDown.delay(300 + index * 50).springify()}
            >
              <CategoryCard
                item={cat}
                index={index}
                isSelected={selected.includes(cat.id)}
                onToggle={() => toggleSelection(cat.id)}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM DOCK */}
      <Animated.View
        entering={FadeInDown.delay(800)}
        style={[styles.bottomDock, { paddingBottom: insets.bottom + 10 }]}
      >
        <BlurView intensity={80} tint='dark' style={StyleSheet.absoluteFill} />
        <View style={styles.dockBorder} />

        <View style={styles.dockContent}>
          <View style={styles.selectionCount}>
            <Text style={styles.countText}>
              <Text style={{ color: DARK.accent.rose, fontFamily: FONTS.bold }}>
                {selected.length}
              </Text>{' '}
              / 3 selected
            </Text>
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={selected.length === 0}
            style={[
              styles.continueButton,
              { opacity: selected.length === 0 ? 0.5 : 1 },
            ]}
          >
            <LinearGradient
              colors={
                selected.length > 0
                  ? (DARK.gradients.primary as [string, string])
                  : ['#333', '#444']
              }
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Text style={styles.buttonText}>Continue</Text>
            <Ionicons name='arrow-forward' size={18} color='#FFF' />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  )
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },

  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    zIndex: 10,
  },
  progressBar: {
    height: 4,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '30%', // Step 1
    backgroundColor: DARK.accent.rose,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: DARK.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: DARK.text.secondary,
  },

  // Grid
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 140, // Space for dock
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: DARK.text.primary,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Dock
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
  },
  dockBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  selectionCount: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  countText: {
    color: DARK.text.secondary,
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING['xl'],
    height: 50,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    gap: 8,
    ...DARK.glow.rose,
  },
  buttonText: {
    color: '#FFF',
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
})
