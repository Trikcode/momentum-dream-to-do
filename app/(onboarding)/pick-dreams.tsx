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
import { useTheme } from '@/src/context/ThemeContext'
import {
  FONTS,
  SPACING,
  RADIUS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'

const { width, height } = Dimensions.get('window')
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / 2

const CATEGORIES = [
  {
    id: 'health',
    label: 'Fitness & Health',
    icon: 'fitness',
    color: '#F43F5E',
    desc: 'Energy & Vitality',
  },
  {
    id: 'career',
    label: 'Career & Biz',
    icon: 'briefcase',
    color: '#3B82F6',
    desc: 'Growth & Impact',
  },
  {
    id: 'wealth',
    label: 'Wealth',
    icon: 'wallet',
    color: '#F59E0B',
    desc: 'Financial Freedom',
  },
  {
    id: 'mind',
    label: 'Mindfulness',
    icon: 'leaf',
    color: '#10B981',
    desc: 'Inner Peace',
  },
  {
    id: 'skills',
    label: 'New Skills',
    icon: 'school',
    color: '#8B5CF6',
    desc: 'Learning & Mastery',
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: 'airplane',
    color: '#06B6D4',
    desc: 'Exploration',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    icon: 'heart',
    color: '#EC4899',
    desc: 'Deep Connection',
  },
  {
    id: 'creativity',
    label: 'Creativity',
    icon: 'color-palette',
    color: '#F97316',
    desc: 'Art & Expression',
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
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
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
            duration: 8000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
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
          opacity: 0.3,
        },
        style,
      ]}
    />
  )
}

const DreamCard = ({ item, isSelected, onToggle, index }: any) => {
  const scale = useSharedValue(1)
  const progress = useSharedValue(isSelected ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    })
  }, [isSelected])

  const animatedCardStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(255,255,255,0.08)', item.color],
    )
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(20, 20, 30, 0.4)', 'rgba(20, 20, 30, 0.8)'],
    )

    return {
      transform: [{ scale: scale.value }],
      borderColor,
      backgroundColor,
    }
  })

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.15]) }],
    opacity: interpolate(progress.value, [0, 1], [0.6, 1]),
  }))

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [PALETTE.slate[400], '#FFF'],
    ),
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.96)
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
      <Animated.View style={[styles.card, animatedCardStyle]}>
        <Animated.View style={[styles.cardGlow, { opacity: progress }]}>
          <LinearGradient
            colors={[item.color, 'transparent']}
            style={[StyleSheet.absoluteFill, { opacity: 0.15 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        <View style={styles.cardHeader}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                borderColor: isSelected ? item.color : 'rgba(255,255,255,0.1)',
                backgroundColor: isSelected
                  ? item.color + '20'
                  : 'rgba(255,255,255,0.03)',
              },
            ]}
          >
            <Animated.View style={iconStyle}>
              <Ionicons
                name={item.icon}
                size={22}
                color={isSelected ? item.color : 'rgba(255,255,255,0.6)'}
              />
            </Animated.View>
          </Animated.View>

          {isSelected && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={[styles.checkBadge, { backgroundColor: item.color }]}
            >
              <Ionicons name='checkmark' size={10} color='#FFF' />
            </Animated.View>
          )}
        </View>

        <View>
          <Animated.Text style={[styles.cardLabel, textStyle]}>
            {item.label}
          </Animated.Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>
        </View>
      </Animated.View>
    </Pressable>
  )
}

export default function PickDreamsScreen() {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  const [selected, setSelected] = useState<string[]>([])

  const toggleSelection = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (prev.length >= 3) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.push({
      pathname: '/(onboarding)/first-dream',
      params: { categories: selected.join(',') },
    })
  }

  return (
    <View
      style={[styles.container, { backgroundColor: PALETTE.midnight.obsidian }]}
    >
      <StatusBar barStyle='light-content' />

      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: PALETTE.midnight.obsidian }} />
        <LinearGradient
          colors={[
            PALETTE.midnight.obsidian,
            PALETTE.midnight.slate,
            PALETTE.midnight.obsidian,
          ]}
          style={StyleSheet.absoluteFill}
        />
        <BreathingBlob
          color={PALETTE.electric.cyan}
          size={300}
          top={-60}
          left={-100}
        />

        {Platform.OS === 'ios' && (
          <BlurView
            intensity={40}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack} />
          <Animated.View
            style={[
              styles.progressFill,
              { width: '33%', backgroundColor: PALETTE.electric.cyan },
            ]}
          />
        </View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.headerTitle}>
            Where will you{'\n'}
            <Text style={{ color: PALETTE.electric.emerald }}>
              direct your power?
            </Text>
          </Text>
          <Text style={[styles.headerSubtitle, { color: PALETTE.slate[400] }]}>
            Select up to 3 focus areas to start.
          </Text>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {CATEGORIES.map((cat, index) => (
            <Animated.View
              key={cat.id}
              entering={FadeInDown.delay(300 + index * 40).springify()}
            >
              <DreamCard
                item={cat}
                index={index}
                isSelected={selected.includes(cat.id)}
                onToggle={() => toggleSelection(cat.id)}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <Animated.View
        entering={FadeInDown.delay(800).springify()}
        style={[styles.floatingDockContainer, { bottom: insets.bottom + 10 }]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={50}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.dockBorder} />

        <View style={styles.dockInner}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              <Text
                style={{
                  color: selected.length > 0 ? PALETTE.electric.cyan : '#666',
                  fontFamily: FONTS.bold,
                }}
              >
                {selected.length}
              </Text>
              <Text style={{ color: '#666' }}> / 3</Text>
            </Text>
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={selected.length === 0}
            style={[
              styles.dockButton,
              { opacity: selected.length === 0 ? 0.5 : 1 },
            ]}
          >
            <LinearGradient
              colors={
                selected.length > 0 ? GRADIENTS.electric : ['#333', '#444']
              }
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
            <Text style={styles.dockButtonText}>Confirm Focus</Text>
            <Ionicons name='arrow-forward' size={16} color='#FFF' />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    zIndex: 10,
  },
  progressContainer: {
    height: 4,
    width: 60,
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  progressTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: '#FFF',
    lineHeight: 36,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
  gridContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.25,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.md,
    justifyContent: 'space-between',
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 14,
  },
  floatingDockContainer: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    height: 64,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  dockBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
  },
  dockInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  counterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: RADIUS.full,
  },
  counterText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  dockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 44,
    borderRadius: RADIUS.full,
    gap: 8,
    overflow: 'hidden',
  },
  dockButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
})
