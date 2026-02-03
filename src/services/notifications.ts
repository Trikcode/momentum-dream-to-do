// src/services/notifications.ts
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { supabase } from '@/src/lib/supabase'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
})

export interface NotificationPreferences {
  daily_reminder: boolean
  daily_reminder_time: string
  streak_alerts: boolean
  achievement_alerts: boolean
  dream_progress_alerts: boolean
  weekly_summary: boolean
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  daily_reminder: true,
  daily_reminder_time: '09:00',
  streak_alerts: true,
  achievement_alerts: true,
  dream_progress_alerts: true,
  weekly_summary: true,
}

/**
 * Setup Android notification channels
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return

  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F43F5E',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    })

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Daily Reminders',
      description: 'Morning motivation and power move reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F43F5E',
      sound: 'default',
      enableVibrate: true,
    })

    await Notifications.setNotificationChannelAsync('streaks', {
      name: 'Streak Alerts',
      description: 'Notifications when your streak is at risk',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500],
      lightColor: '#F59E0B',
      sound: 'default',
      enableVibrate: true,
    })

    await Notifications.setNotificationChannelAsync('achievements', {
      name: 'Achievements',
      description: 'Victory and milestone celebrations',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#8B5CF6',
      sound: 'default',
      enableVibrate: true,
    })
  } catch (error) {
    console.error('❌ Error setting up notification channels:', error)
  }
}

/**
 * Register for push notifications
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  // Setup Android channels first
  if (Platform.OS === 'android') {
    await setupNotificationChannels()
  }

  if (!Device.isDevice) {
    console.log('❌ Push notifications require a physical device')
    return null
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    console.log('📱 Current permission status:', existingStatus)

    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      console.log('📱 Requesting notification permission...')
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      return null
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId

    if (!projectId) {
      console.error('❌ No EAS project ID found')
      return null
    }

    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId })

    return pushToken.data
  } catch (error) {
    return null
  }
}

/**
 * Save push token to profiles table
 */
export async function savePushToken(
  userId: string,
  token: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        push_token: token,
        notifications_enabled: true,
      })
      .eq('id', userId)

    if (error) throw error
  } catch (error) {
    console.error('❌ Error saving push token:', error)
  }
}

/**
 * Remove push token
 */
export async function removePushToken(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        push_token: null,
        notifications_enabled: false,
      })
      .eq('id', userId)

    if (error) throw error
  } catch (error) {
    console.error('❌ Error removing push token:', error)
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data?.notification_preferences || DEFAULT_PREFERENCES
  } catch (error) {
    console.error('❌ Error getting preferences:', error)
    return DEFAULT_PREFERENCES
  }
}

/**
 * Save notification preferences
 */
export async function saveNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>,
): Promise<boolean> {
  try {
    // Get current preferences
    const current = await getNotificationPreferences(userId)
    const updated = { ...current, ...preferences }

    const { error } = await supabase
      .from('profiles')
      .update({ notification_preferences: updated })
      .eq('id', userId)

    if (error) throw error
    return true
  } catch (error) {
    return false
  }
}

/**
 * Send immediate local notification (for testing)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: data || {},
    },
    trigger: null,
  })
}

/**
 * Notification listeners
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback)
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback)
}

/**
 * Badge management
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0)
}
