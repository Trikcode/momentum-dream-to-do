import { useState, useEffect } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useAuthStore } from '@/src/store/authStore'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  subDays,
  startOfMonth,
  endOfMonth,
} from 'date-fns'

export interface DayActivity {
  date: string
  completed: number
  total: number
  sparks: number
}

export interface WeekStats {
  days: DayActivity[]
  totalCompleted: number
  totalSparks: number
  completionRate: number
  bestDay: string
}

export interface MonthHeatmap {
  date: string
  intensity: number // 0-4 scale
  completed: number
}

export interface JourneyStats {
  // Overall stats
  totalPowerMoves: number
  totalSparks: number
  currentMomentum: number
  longestMomentum: number
  dreamsCompleted: number
  dreamsActive: number
  victoriesUnlocked: number
  currentChapter: number

  // Time-based
  weekStats: WeekStats
  monthHeatmap: MonthHeatmap[]

  // Recent activity
  recentCompletions: Array<{
    id: string
    title: string
    dreamTitle: string
    completedAt: string
    sparks: number
  }>

  // Insights
  insights: Array<{
    id: string
    type: 'achievement' | 'tip' | 'milestone' | 'encouragement'
    title: string
    message: string
    icon: string
  }>

  isLoading: boolean
}

export function useJourneyStats(): JourneyStats {
  const { user, profile } = useAuthStore()
  const [stats, setStats] = useState<JourneyStats>({
    totalPowerMoves: 0,
    totalSparks: 0,
    currentMomentum: 0,
    longestMomentum: 0,
    dreamsCompleted: 0,
    dreamsActive: 0,
    victoriesUnlocked: 0,
    currentChapter: 1,
    weekStats: {
      days: [],
      totalCompleted: 0,
      totalSparks: 0,
      completionRate: 0,
      bestDay: '',
    },
    monthHeatmap: [],
    recentCompletions: [],
    insights: [],
    isLoading: true,
  })

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      // Fetch all data in parallel
      const [completionsData, dreamsData, victoriesData, weekData, monthData] =
        await Promise.all([
          // Total completions
          supabase
            .from('action_completions')
            .select('*')
            .eq('user_id', user.id),

          // Dreams
          supabase.from('dreams').select('status').eq('user_id', user.id),

          // Victories
          supabase.from('user_achievements').select('*').eq('user_id', user.id),

          // This week's activity
          fetchWeekActivity(user.id),

          // This month's heatmap
          fetchMonthHeatmap(user.id),
        ])

      // Calculate totals
      const totalPowerMoves = completionsData.data?.length || 0
      const totalSparks =
        completionsData.data?.reduce((sum, c) => sum + (c.xp_earned ?? 0), 0) ||
        0

      const dreamsCompleted =
        dreamsData.data?.filter((d) => d.status === 'completed').length || 0
      const dreamsActive =
        dreamsData.data?.filter((d) => d.status === 'active').length || 0

      const victoriesUnlocked = victoriesData.data?.length || 0

      // Recent completions
      const { data: recentData } = await supabase
        .from('action_completions')
        .select(
          `
          id,
          completed_at,
          xp_earned,
          action:actions (
            title,
            dream:dreams (title)
          )
        `,
        )
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10)

      const recentCompletions = (recentData || [])
        .filter((r) => r.completed_at !== null)
        .map((r) => ({
          id: r.id,
          title: (r.action as any)?.title ?? '',
          dreamTitle: (r.action as any)?.dream?.title ?? '',
          completedAt: r.completed_at!,
          sparks: r.xp_earned ?? 0,
        }))

      // Generate insights
      const insights = generateInsights({
        totalPowerMoves,
        currentMomentum: profile?.current_streak ?? 0,
        weekStats: weekData,
        victoriesUnlocked,
      })

      setStats({
        totalPowerMoves,
        totalSparks,
        currentMomentum: profile?.current_streak ?? 0,
        longestMomentum: profile?.longest_streak ?? 0,
        dreamsCompleted,
        dreamsActive,
        victoriesUnlocked,
        currentChapter: profile?.current_level ?? 1,
        weekStats: weekData,
        monthHeatmap: monthData,
        recentCompletions,
        insights,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error fetching journey stats:', error)
      setStats((prev) => ({ ...prev, isLoading: false }))
    }
  }

  return stats
}

async function fetchWeekActivity(userId: string): Promise<WeekStats> {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const { data: completions } = await supabase
    .from('action_completions')
    .select('completed_at, xp_earned')
    .eq('user_id', userId)
    .gte('completed_at', weekStart.toISOString())
    .lte('completed_at', weekEnd.toISOString())

  const dayStats: DayActivity[] = days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayCompletions = (completions || []).filter((c) => {
      if (!c.completed_at) return false
      return format(new Date(c.completed_at), 'yyyy-MM-dd') === dateStr
    })

    return {
      date: dateStr,
      completed: dayCompletions.length,
      total: 5, // Assume 5 daily goal
      sparks: dayCompletions.reduce((sum, c) => sum + (c.xp_earned ?? 0), 0),
    }
  })

  const totalCompleted = dayStats.reduce((sum, d) => sum + d.completed, 0)
  const totalSparks = dayStats.reduce((sum, d) => sum + d.sparks, 0)
  const bestDay = dayStats.reduce(
    (best, d) => (d.completed > best.completed ? d : best),
    dayStats[0],
  )

  return {
    days: dayStats,
    totalCompleted,
    totalSparks,
    completionRate: Math.round((totalCompleted / (dayStats.length * 5)) * 100),
    bestDay: bestDay?.date || '',
  }
}

async function fetchMonthHeatmap(userId: string): Promise<MonthHeatmap[]> {
  const today = new Date()
  const monthStart = startOfMonth(subDays(today, 30))
  const monthEnd = today

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const { data: completions } = await supabase
    .from('action_completions')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', monthStart.toISOString())
    .lte('completed_at', monthEnd.toISOString())

  return days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const count = (completions || []).filter((c) => {
      if (!c.completed_at) return false
      return format(new Date(c.completed_at), 'yyyy-MM-dd') === dateStr
    }).length

    let intensity = 0
    if (count >= 1) intensity = 1
    if (count >= 3) intensity = 2
    if (count >= 5) intensity = 3
    if (count >= 8) intensity = 4

    return {
      date: dateStr,
      intensity,
      completed: count,
    }
  })
}

function generateInsights(data: {
  totalPowerMoves: number
  currentMomentum: number
  weekStats: WeekStats
  victoriesUnlocked: number
}): JourneyStats['insights'] {
  const insights: JourneyStats['insights'] = []

  if (data.currentMomentum >= 7) {
    insights.push({
      id: '1',
      type: 'achievement',
      title: 'Unstoppable!',
      message: `${data.currentMomentum} days of momentum! You're building something amazing.`,
      icon: 'flame',
    })
  } else if (data.currentMomentum >= 3) {
    insights.push({
      id: '2',
      type: 'encouragement',
      title: 'Momentum Building',
      message: `${data.currentMomentum} days strong! Keep this energy going.`,
      icon: 'trending-up',
    })
  }

  if (data.weekStats.completionRate >= 80) {
    insights.push({
      id: '3',
      type: 'milestone',
      title: 'Power Week!',
      message: `${data.weekStats.completionRate}% completion rate this week. Absolutely crushing it!`,
      icon: 'star',
    })
  }

  const milestones = [10, 25, 50, 100, 250, 500, 1000]
  const reachedMilestone = milestones.find(
    (m) => data.totalPowerMoves >= m && data.totalPowerMoves < m + 10,
  )
  if (reachedMilestone) {
    insights.push({
      id: '4',
      type: 'milestone',
      title: `${reachedMilestone} Power Moves!`,
      message: `You've completed ${reachedMilestone}+ power moves. That's dedication!`,
      icon: 'trophy',
    })
  }

  if (insights.length === 0) {
    insights.push({
      id: '5',
      type: 'tip',
      title: 'Pro Tip',
      message:
        'Consistency beats intensity. Small daily actions create big results.',
      icon: 'bulb',
    })
  }

  return insights
}
