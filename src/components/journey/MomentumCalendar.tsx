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
import * as Haptics from 'expo-haptics'
import { parseISO, isToday } from 'date-fns'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { MonthHeatmap } from '@/src/hooks/useJourneyStats'

const CELL_SIZE = 14
const CELL_GAP = 4

export function MomentumCalendar({
  data,
  onDayPress,
}: {
  data: MonthHeatmap[]
  onDayPress?: any
}) {
  // Logic to group weeks (same as before)
  const weeks: MonthHeatmap[][] = []
  let currentWeek: MonthHeatmap[] = []

  data.forEach((day, index) => {
    const dayOfWeek = parseISO(day.date).getDay()
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
    if (index === data.length - 1) weeks.push(currentWeek)
  })

  return (
    <Animated.View entering={FadeIn.delay(200)} style={styles.container}>
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

      <View style={styles.calendarContainer}>
        <View style={styles.dayLabels}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <Text key={i} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>
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

function CalendarCell({ day, index, onPress }: any) {
  const scale = useSharedValue(0)
  const isTodayCell = isToday(parseISO(day.date))

  useEffect(() => {
    scale.value = withDelay(100 + index * 10, withSpring(1))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
      }}
    >
      <Animated.View
        style={[
          styles.cell,
          { backgroundColor: getIntensityColor(day.intensity) },
          isTodayCell && styles.todayCell,
          animatedStyle,
        ]}
      />
    </Pressable>
  )
}

function getIntensityColor(intensity: number): string {
  const colors = [
    'rgba(255,255,255,0.05)', // 0
    '#BE123C', // 1 - Dark Rose
    '#E11D48', // 2
    '#F43F5E', // 3
    '#FB7185', // 4 - Bright Rose
  ]
  return colors[intensity] || colors[0]
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
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: DARK.text.primary,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: DARK.text.muted,
  },
  legendCell: { width: 10, height: 10, borderRadius: 2 },

  calendarContainer: { flexDirection: 'row' },
  dayLabels: { marginRight: SPACING.sm, justifyContent: 'space-between' },
  dayLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: DARK.text.muted,
    height: CELL_SIZE,
    lineHeight: CELL_SIZE,
  },
  weeksContainer: { flexDirection: 'row', gap: CELL_GAP },
  week: { gap: CELL_GAP },
  cell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 3 },
  todayCell: { borderWidth: 1, borderColor: '#FFF' },
})
