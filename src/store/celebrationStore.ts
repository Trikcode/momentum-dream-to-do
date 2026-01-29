// src/store/celebrationStore.ts
import { create } from 'zustand'

interface SparkEarn {
  id: string
  amount: number
  source: string
  timestamp: number
}

interface Victory {
  id: string
  slug: string
  name: string
  description: string
  iconName: string
  category: string
  sparkReward: number
}

interface LevelUp {
  previousChapter: number
  newChapter: number
  unlockedFeatures?: string[]
}

interface CelebrationState {
  // Active celebrations
  showPowerMoveComplete: boolean
  completedMoveTitle: string
  sparksEarned: number

  showSparkBurst: boolean
  sparkBurstAmount: number
  sparkBurstPosition: { x: number; y: number }

  showVictory: boolean
  currentVictory: Victory | null

  showLevelUp: boolean
  levelUpData: LevelUp | null

  showConfetti: boolean

  // Queue for multiple celebrations
  celebrationQueue: Array<{
    type: 'powerMove' | 'spark' | 'victory' | 'levelUp'
    data: any
  }>

  // Actions
  triggerPowerMoveComplete: (title: string, sparks: number) => void
  triggerSparkBurst: (
    amount: number,
    position?: { x: number; y: number },
  ) => void
  triggerVictory: (victory: Victory) => void
  triggerLevelUp: (data: LevelUp) => void
  triggerConfetti: () => void

  dismissPowerMoveComplete: () => void
  dismissVictory: () => void
  dismissLevelUp: () => void
  dismissConfetti: () => void

  processNextCelebration: () => void
}

export const useCelebrationStore = create<CelebrationState>((set, get) => ({
  // Initial state
  showPowerMoveComplete: false,
  completedMoveTitle: '',
  sparksEarned: 0,

  showSparkBurst: false,
  sparkBurstAmount: 0,
  sparkBurstPosition: { x: 0, y: 0 },

  showVictory: false,
  currentVictory: null,

  showLevelUp: false,
  levelUpData: null,

  showConfetti: false,

  celebrationQueue: [],

  // Trigger functions
  triggerPowerMoveComplete: (title, sparks) => {
    set({
      showPowerMoveComplete: true,
      completedMoveTitle: title,
      sparksEarned: sparks,
      showConfetti: true,
    })

    // Auto-dismiss after animation
    setTimeout(() => {
      get().dismissPowerMoveComplete()
    }, 2500)
  },

  triggerSparkBurst: (amount, position = { x: 0, y: 0 }) => {
    set({
      showSparkBurst: true,
      sparkBurstAmount: amount,
      sparkBurstPosition: position,
    })

    setTimeout(() => {
      set({ showSparkBurst: false })
    }, 1500)
  },

  triggerVictory: (victory) => {
    const state = get()

    // If another celebration is showing, queue this one
    if (state.showPowerMoveComplete || state.showVictory || state.showLevelUp) {
      set({
        celebrationQueue: [
          ...state.celebrationQueue,
          { type: 'victory', data: victory },
        ],
      })
      return
    }

    set({
      showVictory: true,
      currentVictory: victory,
      showConfetti: true,
    })
  },

  triggerLevelUp: (data) => {
    const state = get()

    if (state.showPowerMoveComplete || state.showVictory || state.showLevelUp) {
      set({
        celebrationQueue: [
          ...state.celebrationQueue,
          { type: 'levelUp', data },
        ],
      })
      return
    }

    set({
      showLevelUp: true,
      levelUpData: data,
      showConfetti: true,
    })
  },

  triggerConfetti: () => {
    set({ showConfetti: true })

    setTimeout(() => {
      set({ showConfetti: false })
    }, 4000)
  },

  // Dismiss functions
  dismissPowerMoveComplete: () => {
    set({
      showPowerMoveComplete: false,
      showConfetti: false,
    })
    get().processNextCelebration()
  },

  dismissVictory: () => {
    set({
      showVictory: false,
      currentVictory: null,
      showConfetti: false,
    })
    get().processNextCelebration()
  },

  dismissLevelUp: () => {
    set({
      showLevelUp: false,
      levelUpData: null,
      showConfetti: false,
    })
    get().processNextCelebration()
  },

  dismissConfetti: () => {
    set({ showConfetti: false })
  },

  processNextCelebration: () => {
    const { celebrationQueue } = get()

    if (celebrationQueue.length === 0) return

    const [next, ...rest] = celebrationQueue
    set({ celebrationQueue: rest })

    // Small delay between celebrations
    setTimeout(() => {
      switch (next.type) {
        case 'victory':
          get().triggerVictory(next.data)
          break
        case 'levelUp':
          get().triggerLevelUp(next.data)
          break
      }
    }, 500)
  },
}))
