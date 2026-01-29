// src/hooks/useHaptics.ts
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

type HapticPattern =
  | 'success'
  | 'celebration'
  | 'levelUp'
  | 'spark'
  | 'tap'
  | 'error'
  | 'momentum'

export function useHaptics() {
  const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android'

  const trigger = async (pattern: HapticPattern) => {
    if (!isHapticsAvailable) return

    switch (pattern) {
      case 'tap':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break

      case 'success':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        )
        break

      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        break

      case 'spark':
        // Quick light taps like sparkles
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          100,
        )
        break

      case 'celebration':
        // Celebratory pattern
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
          150,
        )
        setTimeout(
          () =>
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
          300,
        )
        break

      case 'levelUp':
        // Epic level up pattern
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
          100,
        )
        setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
          200,
        )
        setTimeout(
          () =>
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
          350,
        )
        setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          500,
        )
        break

      case 'momentum':
        // Building momentum feel
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
          150,
        )
        break

      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }
  }

  return { trigger }
}
