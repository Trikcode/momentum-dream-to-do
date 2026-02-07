import React, { useEffect } from 'react'
import { Tabs, router } from 'expo-router'
import { CustomTabBar } from '@/src/components/navigation/CustomTabBar'
import { useTheme } from '@/src/context/ThemeContext'
import { useAuthStore } from '@/src/store/authStore'

export default function TabsLayout() {
  const { colors } = useTheme()
  const { session, isLoading, hasOnboarded } = useAuthStore()

  useEffect(() => {
    if (isLoading) return

    if (!session) {
      router.replace('/(auth)/welcome')
      return
    }

    if (!hasOnboarded) {
      router.replace('/(onboarding)/intro')
    }
  }, [session, isLoading, hasOnboarded])

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name='index' options={{ title: 'Today' }} />
      <Tabs.Screen name='dreams' options={{ title: 'Dreams' }} />
      <Tabs.Screen name='journey' options={{ title: 'Journey' }} />
      <Tabs.Screen name='profile' options={{ title: 'You' }} />
    </Tabs>
  )
}
