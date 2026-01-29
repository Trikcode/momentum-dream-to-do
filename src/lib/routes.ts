import { router, Href } from 'expo-router'

export const Routes = {
  welcome: '/(auth)/welcome' as Href,
  signIn: '/(auth)/sign-in' as Href,
  signUp: '/(auth)/sign-up' as Href,

  // Tabs
  home: '/(tabs)' as Href,
  dreams: '/(tabs)/dreams' as Href,
  journey: '/(tabs)/journey' as Href,
  profile: '/(tabs)/profile' as Href,

  // Modals
  newDream: '/(modals)/new-dream' as Href,
  newAction: '/(modals)/new-action' as Href,
  premium: '/(modals)/premium' as Href,
  dreamDetail: (id: string) => `/(modals)/dream-detail?id=${id}` as Href,

  // Onboarding
  intro: '/(onboarding)/intro' as Href,
  pickDreams: '/(onboarding)/pick-dreams' as Href,
} as const

export const navigate = {
  to: (route: Href) => router.push(route),
  replace: (route: Href) => router.replace(route),
  back: () => router.back(),
}
