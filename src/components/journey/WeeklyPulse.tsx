// src/components/journey/WeeklyPulse.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { format, parseISO, isToday } from 'date-fns'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'
import { DayActivity } from '@/src/hooks/useJourneyStats'

interface WeeklyPulseProps {
  data: DayActivity[]
  totalCompleted: number
  completionRate: number
}

const BAR_MAX_HEIGHT = 80

export function WeeklyPulse({
  data,
  totalCompleted,
  completionRate,
}: WeeklyPulseProps) {
  const maxCompleted = Math.max(...data.map((d) => d.completed), 5)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>This Week's Pulse</Text>
          <Text style={styles.subtitle}>
            {totalCompleted} power moves · {completionRate}% rate
          </Text>
        </View>

        <View
          style={[
            styles.rateBadge,
            completionRate >= 70 && styles.rateBadgeHigh,
          ]}
        >
          <Ionicons
            name={completionRate >= 70 ? 'flame' : 'pulse'}
            size={14}
            color={
              completionRate >= 70 ? COLORS.accent[600] : COLORS.primary[600]
            }
          />
          <Text
            style={[
              styles.rateText,
              completionRate >= 70 && styles.rateTextHigh,
            ]}
          >
            {completionRate}%
          </Text>
        </View>
      </View>

      {/* Bar chart */}
      <View style={styles.chartContainer}>
        {data.map((day, index) => (
          <DayBar
            key={day.date}
            day={day}
            index={index}
            maxValue={maxCompleted}
          />
        ))}
      </View>
    </View>
  )
}

function DayBar({
  day,
  index,
  maxValue,
}: {
  day: DayActivity
  index: number
  maxValue: number
}) {
  const height = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const isActive = isToday(parseISO(day.date))
  const hasActivity = day.completed > 0

  const targetHeight = (day.completed / maxValue) * BAR_MAX_HEIGHT

  useEffect(() => {
    // Animate bar height
    height.value = withDelay(
      200 + index * 80,
      withSpring(targetHeight || 4, { damping: 12, stiffness: 100 }),
    )

    // Pulse animation for today
    if (isActive) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      )
    }
  }, [targetHeight, isActive])

  const barStyle = useAnimatedStyle(() => ({
    height: Math.max(height.value, 4),
  }))

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const dayName = format(parseISO(day.date), 'EEE')

  return (
    <View style={styles.barWrapper}>
      {/* Value label */}
      {hasActivity && <Text style={styles.barValue}>{day.completed}</Text>}

      {/* Bar */}
      <View style={styles.barContainer}>
        <Animated.View style={[styles.barBackground, barStyle]}>
          {hasActivity ? (
            <LinearGradient
              colors={
                isActive
                  ? [COLORS.primary[400], COLORS.primary[500]]
                  : [COLORS.secondary[300], COLORS.secondary[400]]
              }
              style={styles.barFill}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            />
          ) : (
            <View style={styles.emptyBar} />
          )}
        </Animated.View>

        {/* Today indicator */}
        {isActive && (
          <Animated.View style={[styles.todayDot, pulseStyle]}>
            <View style={styles.todayDotInner} />
          </Animated.View>
        )}
      </View>

      {/* Day label */}
      <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
        {isActive ? 'Today' : dayName}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rateBadgeHigh: {
    backgroundColor: COLORS.accent[50],
  },
  rateText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.primary[600],
  },
  rateTextHigh: {
    color: COLORS.accent[600],
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + 50,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  barContainer: {
    width: 28,
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barBackground: {
    width: 28,
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    flex: 1,
    borderRadius: 8,
  },
  emptyBar: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
  },
  todayDot: {
    position: 'absolute',
    bottom: -6,
  },
  todayDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary[500],
  },
  dayLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: SPACING.sm,
  },
  dayLabelActive: {
    color: COLORS.primary[500],
    fontFamily: FONTS.semiBold,
  },
})
