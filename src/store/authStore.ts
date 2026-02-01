import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/src/lib/supabase'

import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin'
import * as AppleAuthentication from 'expo-apple-authentication'
import { ENV } from '@/src/config/env'

const GOOGLE_WEB_CLIENT_ID = ENV.GOOGLE_WEB_CLIENT_ID
// Configure once at module load (safe)
if (GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID })
}

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
  notifications_enabled: boolean
  daily_reminder_time: string | null
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

  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>

  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  completeOnboarding: () => Promise<void>

  updateNotificationSettings: (input: {
    notifications_enabled?: boolean
    daily_reminder_time?: string
  }) => Promise<void>
}

let authListenerInitialized = false

function appleFullNameToString(
  fullName?: AppleAuthentication.AppleAuthenticationFullName | null,
) {
  if (!fullName) return null
  const parts = [fullName.givenName, fullName.middleName, fullName.familyName]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
  return parts.length ? parts.join(' ') : null
}

// Use a consistent “silent cancel” signal
const CANCELLED = 'CANCELLED'

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
            error,
          } = await supabase.auth.getSession()

          if (error) {
            set({
              session: null,
              user: null,
              profile: null,
              hasOnboarded: false,
            })
            return
          }

          if (session?.user) {
            set({ session, user: session.user })
            await get().refreshProfile()
          } else {
            set({
              session: null,
              user: null,
              profile: null,
              hasOnboarded: false,
            })
          }
        } catch (e) {
          console.error('Auth init error:', e)
        } finally {
          set({ isLoading: false })
        }

        // Prevent double listener registration (common with Fast Refresh)
        if (authListenerInitialized) return
        authListenerInitialized = true

        const { data } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            set({ session, user: session?.user ?? null })

            if (session?.user) {
              await get().refreshProfile()
            } else {
              set({ profile: null, hasOnboarded: false })
            }
          },
        )

        // Note: we intentionally don't unsubscribe here because initialize() is called
        // once for app lifetime; we also guard with authListenerInitialized.
        void data
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

        // If email confirmation is ON in Supabase, session will often be null.
        if (!data.session) {
          throw new Error('Please confirm your email, then sign in.')
        }

        set({ session: data.session, user: data.session.user })
        await get().refreshProfile()
      },

      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.session) {
          set({ session: data.session, user: data.session.user })
          await get().refreshProfile()
        }
      },

      signInWithGoogle: async () => {
        if (!GOOGLE_WEB_CLIENT_ID) {
          throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID')
        }
        try {
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          })
          const response = await GoogleSignin.signIn()
          if (!isSuccessResponse(response)) {
            throw new Error(CANCELLED)
          }
          const idToken = response.data.idToken
          if (!idToken) throw new Error('No Google ID token returned.')
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
          })
          if (error) throw error
          if (data.session) {
            set({ session: data.session, user: data.session.user })
            await get().refreshProfile()
          }
        } catch (e: any) {
          if (e?.code === statusCodes.SIGN_IN_CANCELLED)
            throw new Error(CANCELLED)
          if (e?.code === statusCodes.IN_PROGRESS)
            throw new Error('Sign-in already in progress.')
          if (e?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            throw new Error('Google Play Services not available.')
          }
          throw e
        }
      },

      signInWithApple: async () => {
        if (Platform.OS !== 'ios')
          throw new Error('Apple Sign In is only available on iOS.')
        const available = await AppleAuthentication.isAvailableAsync()
        if (!available)
          throw new Error('Apple Sign In is not available on this device.')
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          })
          if (!credential.identityToken)
            throw new Error('No Apple identity token returned.')
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          })
          if (error) throw error
          // Apple gives name only first time; store to user metadata if present
          const fullName = appleFullNameToString(credential.fullName)
          if (fullName) {
            try {
              await supabase.auth.updateUser({ data: { full_name: fullName } })
            } catch (nameErr) {
              console.warn('[Apple] Failed to store full_name:', nameErr)
            }
          }
          if (data.session) {
            set({ session: data.session, user: data.session.user })
            await get().refreshProfile()
          }
        } catch (e: any) {
          if (
            e?.code === 'ERR_REQUEST_CANCELED' ||
            e?.code === 'ERR_CANCELED'
          ) {
            throw new Error(CANCELLED)
          }
          throw e
        }
      },

      signOut: async () => {
        try {
          // Avoid “auto re-login” weirdness on Android
          try {
            // await GoogleSignin.signOut()
          } catch {}

          await supabase.auth.signOut()
        } finally {
          set({ session: null, user: null, profile: null, hasOnboarded: false })
        }
      },
      completeOnboarding: async () => {
        const { user } = get()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase.rpc('complete_onboarding')
        if (error) throw error

        await get().refreshProfile()
        set({ hasOnboarded: true })
      },
      refreshProfile: async () => {
        const { user } = get()
        if (!user) return

        // 1) Try read profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.warn('[refreshProfile] select error:', error.message)
          set({ profile: null, hasOnboarded: false })
          return
        }

        if (!profile) {
          const { error: upsertError } = await supabase.from('profiles').upsert(
            {
              id: user.id,
              email: user.email ?? '',
              full_name: (user.user_metadata as any)?.full_name ?? null,
              avatar_url: (user.user_metadata as any)?.avatar_url ?? null,
              has_onboarded: false,
            },
            { onConflict: 'id' },
          )

          if (upsertError) {
            console.warn('[refreshProfile] upsert error:', upsertError.message)
            set({ profile: null, hasOnboarded: false })
            return
          }

          const { data: created } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          set({
            profile: created as Profile,
            hasOnboarded: created?.has_onboarded ?? false,
          })
          return
        }

        // 3) Normal set
        set({
          profile: profile as Profile,
          hasOnboarded: profile?.has_onboarded ?? false,
        })
      },
      updateNotificationSettings: async (input) => {
        const { user } = get()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
          .from('profiles')
          .update({
            ...input,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (error) throw error
        await get().refreshProfile()
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hasOnboarded: state.hasOnboarded }),
    },
  ),
)

export const AUTH_CANCELLED_MESSAGE = CANCELLED
