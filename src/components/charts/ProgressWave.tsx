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
  interpolate,
  SharedValue,
} from 'react-native-reanimated'
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'
import { DayActivity } from '@/src/hooks/useJourneyStats'
import { format, parseISO } from 'date-fns'

const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface ProgressWaveProps {
  data: DayActivity[]
  height?: number
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CHART_PADDING = 20
const CHART_WIDTH = SCREEN_WIDTH - SPACING.lg * 2 - CHART_PADDING * 2

export function ProgressWave({ data, height = 160 }: ProgressWaveProps) {
  const progress = useSharedValue(0)
  const waveOffset = useSharedValue(0)
  const dotScales = data.map(() => useSharedValue(0))

  useEffect(() => {
    // Animate the wave drawing
    progress.value = withDelay(
      300,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }),
    )

    // Subtle wave animation
    waveOffset.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    )

    // Animate dots with stagger
    dotScales.forEach((scale, index) => {
      scale.value = withDelay(
        800 + index * 100,
        withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
      )
    })
  }, [data])

  // Calculate chart points
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

  // Create smooth curve path using bezier curves
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

  // Create filled area path
  const createAreaPath = () => {
    const linePath = createSmoothPath()
    if (!linePath) return ''

    const lastPoint = points[points.length - 1]
    const firstPoint = points[0]

    return `${linePath} L ${lastPoint.x} ${height - CHART_PADDING} L ${firstPoint.x} ${height - CHART_PADDING} Z`
  }

  const animatedPathProps = useAnimatedProps(() => {
    const totalLength = 1000 // Approximate

    return {
      strokeDasharray: totalLength,
      strokeDashoffset: totalLength * (1 - progress.value),
    }
  })

  const animatedAreaStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.3,
  }))

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={CHART_WIDTH + CHART_PADDING * 2} height={height}>
        <Defs>
          <LinearGradient id='lineGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
            <Stop offset='0%' stopColor={COLORS.primary[400]} />
            <Stop offset='100%' stopColor={COLORS.secondary[500]} />
          </LinearGradient>
          <LinearGradient id='areaGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
            <Stop
              offset='0%'
              stopColor={COLORS.primary[400]}
              stopOpacity={0.4}
            />
            <Stop
              offset='100%'
              stopColor={COLORS.primary[400]}
              stopOpacity={0}
            />
          </LinearGradient>
        </Defs>

        {/* Area fill */}
        <Animated.View style={animatedAreaStyle}>
          <Path d={createAreaPath()} fill='url(#areaGradient)' />
        </Animated.View>

        {/* Main line */}
        <AnimatedPath
          d={createSmoothPath()}
          stroke='url(#lineGradient)'
          strokeWidth={3}
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
          animatedProps={animatedPathProps}
        />

        {/* Data points */}
        {points.map((point, index) => (
          <DataPoint
            key={point.date}
            x={point.x}
            y={point.y}
            value={point.value}
            scale={dotScales[index]}
            isToday={index === points.length - 1}
          />
        ))}
      </Svg>

      {/* X-axis labels */}
      <View style={styles.xLabels}>
        {data.map((d, i) => (
          <Text key={d.date} style={styles.xLabel}>
            {format(parseISO(d.date), 'EEE')}
          </Text>
        ))}
      </View>
    </View>
  )
}

function DataPoint({
  x,
  y,
  value,
  scale,
  isToday,
}: {
  x: number
  y: number
  value: number
  scale: SharedValue<number>
  isToday: boolean
}) {
  const animatedProps = useAnimatedProps(() => ({
    r: (isToday ? 8 : 5) * scale.value,
    opacity: scale.value,
  }))

  const glowProps = useAnimatedProps(() => ({
    r: 12 * scale.value,
    opacity: scale.value * 0.3,
  }))

  return (
    <>
      {/* Glow effect for today */}
      {isToday && (
        <AnimatedCircle
          cx={x}
          cy={y}
          fill={COLORS.primary[400]}
          animatedProps={glowProps}
        />
      )}

      {/* Outer ring */}
      <AnimatedCircle
        cx={x}
        cy={y}
        fill={COLORS.surface}
        stroke={isToday ? COLORS.primary[500] : COLORS.secondary[400]}
        strokeWidth={2}
        animatedProps={animatedProps}
      />

      {/* Inner dot */}
      <AnimatedCircle
        cx={x}
        cy={y}
        fill={isToday ? COLORS.primary[500] : COLORS.secondary[400]}
        animatedProps={useAnimatedProps(() => ({
          r: (isToday ? 4 : 2.5) * scale.value,
          opacity: scale.value,
        }))}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CHART_WIDTH + CHART_PADDING * 2,
    paddingHorizontal: CHART_PADDING,
    marginTop: SPACING.sm,
  },
  xLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.neutral[400],
    textAlign: 'center',
    width: 30,
  },
})
