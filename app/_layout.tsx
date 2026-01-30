// app/_layout.tsx
import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins'
import { ToastProvider } from '@/src/components/shared/Toast'
import { OfflineBar } from '@/src/components/shared/OfflineBar'
import { CelebrationOrchestrator } from '@/src/components/celebrations/CelebrationOrchestrator'
import { useAuthStore } from '@/src/store/authStore'
import { usePremiumStore } from '@/src/store/premiumStore'
import { COLORS } from '@/src/constants/theme'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false)
  const { user, initialize: initAuth } = useAuthStore()
  const { initialize: initPremium } = usePremiumStore()

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  useEffect(() => {
    async function prepare() {
      try {
        await initAuth()
      } catch (e) {
        console.warn(e)
      } finally {
        setAppReady(true)
      }
    }
    prepare()
  }, [])

  useEffect(() => {
    if (user) {
      initPremium(user.id)
    }
  }, [user])

  useEffect(() => {
    if (fontsLoaded && appReady) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, appReady])

  if (!fontsLoaded || !appReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style='dark' />
          <OfflineBar />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name='index' />
            <Stack.Screen name='(auth)' />
            <Stack.Screen name='(onboarding)' />
            <Stack.Screen name='(tabs)' />
            <Stack.Screen
              name='(modals)/new-dream'
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name='(modals)/new-action'
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name='(modals)/premium'
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name='(modals)/dream-detail'
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name='(modals)/ai-coach'
              options={{
                headerShown: false,
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
          <CelebrationOrchestrator />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
