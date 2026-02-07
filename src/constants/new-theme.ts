// src/constants/new-theme.ts

// MIDNIGHT & ELECTRIC THEME
// A premium theme system with light/dark mode support

// Core Color Palette
export const PALETTE = {
  // Electric Accents (consistent across themes)
  electric: {
    cyan: '#22d3ee',
    cyanLight: '#67e8f9',
    cyanDark: '#06b6d4',
    emerald: '#34d399',
    emeraldLight: '#6ee7b7',
    emeraldDark: '#10b981',
    indigo: '#6366f1',
    indigoLight: '#818cf8',
    indigoDark: '#4f46e5',
    lime: '#84cc16',
  },

  midnight: {
    obsidian: '#020617',
    slate: '#0f172a',
    navy: '#1e293b',
    steel: '#334155',
  },

  paper: {
    white: '#ffffff',
    cream: '#fafafa',
    pearl: '#f8fafc',
    silver: '#f1f5f9',
  },

  // Slate Scale (for text and UI elements)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Status Colors
  status: {
    success: '#34d399',
    successLight: '#6ee7b7',
    successDark: '#10b981',
    warning: '#fbbf24',
    warningLight: '#fcd34d',
    warningDark: '#f59e0b',
    error: '#f87171',
    errorLight: '#fca5a5',
    errorDark: '#ef4444',
    info: '#60a5fa',
    infoLight: '#93c5fd',
    infoDark: '#3b82f6',
  },
} as const

// THEME DEFINITIONS

export const themes = {
  light: {
    // Backgrounds
    background: PALETTE.paper.cream,
    backgroundSecondary: PALETTE.paper.white,
    backgroundTertiary: PALETTE.paper.pearl,

    // Surfaces (cards, modals, etc.)
    surface: PALETTE.paper.white,
    surfaceElevated: PALETTE.paper.white,
    surfaceMuted: PALETTE.paper.silver,

    // Text
    text: PALETTE.slate[900],
    textSecondary: PALETTE.slate[600],
    textTertiary: PALETTE.slate[500],
    textMuted: PALETTE.slate[400],
    textInverse: PALETTE.paper.white,

    // Borders
    border: PALETTE.slate[200],
    borderLight: PALETTE.slate[100],
    borderFocused: PALETTE.electric.cyan,

    // Primary (Electric Indigo)
    primary: PALETTE.electric.indigo,
    primaryLight: PALETTE.electric.indigoLight,
    primaryDark: PALETTE.electric.indigoDark,
    primaryForeground: PALETTE.paper.white,

    // Accent (Electric Cyan)
    accent: PALETTE.electric.cyan,
    accentLight: PALETTE.electric.cyanLight,
    accentDark: PALETTE.electric.cyanDark,
    accentForeground: PALETTE.midnight.obsidian,

    // Secondary (Electric Emerald)
    secondary: PALETTE.electric.emerald,
    secondaryLight: PALETTE.electric.emeraldLight,
    secondaryDark: PALETTE.electric.emeraldDark,
    secondaryForeground: PALETTE.midnight.obsidian,

    // Status
    success: PALETTE.status.success,
    successBackground: 'rgba(52, 211, 153, 0.1)',
    warning: PALETTE.status.warning,
    warningBackground: 'rgba(251, 191, 36, 0.1)',
    error: PALETTE.status.errorDark,
    errorBackground: 'rgba(239, 68, 68, 0.1)',
    info: PALETTE.status.info,
    infoBackground: 'rgba(96, 165, 250, 0.1)',

    // Input
    inputBackground: PALETTE.paper.pearl,
    inputBorder: PALETTE.slate[200],
    inputFocusBorder: PALETTE.electric.cyan,
    inputPlaceholder: PALETTE.slate[400],

    // Overlays
    overlay: 'rgba(15, 23, 42, 0.5)',
    overlayLight: 'rgba(15, 23, 42, 0.3)',

    // Glass effects
    glass: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',

    // Shadows
    shadowColor: '#000',
  },

  dark: {
    // Backgrounds (Midnight theme - NOT pure black)
    background: PALETTE.midnight.obsidian,
    backgroundSecondary: PALETTE.midnight.slate,
    backgroundTertiary: PALETTE.midnight.navy,

    // Surfaces
    surface: PALETTE.midnight.slate,
    surfaceElevated: PALETTE.midnight.navy,
    surfaceMuted: 'rgba(30, 41, 59, 0.5)',

    // Text
    text: PALETTE.slate[50],
    textSecondary: PALETTE.slate[400],
    textTertiary: PALETTE.slate[500],
    textMuted: PALETTE.slate[600],
    textInverse: PALETTE.midnight.obsidian,

    // Borders
    border: PALETTE.midnight.navy,
    borderLight: 'rgba(255, 255, 255, 0.06)',
    borderFocused: PALETTE.electric.cyan,

    // Primary (Lighter Indigo for dark mode)
    primary: PALETTE.electric.indigoLight,
    primaryLight: '#a5b4fc',
    primaryDark: PALETTE.electric.indigo,
    primaryForeground: PALETTE.midnight.obsidian,

    // Accent (Electric Cyan - stays vibrant)
    accent: PALETTE.electric.cyan,
    accentLight: PALETTE.electric.cyanLight,
    accentDark: PALETTE.electric.cyanDark,
    accentForeground: PALETTE.midnight.obsidian,

    // Secondary (Electric Emerald)
    secondary: PALETTE.electric.emerald,
    secondaryLight: PALETTE.electric.emeraldLight,
    secondaryDark: PALETTE.electric.emeraldDark,
    secondaryForeground: PALETTE.midnight.obsidian,

    // Status
    success: PALETTE.status.success,
    successBackground: 'rgba(52, 211, 153, 0.15)',
    warning: PALETTE.status.warning,
    warningBackground: 'rgba(251, 191, 36, 0.15)',
    error: PALETTE.status.error,
    errorBackground: 'rgba(248, 113, 113, 0.15)',
    info: PALETTE.status.info,
    infoBackground: 'rgba(96, 165, 250, 0.15)',

    // Input
    inputBackground: PALETTE.midnight.slate,
    inputBorder: PALETTE.midnight.navy,
    inputFocusBorder: PALETTE.electric.cyan,
    inputPlaceholder: PALETTE.slate[500],

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',

    // Glass effects
    glass: 'rgba(15, 23, 42, 0.6)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',

    // Shadows
    shadowColor: '#000',
  },
} as const

// GRADIENTS

export const GRADIENTS = {
  // Electric gradients (work on both themes)
  electric: ['#22d3ee', '#34d399'] as [string, string],
  electricAlt: ['#6366f1', '#22d3ee'] as [string, string],
  electricVibrant: ['#06b6d4', '#10b981'] as [string, string],

  // Primary action gradients
  primary: ['#6366f1', '#4f46e5'] as [string, string],
  primaryAlt: ['#818cf8', '#6366f1'] as [string, string],

  // Accent gradients
  accent: ['#22d3ee', '#06b6d4'] as [string, string],
  secondary: ['#34d399', '#10b981'] as [string, string],

  // Dark theme backgrounds
  midnight: ['#020617', '#0f172a'] as [string, string],
  midnightAlt: ['#0f172a', '#1e293b', '#0f172a'] as [string, string, string],

  // Status
  success: ['#34d399', '#10b981'] as [string, string],
  warning: ['#fbbf24', '#f59e0b'] as [string, string],
  error: ['#f87171', '#ef4444'] as [string, string],

  // Special effects
  glow: ['rgba(34, 211, 238, 0.4)', 'rgba(34, 211, 238, 0)'] as [
    string,
    string,
  ],
  glowEmerald: ['rgba(52, 211, 153, 0.4)', 'rgba(52, 211, 153, 0)'] as [
    string,
    string,
  ],
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const

// RADIUS

export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  full: 9999,
} as const

// FONTS (unchanged from original)

export const FONTS = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const

// TYPOGRAPHY

export const TYPOGRAPHY = {
  // Display
  display: {
    fontFamily: FONTS.bold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -1,
  },
  // Headings
  h1: {
    fontFamily: FONTS.bold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  // Body
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  // Labels
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    lineHeight: 16,
  },
} as const

// SHADOWS

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  }),
  glowLg: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  }),
} as const

// ANIMATION CONFIGS (unchanged)

export const SPRING_CONFIGS = {
  gentle: { damping: 20, stiffness: 90 },
  snappy: { damping: 15, stiffness: 150 },
  bouncy: { damping: 10, stiffness: 180 },
  stiff: { damping: 20, stiffness: 300 },
  smooth: { damping: 25, stiffness: 120 },
} as const

export const TIMING_CONFIGS = {
  fast: { duration: 150 },
  normal: { duration: 250 },
  slow: { duration: 400 },
  verySlow: { duration: 600 },
} as const

// TYPE EXPORTS

export type ThemeMode = 'light' | 'dark'
export type ThemeColors = typeof themes.light
export type GradientName = keyof typeof GRADIENTS
