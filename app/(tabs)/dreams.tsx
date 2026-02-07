// app/(tabs)/dreams.tsx
import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  useAnimatedStyle,
  withSpring,
  Layout,
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'

import { Button } from '@/src/components/ui/Button'
import { useDreamStore } from '@/src/store/dreamStore'
import { useTheme } from '@/src/context/ThemeContext'
import {
  FONTS,
  SPACING,
  RADIUS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'
import {
  DREAM_CATEGORIES,
  DreamCategory,
} from '@/src/constants/dreamCategories'

const { width } = Dimensions.get('window')
const GAP = SPACING.md
const CARD_WIDTH = (width - SPACING.lg * 2 - GAP) / 2

const getCategoryById = (
  categoryId: string | null | undefined,
): DreamCategory => {
  if (!categoryId) return DREAM_CATEGORIES[0]
  return (
    DREAM_CATEGORIES.find((c) => c.id === categoryId) || DREAM_CATEGORIES[0]
  )
}

const BreathingBlob = ({ color, size, top, left, delay = 0 }: any) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.15)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, {
            duration: 8000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
        },
        style,
      ]}
    />
  )
}

const ActiveDreamCard = ({ dream, index, onPress, colors, isDark }: any) => {
  const category = getCategoryById(dream.category_id)
  const scale = useSharedValue(1)

  const progress =
    dream.total_actions > 0
      ? (dream.completed_actions ?? 0) / dream.total_actions
      : 0
  const percentage = Math.round(progress * 100)

  const handlePressIn = () => {
    scale.value = withSpring(0.96)
  }
  const handlePressOut = () => {
    scale.value = withSpring(1)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View
      entering={FadeInUp.delay(100 + index * 50).springify()}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.03)'
                : colors.surface,
            },
            animatedStyle,
          ]}
        >
          {isDark && Platform.OS === 'ios' && (
            <BlurView
              intensity={20}
              tint='dark'
              style={StyleSheet.absoluteFill}
            />
          )}

          <LinearGradient
            colors={[category.color + '20', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              styles.cardBorder,
              {
                borderColor: isDark ? category.color + '40' : colors.border,
              },
            ]}
          />

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: category.color + '20',
                    borderColor: category.color + '30',
                  },
                ]}
              >
                <Ionicons
                  name={category.icon.name as any}
                  size={18}
                  color={category.color}
                />
              </View>
              <View
                style={[styles.glowDot, { backgroundColor: category.color }]}
              />
            </View>

            <View style={styles.titleContainer}>
              <Text
                style={[styles.cardTitle, { color: colors.text }]}
                numberOfLines={3}
              >
                {dream.title}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.progressLabels}>
                <Text style={[styles.percentageText, { color: colors.text }]}>
                  {percentage}%
                </Text>
                <Text
                  style={[styles.stepsText, { color: colors.textTertiary }]}
                >
                  {dream.completed_actions}/{dream.total_actions}
                </Text>
              </View>

              <View
                style={[
                  styles.progressBarBg,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.max(percentage, 5)}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

function CompletedDreamCard({ dream, onPress, colors, isDark }: any) {
  const category = getCategoryById(dream.category_id)
  const completedDate = dream.completed_at
    ? new Date(dream.completed_at).toLocaleDateString()
    : 'Recently'

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.completedCard,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      {isDark && Platform.OS === 'ios' && (
        <BlurView intensity={10} tint='dark' style={StyleSheet.absoluteFill} />
      )}
      <View
        style={[
          styles.cardBorder,
          { borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border },
        ]}
      />

      <View style={styles.completedContent}>
        <View
          style={[
            styles.completedIcon,
            {
              backgroundColor: PALETTE.status.warning + '20',
              borderColor: PALETTE.status.warning,
            },
          ]}
        >
          <Ionicons name='trophy' size={18} color={PALETTE.status.warning} />
        </View>

        <View style={styles.completedInfo}>
          <Text
            style={[styles.completedDreamTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {dream.title}
          </Text>
          <Text style={[styles.completedDate, { color: colors.textTertiary }]}>
            Achieved on {completedDate}
          </Text>
        </View>

        <View
          style={[styles.miniBadge, { backgroundColor: category.color + '20' }]}
        >
          <Ionicons
            name={category.icon.name as any}
            size={10}
            color={category.color}
          />
        </View>
      </View>
    </Pressable>
  )
}

export default function DreamsScreen() {
  const insets = useSafeAreaInsets()
  const { colors, isDark } = useTheme()
  const { dreams, fetchDreams } = useDreamStore()
  const [refreshing, setRefreshing] = React.useState(false)

  useFocusEffect(
    useCallback(() => {
      fetchDreams()
    }, []),
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchDreams()
    setRefreshing(false)
  }

  const handleDreamPress = (dreamId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(`/(modals)/dream-detail?id=${dreamId}`)
  }

  const handleNewDream = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push('/(modals)/new-dream')
  }

  const activeDreams = dreams.filter((d) => d.status === 'active')
  const completedDreams = dreams.filter((d) => d.status === 'completed')

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={
            isDark
              ? [
                  PALETTE.midnight.obsidian,
                  PALETTE.midnight.slate,
                  PALETTE.midnight.obsidian,
                ]
              : [
                  colors.background,
                  colors.backgroundSecondary,
                  colors.background,
                ]
          }
          style={StyleSheet.absoluteFill}
        />
        {isDark && (
          <>
            <BreathingBlob
              color={PALETTE.electric.cyan}
              size={300}
              top={-80}
              left={-80}
            />
            <BreathingBlob
              color={PALETTE.electric.indigo}
              size={300}
              top={400}
              left={width - 150}
              delay={2000}
            />
          </>
        )}
      </View>

      <Animated.View
        entering={FadeInDown.duration(500)}
        style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}
      >
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            Your Missions
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {activeDreams.length} in progress · {completedDreams.length}{' '}
            achieved
          </Text>
        </View>

        <Pressable onPress={handleNewDream} style={styles.addButton}>
          <LinearGradient
            colors={GRADIENTS.electric}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name='add'
              size={24}
              color={isDark ? PALETTE.midnight.obsidian : '#FFF'}
            />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PALETTE.electric.cyan}
          />
        }
      >
        {activeDreams.length > 0 || completedDreams.length > 0 ? (
          <>
            <View style={styles.grid}>
              {activeDreams.map((dream, index) => (
                <ActiveDreamCard
                  key={dream.id}
                  dream={dream}
                  index={index}
                  onPress={() => handleDreamPress(dream.id)}
                  colors={colors}
                  isDark={isDark}
                />
              ))}
            </View>

            {completedDreams.length > 0 && (
              <Animated.View
                entering={FadeInUp.delay(300).duration(500)}
                style={styles.completedSection}
              >
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name='trophy'
                    size={16}
                    color={PALETTE.status.warning}
                  />
                  <Text
                    style={[
                      styles.completedTitle,
                      { color: PALETTE.status.warning },
                    ]}
                  >
                    Hall of Fame
                  </Text>
                </View>

                {completedDreams.map((dream) => (
                  <CompletedDreamCard
                    key={dream.id}
                    dream={dream}
                    onPress={() => handleDreamPress(dream.id)}
                    colors={colors}
                    isDark={isDark}
                  />
                ))}
              </Animated.View>
            )}
          </>
        ) : (
          <EmptyDreams
            onCreatePress={handleNewDream}
            colors={colors}
            isDark={isDark}
          />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  )
}

function EmptyDreams({
  onCreatePress,
  colors,
  isDark,
}: {
  onCreatePress: () => void
  colors: any
  isDark: boolean
}) {
  return (
    <View style={styles.emptyContainer}>
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={styles.emptyContent}
      >
        <View style={styles.emptyIcon}>
          <LinearGradient
            colors={[PALETTE.electric.indigo + '40', 'transparent']}
            style={styles.emptyIconGradient}
          >
            <Ionicons name='planet-outline' size={48} color={colors.text} />
          </LinearGradient>
        </View>

        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No missions active
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          "The future belongs to those who believe in the beauty of their
          dreams."
        </Text>

        <Button
          title='Design Your Future'
          onPress={onCreatePress}
          size='lg'
          icon={<Ionicons name='sparkles' size={18} color='#FFF' />}
          iconPosition='left'
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    shadowColor: PALETTE.electric.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: RADIUS.xl,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  glowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#FFF',
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  cardFooter: { gap: 8 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  percentageText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  stepsText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  completedSection: {
    marginTop: SPACING['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  completedTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  completedCard: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  completedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  completedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  completedInfo: { flex: 1 },
  completedDreamTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  completedDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  miniBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    maxWidth: '80%',
  },
})
