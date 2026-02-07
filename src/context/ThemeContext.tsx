import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  themes,
  ThemeColors,
  ThemeMode,
  GRADIENTS,
  PALETTE,
} from '@/src/constants/new-theme'

// TYPES

type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeContextType {
  // Current resolved theme
  mode: ThemeMode
  colors: ThemeColors

  // Theme preference
  preference: ThemePreference
  setPreference: (pref: ThemePreference) => void

  // Quick toggle
  toggleTheme: () => void

  // Convenience booleans
  isDark: boolean
  isLight: boolean

  // Access to gradients and palette
  gradients: typeof GRADIENTS
  palette: typeof PALETTE
}

// CONTEXT

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = '@momentum_theme_preference'

// PROVIDER

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>('system')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved preference on mount
  useEffect(() => {
    async function loadPreference() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY)
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setPreferenceState(saved as ThemePreference)
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error)
      } finally {
        setIsLoaded(true)
      }
    }
    loadPreference()
  }, [])

  // Save preference when it changes
  const setPreference = async (newPref: ThemePreference) => {
    setPreferenceState(newPref)
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newPref)
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }

  // Resolve the actual theme mode
  const mode: ThemeMode = useMemo(() => {
    if (preference === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light'
    }
    return preference
  }, [preference, systemColorScheme])

  // Get colors for current mode
  const colors: ThemeColors = useMemo(() => themes[mode] as ThemeColors, [mode])

  const toggleTheme = () => {
    setPreference(mode === 'dark' ? 'light' : 'dark')
  }

  const value: ThemeContextType = useMemo(
    () => ({
      mode,
      colors,
      preference,
      setPreference,
      toggleTheme,
      isDark: mode === 'dark',
      isLight: mode === 'light',
      gradients: GRADIENTS,
      palette: PALETTE,
    }),
    [mode, colors, preference],
  )

  // Don't render until we've loaded the saved preference
  // This prevents a flash of wrong theme
  if (!isLoaded) {
    return null
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// HOOK

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Convenience hook for just colors
export function useColors(): ThemeColors {
  const { colors } = useTheme()
  return colors
}

// Convenience hook for checking dark mode
export function useIsDark(): boolean {
  const { isDark } = useTheme()
  return isDark
}
