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
      return
    }

    if (!hasOnboarded) {
      router.replace('/(onboarding)/intro')
      return
    }

    router.replace('/(tabs)')
  }, [session, isLoading, hasOnboarded])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
      }}
    >
      <ActivityIndicator size='large' color={COLORS.primary[500]} />
    </View>
  )
}
