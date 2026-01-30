// app/(tabs)/_layout.tsx
import React from 'react'
import { Tabs } from 'expo-router'
import { CustomTabBar } from '@/src/components/navigation/CustomTabBar'
import { DARK } from '@/src/constants/theme'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: DARK.bg.primary },
      }}
    >
      <Tabs.Screen name='index' options={{ title: 'Today' }} />
      <Tabs.Screen name='dreams' options={{ title: 'Dreams' }} />
      <Tabs.Screen name='journey' options={{ title: 'Journey' }} />
      <Tabs.Screen name='profile' options={{ title: 'You' }} />
    </Tabs>
  )
}
