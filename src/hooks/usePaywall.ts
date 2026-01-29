import { useCallback } from 'react'
import { router } from 'expo-router'
import { usePremiumStore } from '@/src/store/premiumStore'
import * as Haptics from 'expo-haptics'

interface UsePaywallOptions {
  source?: string
  featureId?: string
}

export function usePaywall() {
  const { isPremium, setShowPaywall } = usePremiumStore()

  const showPaywall = useCallback(
    (options?: UsePaywallOptions) => {
      if (isPremium) return false

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      // Track analytics here if needed
      console.log('Paywall shown:', options)

      setShowPaywall(true)
      router.push('/(modals)/premium')

      return true
    },
    [isPremium, setShowPaywall],
  )

  const checkAndShowPaywall = useCallback(
    (featureId: string, callback?: () => void) => {
      if (isPremium) {
        callback?.()
        return false
      }

      showPaywall({ featureId })
      return true
    },
    [isPremium, showPaywall],
  )

  return {
    isPremium,
    showPaywall,
    checkAndShowPaywall,
  }
}
