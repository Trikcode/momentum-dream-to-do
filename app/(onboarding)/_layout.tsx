// app/(onboarding)/_layout.tsx
import { Stack } from 'expo-router'
import { COLORS } from '@/src/constants/theme'

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background.primary },
        animation: 'slide_from_right',
        gestureEnabled: false, // Prevent swipe back during onboarding
      }}
    >
      <Stack.Screen name='intro' />
      <Stack.Screen name='pick-dreams' />
      <Stack.Screen name='first-dream' />
      <Stack.Screen
        name='complete'
        options={{
          animation: 'fade',
        }}
      />
    </Stack>
  )
}
