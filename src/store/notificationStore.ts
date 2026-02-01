import { create } from 'zustand'
import {
  NotificationPreferences,
  DEFAULT_PREFERENCES,
  registerForPushNotificationsAsync,
  savePushToken,
  removePushToken,
  getNotificationPreferences,
  saveNotificationPreferences,
  sendLocalNotification,
} from '@/src/services/notifications'
import { useAuthStore } from './authStore'

interface NotificationState {
  isEnabled: boolean
  isLoading: boolean
  preferences: NotificationPreferences

  initialize: () => Promise<void>
  enableNotifications: () => Promise<boolean>
  disableNotifications: () => Promise<void>
  updatePreference: <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) => Promise<void>
  sendTestNotification: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  isEnabled: false,
  isLoading: false,
  preferences: DEFAULT_PREFERENCES,

  initialize: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true })

    try {
      const preferences = await getNotificationPreferences(user.id)
      set({ preferences })

      // Check if already has token
      const { data } = await (await import('@/src/lib/supabase')).supabase
        .from('profiles')
        .select('push_token')
        .eq('id', user.id)
        .single()

      if (data?.push_token) {
        set({ isEnabled: true })
      }
    } catch (error) {
      console.error('Error initializing:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  enableNotifications: async () => {
    const user = useAuthStore.getState().user
    if (!user) return false

    set({ isLoading: true })

    try {
      const token = await registerForPushNotificationsAsync()

      if (token) {
        await savePushToken(user.id, token)
        set({ isEnabled: true })
        return true
      }
      return false
    } catch (error) {
      console.error('Error enabling:', error)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  disableNotifications: async () => {
    const user = useAuthStore.getState().user
    if (!user) return

    set({ isLoading: true })

    try {
      await removePushToken(user.id)
      set({ isEnabled: false })
    } catch (error) {
      console.error('Error disabling:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  updatePreference: async (key, value) => {
    const user = useAuthStore.getState().user
    if (!user) return

    const currentPrefs = get().preferences
    const newPrefs = { ...currentPrefs, [key]: value }

    set({ preferences: newPrefs })

    try {
      await saveNotificationPreferences(user.id, { [key]: value })
    } catch (error) {
      set({ preferences: currentPrefs })
    }
  },

  sendTestNotification: async () => {
    await sendLocalNotification(
      'Momentum Test 🚀',
      'Notifications are working! Keep building momentum! 💪',
      { type: 'test' },
    )
  },
}))
