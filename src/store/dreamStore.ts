// src/store/dreamStore.ts
import { create } from 'zustand'
import { supabase } from '@/src/lib/supabase'
import { useAuthStore } from './authStore'
import { useCelebrationStore } from './celebrationStore'
import { checkForAchievements } from '@/src/features/achievements/checkAchievements'
import { Database, Tables, TablesInsert } from '@/src/types/database'

type DbDream = Tables<'dreams'>
type DbAction = Tables<'actions'>

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )

const CATEGORY_SLUG_MAP: Record<string, string> = {
  health: 'fitness',
  wealth: 'finance',
  mind: 'lifestyle',
  skills: 'learning',
  career: 'career',
  travel: 'travel',
  relationships: 'relationships',
  creativity: 'creativity',
}

// Extended types for our app (with computed fields)
interface Dream extends DbDream {
  category?: { slug: string | null }
  completed_actions?: number
  total_actions?: number
  actions?: { id: string; is_completed: boolean | null }[]
}

interface Action extends Omit<DbAction, 'dream'> {
  dream?: {
    id: string
    title: string
    category_id: string | null
    category?: {
      slug: string
    }
  }
}

type CreateDreamInput = {
  title: string
  description?: string
  category_id?: string
  target_date?: string
}

type UpdateDreamInput = {
  title?: string
  description?: string
  category_id?: string
  target_date?: string
  status?: 'active' | 'completed' | 'paused' | 'archived'
  completed_at?: string
  progress_percent?: number
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
  actions: Action[]
  todayActions: Action[]
  dreamsLoading: boolean
  actionsLoading: boolean
  fetchDreams: () => Promise<void>
  createDream: (dream: CreateDreamInput) => Promise<void>
  updateDream: (dreamId: string, updates: UpdateDreamInput) => Promise<void>
  deleteDream: (dreamId: string) => Promise<void>

  // Action Actions
  fetchTodayActions: () => Promise<void>
  fetchAllActions: () => Promise<void>
  fetchActionsByDream: (dreamId: string) => Promise<void>
  addAction: (action: CreateActionInput) => Promise<void>
  completeAction: (actionId: string) => Promise<void>
  skipAction: (actionId: string) => Promise<void>
  deleteAction: (actionId: string) => Promise<void>
}

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  actions: [],
  todayActions: [],
  dreamsLoading: false,
  actionsLoading: false,

  // DREAM METHODS

  fetchDreams: async () => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Not authenticated')

    try {
      set({ dreamsLoading: true })

      const { data, error } = await supabase
        .from('dreams')
        .select(
          `
  *,
  category:dream_categories (slug),
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
      set({ dreamsLoading: false })
    }
  },

  createDream: async (dream: CreateDreamInput) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Not authenticated')

    try {
      // Resolve category UUID if UI passed a key like "health"
      let categoryId: string | null = dream.category_id ?? null

      if (categoryId && !isUuid(categoryId)) {
        const slug = CATEGORY_SLUG_MAP[categoryId] ?? categoryId

        const { data: cat, error: catErr } = await supabase
          .from('dream_categories')
          .select('id')
          .eq('slug', slug)
          .single()

        if (catErr) throw catErr
        categoryId = cat.id
      }

      const insertData: TablesInsert<'dreams'> = {
        user_id: user.id,
        title: dream.title,
        description: dream.description ?? null,
        category_id: categoryId,
        target_date: dream.target_date ?? null,
      }

      const { data, error } = await supabase
        .from('dreams')
        .insert(insertData)
        .select(
          `
        *,
        category:dream_categories (slug)
      `,
        )
        .single()

      if (error) throw error

      set((state) => ({
        dreams: [
          { ...(data as any), completed_actions: 0, total_actions: 0 } as Dream,
          ...state.dreams,
        ],
      }))
    } catch (error) {
      console.error('Error creating dream:', error)
      throw error
    }
  },

  updateDream: async (dreamId: string, updates: UpdateDreamInput) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Not authenticated')

    try {
      const { data, error } = await supabase
        .from('dreams')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dreamId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        dreams: state.dreams.map((d) =>
          d.id === dreamId ? { ...d, ...data } : d,
        ),
      }))

      // If completing a dream, trigger celebration
      if (updates.status === 'completed') {
        const dream = get().dreams.find((d) => d.id === dreamId)
        if (dream) {
          useCelebrationStore.getState().triggerDreamComplete(dream.title, 500)
        }
        await checkForAchievements(user.id)
      }
    } catch (error) {
      console.error('Error updating dream:', error)
      throw error
    }
  },

  deleteDream: async (dreamId: string) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Not authenticated')

    try {
      const { error } = await supabase
        .from('dreams')
        .delete()
        .eq('id', dreamId)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        dreams: state.dreams.filter((d) => d.id !== dreamId),
        actions: state.actions.filter((a) => a.dream_id !== dreamId),
        todayActions: state.todayActions.filter((a) => a.dream_id !== dreamId),
      }))
    } catch (error) {
      console.error('Error deleting dream:', error)
      throw error
    }
  },

  // ACTION METHODS

  fetchAllActions: async () => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Not authenticated')

    try {
      const { data, error } = await supabase
        .from('actions')
        .select(
          `
          *,
          dream:dreams (id, title, category_id, category:dream_categories (slug))
        `,
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ actions: (data as Action[]) || [] })
    } catch (error) {
      console.error('Error fetching all actions:', error)
    }
  },

  fetchActionsByDream: async (dreamId: string) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Not authenticated')

    try {
      const { data, error } = await supabase
        .from('actions')
        .select(
          `
          *,
          dream:dreams (id, title, category_id, category:dream_categories (slug))
        `,
        )
        .eq('user_id', user.id)
        .eq('dream_id', dreamId)
        .order('is_completed', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Merge into actions array (update existing, add new)
      set((state) => {
        const otherActions = state.actions.filter((a) => a.dream_id !== dreamId)
        return { actions: [...otherActions, ...(data as Action[])] }
      })
    } catch (error) {
      console.error('Error fetching actions by dream:', error)
    }
  },

  fetchTodayActions: async () => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Not authenticated')

    try {
      set({ actionsLoading: true })

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('actions')
        .select(
          `
          *,
          dream:dreams (id, title, category_id, category:dream_categories (slug))
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
      set({ actionsLoading: false })
    }
  },

  addAction: async (action: CreateActionInput) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Not authenticated')

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
          dream:dreams (id, title, category_id, category:dream_categories (slug))
        `,
        )
        .single()

      if (error) throw error

      const newAction = data as Action

      set((state) => ({
        actions: [newAction, ...state.actions],
        todayActions:
          newAction.due_date === new Date().toISOString().split('T')[0] ||
          !newAction.due_date
            ? [...state.todayActions, newAction]
            : state.todayActions,
      }))

      // Update dream's total_actions count
      set((state) => ({
        dreams: state.dreams.map((d) =>
          d.id === action.dream_id
            ? { ...d, total_actions: (d.total_actions || 0) + 1 }
            : d,
        ),
      }))
    } catch (error) {
      console.error('Error adding action:', error)
      throw error
    }
  },

  completeAction: async (actionId: string) => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      // Find action from either list
      const action =
        get().todayActions.find((a) => a.id === actionId) ||
        get().actions.find((a) => a.id === actionId)
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

      // Update streak
      await supabase.rpc('update_user_streak', { p_user_id: user.id })

      // Update local state
      const updateActionList = (actions: Action[]) =>
        actions.map((a) =>
          a.id === actionId
            ? {
                ...a,
                is_completed: true,
                completed_at: new Date().toISOString(),
              }
            : a,
        )

      set((state) => ({
        todayActions: updateActionList(state.todayActions),
        actions: updateActionList(state.actions),
        dreams: state.dreams.map((d) =>
          d.id === action.dream_id
            ? { ...d, completed_actions: (d.completed_actions || 0) + 1 }
            : d,
        ),
      }))

      // Trigger celebration
      setTimeout(() => {
        useCelebrationStore
          .getState()
          .triggerPowerMoveComplete(action.title, action.xp_reward ?? 10)
      }, 400)

      // Refresh profile for updated XP/streak
      await useAuthStore.getState().refreshProfile()

      // Check for achievements
      await checkForAchievements(user.id)
    } catch (error) {
      console.error('Error completing action:', error)
      throw error
    }
  },

  skipAction: async (actionId: string) => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      // Move due date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const { error } = await supabase
        .from('actions')
        .update({ due_date: tomorrowStr })
        .eq('id', actionId)

      if (error) throw error

      // Remove from today's actions
      set((state) => ({
        todayActions: state.todayActions.filter((a) => a.id !== actionId),
        actions: state.actions.map((a) =>
          a.id === actionId ? { ...a, due_date: tomorrowStr } : a,
        ),
      }))
    } catch (error) {
      console.error('Error skipping action:', error)
      throw error
    }
  },

  deleteAction: async (actionId: string) => {
    const user = useAuthStore.getState().user
    if (!user) return

    try {
      const action = get().actions.find((a) => a.id === actionId)

      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', actionId)

      if (error) throw error

      set((state) => ({
        actions: state.actions.filter((a) => a.id !== actionId),
        todayActions: state.todayActions.filter((a) => a.id !== actionId),
        // Decrement dream's total_actions
        dreams: action
          ? state.dreams.map((d) =>
              d.id === action.dream_id
                ? {
                    ...d,
                    total_actions: Math.max(0, (d.total_actions || 0) - 1),
                  }
                : d,
            )
          : state.dreams,
      }))
    } catch (error) {
      console.error('Error deleting action:', error)
      throw error
    }
  },
}))
