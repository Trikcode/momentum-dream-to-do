import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState, AppStateStatus } from 'react-native'
import { ENV } from '@/src/config/env'

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    return await fetch(input, { ...(init || {}), signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  global: {
    fetch: fetchWithTimeout,
  },
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

let appStateSubscription: any = null

export const initSupabaseAppStateHandler = () => {
  if (appStateSubscription) return

  appStateSubscription = AppState.addEventListener(
    'change',
    (state: AppStateStatus) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh()
      } else {
        supabase.auth.stopAutoRefresh()
      }
    },
  )
}

export const getSessionWithTimeout = async (
  timeoutMs: number = 5000,
): Promise<{ session: any; error: any }> => {
  return new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      resolve({ session: null, error: new Error('Session fetch timeout') })
    }, timeoutMs)

    try {
      const { data, error } = await supabase.auth.getSession()
      clearTimeout(timeout)
      resolve({ session: data.session, error })
    } catch (error) {
      clearTimeout(timeout)
      resolve({ session: null, error })
    }
  })
}
