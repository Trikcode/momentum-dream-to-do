import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const DAILY_REMINDER_ID_KEY = 'daily-reminder-notification-id'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return

  await Notifications.setNotificationChannelAsync('daily-reminders', {
    name: 'Daily Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: undefined,
    vibrationPattern: [0, 150],
    lightColor: '#F43F5E',
  })
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function cancelDailyReminder() {
  const existingId = await AsyncStorage.getItem(DAILY_REMINDER_ID_KEY)
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId)
    await AsyncStorage.removeItem(DAILY_REMINDER_ID_KEY)
  }
}

export function parseTimeString(time?: string | null): {
  hour: number
  minute: number
} {
  // expects "HH:MM:SS" or "HH:MM"
  const fallback = { hour: 9, minute: 0 }
  if (!time) return fallback

  const parts = time.split(':')
  const hour = Number(parts[0])
  const minute = Number(parts[1])

  if (Number.isNaN(hour) || Number.isNaN(minute)) return fallback
  return { hour, minute }
}

export function formatTimeForDB(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}:00`
}

export function formatTimeLabel(time?: string | null): string {
  const { hour, minute } = parseTimeString(time)
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export async function scheduleDailyReminder(time: {
  hour: number
  minute: number
}) {
  await ensureNotificationChannel()
  await cancelDailyReminder()

  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: time.hour,
    minute: time.minute,
  }

  const content: Notifications.NotificationContentInput = {
    title: 'Your Momentum awaits',
    body: 'Do one Power Move today—small steps, real progress.',
    ...(Platform.OS === 'android' ? { channelId: 'daily-reminders' } : {}),
  }

  const id = await Notifications.scheduleNotificationAsync({
    content,
    trigger,
  })

  await AsyncStorage.setItem(DAILY_REMINDER_ID_KEY, id)
}
