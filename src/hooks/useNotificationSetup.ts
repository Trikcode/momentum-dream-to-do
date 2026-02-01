// src/hooks/useNotificationSetup.ts
import { useEffect, useRef } from 'react'
import { AppState, Alert, Linking } from 'react-native'
import { router } from 'expo-router'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '@/src/store/authStore'
import { useNotificationStore } from '@/src/store/notificationStore'
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  clearBadge,
} from '@/src/services/notifications'

const NOTIFICATION_PROMPTED_KEY = 'momentum_notification_prompted'

export function useNotificationSetup() {
  const { user, session } = useAuthStore()
  const { initialize } = useNotificationStore()
  const listenersSetup = useRef(false)

  // Initialize store when user logs in
  useEffect(() => {
    if (session && user) {
      initialize()
    }
  }, [session, user])

  // Setup listeners (only once)
  useEffect(() => {
    if (listenersSetup.current) return
    listenersSetup.current = true

    const notifListener = addNotificationReceivedListener((notification) => {
      console.log('📩 Received:', notification.request.content.title)
    })

    const responseListener = addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data
        handleNotificationTap(data)
      },
    )

    const appStateListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') clearBadge()
    })

    return () => {
      notifListener.remove()
      responseListener.remove()
      appStateListener.remove()
    }
  }, [])
}

/**
 * Hook to request notification permission on Home screen
 * Call this in your Home screen component
 */
export function useRequestNotificationPermission() {
  const { user } = useAuthStore()
  const { isEnabled, enableNotifications } = useNotificationStore()
  const prompted = useRef(false)

  useEffect(() => {
    if (!user || prompted.current || isEnabled) return

    const checkAndPrompt = async () => {
      try {
        // Check if we've already prompted before
        const hasPrompted = await AsyncStorage.getItem(
          NOTIFICATION_PROMPTED_KEY,
        )

        if (hasPrompted) {
          console.log('🔔 Already prompted for notifications before')
          return
        }

        // Small delay so the home screen renders first
        await new Promise((resolve) => setTimeout(resolve, 1500))

        prompted.current = true

        // Mark as prompted (even before asking)
        await AsyncStorage.setItem(NOTIFICATION_PROMPTED_KEY, 'true')

        console.log('🔔 Requesting notification permission...')
        const success = await enableNotifications()

        if (success) {
          console.log('✅ Notifications enabled!')
        } else {
          console.log('❌ User denied or error occurred')
        }
      } catch (error) {
        console.error('Error in notification prompt:', error)
      }
    }

    checkAndPrompt()
  }, [user, isEnabled])
}

function handleNotificationTap(data: any) {
  if (!data?.type) return

  setTimeout(() => {
    switch (data.type) {
      case 'daily_reminder':
      case 'power_move':
        router.push('/(tabs)')
        break
      case 'streak_alert':
        router.push('/(tabs)/journey')
        break
      case 'dream_progress':
        if (data.dreamId) {
          router.push(`/(modals)/dream-detail?id=${data.dreamId}`)
        } else {
          router.push('/(tabs)/dreams')
        }
        break
      case 'achievement':
        router.push('/(tabs)/journey')
        break
      default:
        router.push('/(tabs)')
    }
  }, 100)
}

/**
 * Reset the notification prompt flag (for testing)
 */
export async function resetNotificationPrompt() {
  await AsyncStorage.removeItem(NOTIFICATION_PROMPTED_KEY)
  console.log('🔄 Notification prompt reset')
}
