import { create } from 'zustand'
import { supabase } from '@/src/lib/supabase'
import { useAuthStore } from './authStore'
import { useCelebrationStore } from './celebrationStore'
import { checkForAchievements } from '@/src/features/achievements/checkAchievements'
import { Database, Tables, TablesInsert } from '@/src/types/database'

type DbDream = Tables<'dreams'>
type DbAction = Tables<'actions'>

// Extended types for our app (with computed fields)
interface Dream extends DbDream {
  completed_actions?: number
  total_actions?: number
  actions?: { id: string; is_completed: boolean | null }[]
}

interface Action extends Omit<DbAction, 'dream'> {
  dream?: {
    id: string
    title: string
    category_id: string | null
  }
}

type CreateDreamInput = {
  title: string
  description?: string
  category_id?: string
  target_date?: string
}

type CreateActionInput = {
  dream_id: string
  title: string
  description?: string
  due_date?: string
  difficulty?: string
  xp_reward?: number
  is_recurring?: boolean
}

interface DreamState {
  dreams: Dream[]
  todayActions: Action[]
  isLoading: boolean

  // Actions
  fetchDreams: () => Promise<void>
  fetchTodayActions: () => Promise<void>
  createDream: (dream: CreateDreamInput) => Promise<void>
  completeAction: (actionId: string) => Promise<void>
  addAction: (action: CreateActionInput) => Promise<void>
}

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  todayActions: [],
  isLoading: false,

  fetchDreams: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      set({ isLoading: true })

      const { data, error } = await supabase
        .from('dreams')
        .select(
          `
          *,
          actions (id, is_completed)
        `,
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const dreamsWithStats: Dream[] = (data || []).map((dream) => ({
        ...dream,
        completed_actions:
          dream.actions?.filter(
            (a: { is_completed: boolean | null }) => a.is_completed,
          ).length || 0,
        total_actions: dream.actions?.length || 0,
      }))

      set({ dreams: dreamsWithStats })
    } catch (error) {
      console.error('Error fetching dreams:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchTodayActions: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      set({ isLoading: true })

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('actions')
        .select(
          `
          *,
          dream:dreams (id, title, category_id)
        `,
        )
        .eq('user_id', user.id)
        .or(`due_date.eq.${today},due_date.is.null`)
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error

      set({ todayActions: (data as Action[]) || [] })
    } catch (error) {
      console.error('Error fetching today actions:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  createDream: async (dream: CreateDreamInput) => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const insertData: TablesInsert<'dreams'> = {
        user_id: user.id,
        title: dream.title,
        description: dream.description ?? null,
        category_id: dream.category_id ?? null,
        target_date: dream.target_date ?? null,
      }

      const { data, error } = await supabase
        .from('dreams')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        dreams: [data as Dream, ...state.dreams],
      }))
    } catch (error) {
      console.error('Error creating dream:', error)
      throw error
    }
  },

  completeAction: async (actionId) => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const action = get().todayActions.find((a) => a.id === actionId)
      if (!action) return

      // Update action in database
      const { error: updateError } = await supabase
        .from('actions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', actionId)

      if (updateError) throw updateError

      // Log completion
      await supabase.from('action_completions').insert({
        action_id: actionId,
        user_id: user.id,
        xp_earned: action.xp_reward ?? 10,
      })

      await supabase.rpc('update_user_streak', { p_user_id: user.id })

      set((state) => ({
        todayActions: state.todayActions.map((a) =>
          a.id === actionId ? { ...a, is_completed: true } : a,
        ),
      }))

      useCelebrationStore
        .getState()
        .triggerPowerMoveComplete(action.title, action.xp_reward ?? 10)

      await useAuthStore.getState().refreshProfile()

      // Check for achievements
      await checkForAchievements(user.id)
    } catch (error) {
      console.error('Error completing action:', error)
      throw error
    }
  },

  addAction: async (action: CreateActionInput) => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const insertData: TablesInsert<'actions'> = {
        user_id: user.id,
        dream_id: action.dream_id,
        title: action.title,
        description: action.description ?? null,
        due_date: action.due_date ?? null,
        difficulty: action.difficulty ?? 'medium',
        xp_reward: action.xp_reward ?? 10,
        is_recurring: action.is_recurring ?? false,
      }

      const { data, error } = await supabase
        .from('actions')
        .insert(insertData)
        .select(
          `
          *,
          dream:dreams (id, title, category_id)
        `,
        )
        .single()

      if (error) throw error

      set((state) => ({
        todayActions: [...state.todayActions, data as Action],
      }))
    } catch (error) {
      console.error('Error adding action:', error)
      throw error
    }
  },
}))
