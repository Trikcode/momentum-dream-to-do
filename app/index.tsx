import { useEffect } from 'react'
import { router } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '@/src/store/authStore'
import { COLORS } from '@/src/constants/theme'

export default function Index() {
  const { session, isLoading, hasOnboarded } = useAuthStore()

  useEffect(() => {
    if (isLoading) return

    if (!session) {
      router.replace('/(auth)/welcome')
    } else if (!hasOnboarded) {
      router.replace('/(onboarding)/intro')
    } else {
      router.replace('/(tabs)')
    }
  }, [session, isLoading, hasOnboarded])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background.primary,
      }}
    >
      <ActivityIndicator size='large' color={COLORS.primary[500]} />
    </View>
  )
}
