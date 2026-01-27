import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dream, MicroAction, Milestone, User, DreamCategory, Quote, Achievement, Stats } from '@/src/types';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isPremium: boolean;

  // Dreams state
  dreams: Dream[];
  activeDream: Dream | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Onboarding
  hasCompletedOnboarding: boolean;
  selectedCategories: DreamCategory[];

  // Stats
  stats: Stats;
  currentStreak: number;

  // Quote of the day
  dailyQuote: Quote | null;

  // Achievements
  achievements: Achievement[];

  // Actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsPremium: (value: boolean) => void;
  setDreams: (dreams: Dream[]) => void;
  addDream: (dream: Dream) => void;
  updateDream: (dreamId: string, updates: Partial<Dream>) => void;
  deleteDream: (dreamId: string) => void;
  setActiveDream: (dream: Dream | null) => void;
  toggleMicroAction: (dreamId: string, actionId: string) => void;
  toggleMilestone: (dreamId: string, milestoneId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  setSelectedCategories: (categories: DreamCategory[]) => void;
  setDailyQuote: (quote: Quote) => void;
  setStats: (stats: Stats) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  loadPersistedState: () => Promise<void>;
}

// Default quotes for inspiration
const DEFAULT_QUOTES: Quote[] = [
  { id: '1', text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { id: '2', text: "Dreams don't work unless you do.", author: "John C. Maxwell" },
  { id: '3', text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney" },
  { id: '4', text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { id: '5', text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
];

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_dream', title: 'Dream Starter', description: 'Create your first dream', icon: '⭐', unlocked: false },
  { id: 'week_streak', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: false },
  { id: 'month_streak', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑', unlocked: false },
  { id: 'first_milestone', title: 'Milestone Maker', description: 'Complete your first milestone', icon: '🏆', unlocked: false },
  { id: 'dream_complete', title: 'Dream Achiever', description: 'Complete a dream', icon: '🌟', unlocked: false },
  { id: 'five_dreams', title: 'Multi-Dreamer', description: 'Create 5 dreams', icon: '🎯', unlocked: false },
  { id: 'fifty_tasks', title: 'Task Titan', description: 'Complete 50 micro-actions', icon: '💪', unlocked: false },
];

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isPremium: false,
  dreams: [],
  activeDream: null,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,
  selectedCategories: [],
  stats: {
    totalTasks: 0,
    completedTasks: 0,
    currentStreak: 0,
    longestStreak: 0,
    dreamsCompleted: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  },
  currentStreak: 0,
  dailyQuote: DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)],
  achievements: DEFAULT_ACHIEVEMENTS,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  setIsPremium: (value) => set({ isPremium: value }),

  setDreams: (dreams) => set({ dreams }),

  addDream: (dream) => {
    set((state) => ({ dreams: [...state.dreams, dream] }));
    get().persistState();
  },

  updateDream: (dreamId, updates) => {
    set((state) => ({
      dreams: state.dreams.map((d) =>
        d.id === dreamId ? { ...d, ...updates } : d
      ),
      activeDream: state.activeDream?.id === dreamId
        ? { ...state.activeDream, ...updates }
        : state.activeDream,
    }));
    get().persistState();
  },

  deleteDream: (dreamId) => {
    set((state) => ({
      dreams: state.dreams.filter((d) => d.id !== dreamId),
      activeDream: state.activeDream?.id === dreamId ? null : state.activeDream,
    }));
    get().persistState();
  },

  setActiveDream: (dream) => set({ activeDream: dream }),

  toggleMicroAction: (dreamId, actionId) => {
    set((state) => {
      const dreams = state.dreams.map((dream) => {
        if (dream.id !== dreamId) return dream;

        const microActions = dream.micro_actions.map((action) => {
          if (action.id !== actionId) return action;
          return {
            ...action,
            is_completed: !action.is_completed,
            completed_at: !action.is_completed ? new Date().toISOString() : undefined,
          };
        });

        // Calculate new progress
        const completedActions = microActions.filter((a) => a.is_completed).length;
        const totalActions = microActions.length;
        const progress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

        return { ...dream, micro_actions: microActions, progress };
      });

      return {
        dreams,
        activeDream: state.activeDream?.id === dreamId
          ? dreams.find((d) => d.id === dreamId) || null
          : state.activeDream,
      };
    });
    get().persistState();
  },

  toggleMilestone: (dreamId, milestoneId) => {
    set((state) => {
      const dreams = state.dreams.map((dream) => {
        if (dream.id !== dreamId) return dream;

        const milestones = dream.milestones.map((milestone) => {
          if (milestone.id !== milestoneId) return milestone;
          return {
            ...milestone,
            is_completed: !milestone.is_completed,
            completed_at: !milestone.is_completed ? new Date().toISOString() : undefined,
          };
        });

        return { ...dream, milestones };
      });

      return {
        dreams,
        activeDream: state.activeDream?.id === dreamId
          ? dreams.find((d) => d.id === dreamId) || null
          : state.activeDream,
      };
    });
    get().persistState();
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setHasCompletedOnboarding: (value) => {
    set({ hasCompletedOnboarding: value });
    AsyncStorage.setItem('hasCompletedOnboarding', JSON.stringify(value));
  },

  setSelectedCategories: (categories) => set({ selectedCategories: categories }),

  setDailyQuote: (quote) => set({ dailyQuote: quote }),

  setStats: (stats) => set({ stats }),

  incrementStreak: () => {
    set((state) => {
      const newStreak = state.currentStreak + 1;
      const newLongestStreak = Math.max(newStreak, state.stats.longestStreak);
      return {
        currentStreak: newStreak,
        stats: { ...state.stats, currentStreak: newStreak, longestStreak: newLongestStreak },
      };
    });
    get().persistState();
  },

  resetStreak: () => {
    set((state) => ({
      currentStreak: 0,
      stats: { ...state.stats, currentStreak: 0 },
    }));
    get().persistState();
  },

  unlockAchievement: (achievementId) => {
    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.id === achievementId
          ? { ...a, unlocked: true, unlocked_at: new Date().toISOString() }
          : a
      ),
    }));
    get().persistState();
  },

  persistState: async () => {
    const state = get();
    try {
      await AsyncStorage.setItem('dreamdo_state', JSON.stringify({
        dreams: state.dreams,
        currentStreak: state.currentStreak,
        stats: state.stats,
        achievements: state.achievements,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        selectedCategories: state.selectedCategories,
      }));
    } catch (error) {
      console.error('Error persisting state:', error);
    }
  },

  loadPersistedState: async () => {
    try {
      const savedState = await AsyncStorage.getItem('dreamdo_state');
      const onboarding = await AsyncStorage.getItem('hasCompletedOnboarding');

      if (savedState) {
        const parsed = JSON.parse(savedState);
        set({
          dreams: parsed.dreams || [],
          currentStreak: parsed.currentStreak || 0,
          stats: parsed.stats || get().stats,
          achievements: parsed.achievements || DEFAULT_ACHIEVEMENTS,
          selectedCategories: parsed.selectedCategories || [],
        });
      }

      if (onboarding) {
        set({ hasCompletedOnboarding: JSON.parse(onboarding) });
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  },
}));

// Helper to persist state
interface AppStateWithPersist extends AppState {
  persistState: () => Promise<void>;
}

declare module 'zustand' {
  interface StoreApi<T> {
    persistState?: () => Promise<void>;
  }
}
