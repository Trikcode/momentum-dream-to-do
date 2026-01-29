// src/store/authStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/src/lib/supabase'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  has_onboarded: boolean
  total_xp: number
  current_level: number
  current_streak: number
  longest_streak: number
  is_premium: boolean
}

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  hasOnboarded: boolean

  // Actions
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setHasOnboarded: (value: boolean) => void
  initialize: () => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      profile: null,
      isLoading: true,
      hasOnboarded: false,

      setSession: (session) => set({ session, user: session?.user ?? null }),

      setProfile: (profile) =>
        set({
          profile,
          hasOnboarded: profile?.has_onboarded ?? false,
        }),

      setHasOnboarded: (value) => set({ hasOnboarded: value }),

      initialize: async () => {
        try {
          set({ isLoading: true })

          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            set({
              session,
              user: session.user,
              profile: profile as Profile,
              hasOnboarded: profile?.has_onboarded ?? false,
            })
          }
        } catch (error) {
          console.error('Auth init error:', error)
        } finally {
          set({ isLoading: false })
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          set({ session, user: session?.user ?? null })

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            set({
              profile: profile as Profile,
              hasOnboarded: profile?.has_onboarded ?? false,
            })
          } else {
            set({ profile: null, hasOnboarded: false })
          }
        })
      },

      signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        })

        if (error) throw error
      },

      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null, user: null, profile: null, hasOnboarded: false })
      },

      refreshProfile: async () => {
        const { user } = get()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        set({
          profile: profile as Profile,
          hasOnboarded: profile?.has_onboarded ?? false,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hasOnboarded: state.hasOnboarded }),
    },
  ),
)
