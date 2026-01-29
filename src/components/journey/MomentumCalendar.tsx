// src/components/journey/MomentumCalendar.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  FadeIn,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { format, parseISO, isToday } from 'date-fns'
import { COLORS, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { MonthHeatmap } from '@/src/hooks/useJourneyStats'

interface MomentumCalendarProps {
  data: MonthHeatmap[]
  onDayPress?: (date: string, completed: number) => void
}

const CELL_SIZE = 14
const CELL_GAP = 3
const ROWS = 7 // Days of week

export function MomentumCalendar({ data, onDayPress }: MomentumCalendarProps) {
  // Group data into weeks (columns)
  const weeks: MonthHeatmap[][] = []
  let currentWeek: MonthHeatmap[] = []

  data.forEach((day, index) => {
    const dayOfWeek = parseISO(day.date).getDay()

    // Start new week on Sunday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    currentWeek.push(day)

    if (index === data.length - 1) {
      weeks.push(currentWeek)
    }
  })

  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(500)}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Momentum Map</Text>
        <View style={styles.legend}>
          <Text style={styles.legendLabel}>Less</Text>
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={level}
              style={[
                styles.legendCell,
                { backgroundColor: getIntensityColor(level) },
              ]}
            />
          ))}
          <Text style={styles.legendLabel}>More</Text>
        </View>
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <Text key={i} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>

        {/* Weeks */}
        <View style={styles.weeksContainer}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {week.map((day, dayIndex) => (
                <CalendarCell
                  key={day.date}
                  day={day}
                  index={weekIndex * 7 + dayIndex}
                  onPress={() => onDayPress?.(day.date, day.completed)}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  )
}

function CalendarCell({
  day,
  index,
  onPress,
}: {
  day: MonthHeatmap
  index: number
  onPress: () => void
}) {
  const scale = useSharedValue(0)
  const isTodayCell = isToday(parseISO(day.date))

  useEffect(() => {
    scale.value = withDelay(
      100 + index * 20,
      withSpring(1, { damping: 12, stiffness: 150 }),
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }))

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.cell,
          { backgroundColor: getIntensityColor(day.intensity) },
          isTodayCell && styles.todayCell,
          animatedStyle,
        ]}
      >
        {isTodayCell && <View style={styles.todayIndicator} />}
      </Animated.View>
    </Pressable>
  )
}

function getIntensityColor(intensity: number): string {
  const colors = [
    COLORS.neutral[100], // 0 - No activity
    COLORS.primary[200], // 1 - Low
    COLORS.primary[300], // 2 - Medium
    COLORS.primary[400], // 3 - High
    COLORS.primary[500], // 4 - Very High
  ]
  return colors[intensity] || colors[0]
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendLabel: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.neutral[400],
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  calendarContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: SPACING.sm,
    justifyContent: 'space-between',
  },
  dayLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.neutral[400],
    height: CELL_SIZE,
    lineHeight: CELL_SIZE,
  },
  weeksContainer: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  week: {
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: COLORS.primary[600],
  },
  todayIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary[500],
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
})
