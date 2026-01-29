import React from 'react'
import { Tabs } from 'expo-router'
import { CustomTabBar } from '@/src/components/navigation/CustomTabBar'
import { COLORS } from '@/src/constants/theme'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name='index' />
      <Tabs.Screen name='dreams' />
      <Tabs.Screen name='journey' />
      <Tabs.Screen name='profile' />
    </Tabs>
  )
}
