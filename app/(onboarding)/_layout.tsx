import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { useAuthStore } from '@/src/store/authStore'
import { COLORS } from '@/src/constants/theme'

export default function OnboardingLayout() {
  const { session, isLoading, hasOnboarded } = useAuthStore()
  const segments = useSegments()

  const currentScreen = segments?.[1]
  const isCompleteScreen = currentScreen === 'complete'

  useEffect(() => {
    if (isLoading) return

    if (!session) {
      router.replace('/(auth)/welcome')
      return
    }

    if (hasOnboarded && !isCompleteScreen) {
      router.replace('/(tabs)')
    }
  }, [session, isLoading, hasOnboarded, isCompleteScreen])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name='intro' />
      <Stack.Screen name='pick-dreams' />
      <Stack.Screen name='first-dream' />
      <Stack.Screen name='complete' options={{ animation: 'fade' }} />
    </Stack>
  )
}
