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
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { format, parseISO, isToday } from 'date-fns'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
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
          <Text style={styles.title}>Weekly Pulse</Text>
          <Text style={styles.subtitle}>
            {totalCompleted} power moves · {completionRate}% rate
          </Text>
        </View>

        <View
          style={[
            styles.rateBadge,
            {
              backgroundColor:
                completionRate >= 70
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(244, 63, 94, 0.15)',
            },
          ]}
        >
          <Ionicons
            name={completionRate >= 70 ? 'flame' : 'pulse'}
            size={14}
            color={completionRate >= 70 ? DARK.accent.gold : DARK.accent.rose}
          />
          <Text
            style={[
              styles.rateText,
              {
                color:
                  completionRate >= 70 ? DARK.accent.gold : DARK.accent.rose,
              },
            ]}
          >
            {completionRate}%
          </Text>
        </View>
      </View>

      {/* Chart */}
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
  const isActive = isToday(parseISO(day.date))
  const hasActivity = day.completed > 0
  const targetHeight = (day.completed / maxValue) * BAR_MAX_HEIGHT

  useEffect(() => {
    height.value = withDelay(200 + index * 50, withSpring(targetHeight || 4))
  }, [targetHeight])

  const barStyle = useAnimatedStyle(() => ({
    height: Math.max(height.value, 4),
  }))

  const dayName = format(parseISO(day.date), 'EEE')

  return (
    <View style={styles.barWrapper}>
      {hasActivity && <Text style={styles.barValue}>{day.completed}</Text>}

      <View style={styles.barContainer}>
        <Animated.View style={[styles.barBackground, barStyle]}>
          {hasActivity ? (
            <LinearGradient
              colors={
                isActive
                  ? (DARK.gradients.primary as [string, string])
                  : ['#475569', '#334155']
              }
              style={styles.barFill}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            />
          ) : (
            <View style={styles.emptyBar} />
          )}
        </Animated.View>

        {isActive && <View style={styles.todayIndicator} />}
      </View>

      <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
        {isActive ? 'Today' : dayName}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: DARK.text.primary,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: DARK.text.secondary,
    marginTop: 2,
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rateText: { fontFamily: FONTS.bold, fontSize: 12 },

  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + 40,
  },
  barWrapper: { alignItems: 'center', flex: 1 },
  barValue: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: DARK.text.secondary,
    marginBottom: 4,
  },
  barContainer: {
    width: 24,
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barBackground: { width: '100%', borderRadius: 6, overflow: 'hidden' },
  barFill: { flex: 1 },
  emptyBar: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' },

  todayIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: DARK.accent.rose,
  },
  dayLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: DARK.text.tertiary,
    marginTop: 8,
  },
  dayLabelActive: { color: DARK.accent.rose, fontFamily: FONTS.bold },
})
