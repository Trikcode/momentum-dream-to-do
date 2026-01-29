// app/(auth)/_layout.tsx
import { Stack } from 'expo-router'
import { COLORS } from '@/src/constants/theme'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name='welcome' />
      <Stack.Screen name='sign-in' />
      <Stack.Screen name='sign-up' />
      <Stack.Screen name='forgot-password' />
    </Stack>
  )
}
