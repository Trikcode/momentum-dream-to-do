// src/components/charts/ProgressWave.tsx
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  SharedValue,
} from 'react-native-reanimated'
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg'
import { DARK, FONTS, SPACING } from '@/src/constants/theme'
import { DayActivity } from '@/src/hooks/useJourneyStats'
import { format, parseISO } from 'date-fns'

const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface ProgressWaveProps {
  data: DayActivity[]
  height?: number
  color?: string // Optional override
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CHART_PADDING = 20
const CHART_WIDTH = SCREEN_WIDTH - SPACING.lg * 2 - CHART_PADDING * 2

export function ProgressWave({ data, height = 160 }: ProgressWaveProps) {
  const progress = useSharedValue(0)
  // Instead of mapping hooks (which causes the crash if data length changes),
  // we use a single shared value for entry animation and interpolate delays in the child components.
  const entryProgress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(
      300,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
    )

    // Animate all dots entry from 0 to 1
    entryProgress.value = withTiming(1, { duration: 1000 })
  }, [data])

  const maxValue = Math.max(...data.map((d) => d.completed), 5)
  const stepX = CHART_WIDTH / (data.length - 1 || 1)

  const points = data.map((d, i) => ({
    x: CHART_PADDING + i * stepX,
    y:
      height -
      CHART_PADDING -
      (d.completed / maxValue) * (height - CHART_PADDING * 2),
    value: d.completed,
    date: d.date,
  }))

  const createSmoothPath = () => {
    if (points.length < 2) return ''
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const midX = (current.x + next.x) / 2
      path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`
    }
    return path
  }

  const createAreaPath = () => {
    const linePath = createSmoothPath()
    if (!linePath) return ''
    const lastPoint = points[points.length - 1]
    const firstPoint = points[0]
    return `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`
  }

  const animatedPathProps = useAnimatedProps(() => ({
    strokeDashoffset: 1000 * (1 - progress.value),
    strokeDasharray: 1000,
  }))

  const animatedAreaStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.3,
  }))

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={CHART_WIDTH + CHART_PADDING * 2} height={height}>
        <Defs>
          <LinearGradient id='lineGradient' x1='0' y1='0' x2='1' y2='0'>
            <Stop offset='0' stopColor={DARK.accent.rose} />
            <Stop offset='1' stopColor={DARK.accent.gold} />
          </LinearGradient>
          <LinearGradient id='areaGradient' x1='0' y1='0' x2='0' y2='1'>
            <Stop offset='0' stopColor={DARK.accent.rose} stopOpacity={0.4} />
            <Stop offset='1' stopColor={DARK.accent.rose} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <Animated.View style={animatedAreaStyle}>
          <Path d={createAreaPath()} fill='url(#areaGradient)' />
        </Animated.View>

        <AnimatedPath
          d={createSmoothPath()}
          stroke='url(#lineGradient)'
          strokeWidth={3}
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
          animatedProps={animatedPathProps}
        />

        {points.map((point, index) => (
          <DataPoint
            key={point.date}
            x={point.x}
            y={point.y}
            index={index}
            entryProgress={entryProgress}
            isToday={index === points.length - 1}
          />
        ))}
      </Svg>

      <View style={styles.xLabels}>
        {data.map((d) => (
          <Text key={d.date} style={styles.xLabel}>
            {format(parseISO(d.date), 'EEE')}
          </Text>
        ))}
      </View>
    </View>
  )
}

// Sub-component manages its own interpolation based on index to avoid hook rules issues
function DataPoint({ x, y, index, entryProgress, isToday }: any) {
  const animatedProps = useAnimatedProps(() => {
    // Stagger effect: calculate local progress based on index
    // We delay the start based on index
    const delay = index * 0.1
    const localProgress = Math.max(
      0,
      Math.min(1, (entryProgress.value - delay) * 2),
    )

    return {
      r: (isToday ? 6 : 4) * localProgress,
      opacity: localProgress,
    }
  })

  const glowProps = useAnimatedProps(() => {
    const delay = index * 0.1
    const localProgress = Math.max(
      0,
      Math.min(1, (entryProgress.value - delay) * 2),
    )
    return {
      r: 12 * localProgress,
      opacity: localProgress * 0.4,
    }
  })

  return (
    <>
      {isToday && (
        <AnimatedCircle
          cx={x}
          cy={y}
          fill={DARK.accent.gold}
          animatedProps={glowProps}
        />
      )}
      <AnimatedCircle
        cx={x}
        cy={y}
        fill={DARK.bg.primary}
        stroke={isToday ? DARK.accent.gold : DARK.text.muted}
        strokeWidth={2}
        animatedProps={animatedProps}
      />
      {/* Inner dot */}
      <AnimatedCircle
        cx={x}
        cy={y}
        fill={isToday ? DARK.accent.gold : DARK.text.muted}
        animatedProps={useAnimatedProps(() => {
          const delay = index * 0.1
          const localProgress = Math.max(
            0,
            Math.min(1, (entryProgress.value - delay) * 2),
          )
          return { r: (isToday ? 3 : 2) * localProgress }
        })}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CHART_WIDTH + CHART_PADDING * 2,
    paddingHorizontal: CHART_PADDING,
    marginTop: SPACING.sm,
  },
  xLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: DARK.text.tertiary,
    textAlign: 'center',
    width: 30,
  },
})
