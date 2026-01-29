// src/features/achievements/checkAchievements.ts
import { supabase } from '@/src/lib/supabase'
import { useCelebrationStore } from '@/src/store/celebrationStore'

export async function checkForAchievements(userId: string) {
  try {
    // Get user stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, total_xp')
      .eq('id', userId)
      .single()

    // Get completed actions count
    const { count: actionsCount } = await supabase
      .from('action_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Get completed dreams count
    const { count: dreamsCount } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')

    // Get user's unlocked achievements
    const { data: unlockedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    const unlockedIds = new Set(
      unlockedAchievements?.map((a) => a.achievement_id) || [],
    )

    // Get all achievements
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')

    if (!allAchievements) return

    // Check each achievement
    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue

      let shouldUnlock = false

      const currentStreak = profile?.current_streak ?? 0
      const currentActionsCount = actionsCount ?? 0
      const currentDreamsCount = dreamsCount ?? 0

      switch (achievement.requirement_type) {
        case 'streak_days':
          shouldUnlock = currentStreak >= achievement.requirement_value
          break
        case 'actions_completed':
          shouldUnlock = currentActionsCount >= achievement.requirement_value
          break
        case 'dreams_completed':
          shouldUnlock = currentDreamsCount >= achievement.requirement_value
          break
      }

      if (shouldUnlock) {
        // Unlock the achievement
        await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: achievement.id,
        })

        const xpToAdd = achievement.xp_reward ?? 0
        if (xpToAdd > 0) {
          const currentXp = profile?.total_xp ?? 0
          await supabase
            .from('profiles')
            .update({ total_xp: currentXp + xpToAdd })
            .eq('id', userId)
        }

        // Trigger celebration!
        useCelebrationStore.getState().triggerVictory({
          id: achievement.id,
          slug: achievement.slug,
          name: achievement.name,
          description: achievement.description,
          iconName: achievement.icon_name,
          category: achievement.category,
          sparkReward: achievement.xp_reward ?? 0,
        })
      }
    }

    // Check for level up
    await checkForLevelUp(userId)
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}

async function checkForLevelUp(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp, current_level')
    .eq('id', userId)
    .single()

  if (!profile) return

  const totalXp = profile.total_xp ?? 0
  const currentLevel = profile.current_level ?? 1

  // Calculate expected level based on XP
  // Using a formula: Level = floor(sqrt(XP / 100)) + 1
  const expectedLevel = Math.floor(Math.sqrt(totalXp / 100)) + 1

  if (expectedLevel > currentLevel) {
    // Level up!
    await supabase
      .from('profiles')
      .update({ current_level: expectedLevel })
      .eq('id', userId)

    // Trigger level up celebration
    useCelebrationStore.getState().triggerLevelUp({
      previousChapter: currentLevel,
      newChapter: expectedLevel,
      unlockedFeatures: getUnlockedFeatures(expectedLevel),
    })
  }
}

function getUnlockedFeatures(level: number): string[] {
  const features: Record<number, string[]> = {
    2: ['Custom dream colors'],
    3: ['Weekly insights'],
    5: ['Advanced statistics'],
    7: ['Dream sharing'],
    10: ['Premium themes'],
  }

  return features[level] || []
}
