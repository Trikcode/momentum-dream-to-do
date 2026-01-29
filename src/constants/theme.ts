// src/constants/theme.ts

// =============================================================================
// EXISTING COLORS (Keep these - used throughout the app)
// =============================================================================
export const COLORS = {
  // Primary - Warm, empowering coral/rose
  primary: {
    50: '#FFF5F6',
    100: '#FFE4E8',
    200: '#FFCCD5',
    300: '#FFA3B5',
    400: '#FF7A95',
    500: '#F43F5E', // Main
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // Secondary - Dreamy purple
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Accent - Warm gold/amber for achievements
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Success - Fresh mint
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Neutral - Warm grays
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },

  // Gradients
  gradients: {
    primary: ['#F43F5E', '#E11D48'],
    secondary: ['#A855F7', '#7C3AED'],
    accent: ['#FBBF24', '#F59E0B'],
    success: ['#34D399', '#10B981'],
    sunset: ['#F43F5E', '#F59E0B'],
    dream: ['#A855F7', '#F43F5E'],
    ocean: ['#06B6D4', '#3B82F6'],
    aurora: ['#A855F7', '#06B6D4', '#10B981'],
    // NEW: Dark theme gradients
    momentum: ['#6C7CFF', '#8B98FF'],
    darkPrimary: ['#0F1115', '#151A23'],
  },

  // Glass effects
  glass: {
    light: 'rgba(255, 255, 255, 0.7)',
    medium: 'rgba(255, 255, 255, 0.5)',
    dark: 'rgba(255, 255, 255, 0.3)',
    border: 'rgba(255, 255, 255, 0.2)',
  },

  // Semantic (existing)
  background: '#FFFBFA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
}

// =============================================================================
// NEW: DARK THEME COLORS (For premium screens like Welcome, Auth, etc.)
// =============================================================================
export const DARK_COLORS = {
  // Backgrounds
  background: {
    primary: '#0F1115',
    secondary: '#151A23',
    tertiary: '#1C2130',
    elevated: '#242938',
  },

  // Text on dark
  text: {
    primary: '#F5F7FA',
    secondary: '#A0A6B4',
    tertiary: '#6B7280',
    muted: '#4B5163',
  },

  // Accent - Electric Indigo
  accent: {
    primary: '#6C7CFF',
    secondary: '#8B98FF',
    muted: 'rgba(108, 124, 255, 0.15)',
    glow: 'rgba(108, 124, 255, 0.4)',
  },

  // Progress/Success - Soft Teal
  progress: {
    primary: '#4FD1C5',
    secondary: '#6EE7DB',
    muted: 'rgba(79, 209, 197, 0.15)',
  },

  // Borders for dark theme
  border: {
    primary: 'rgba(255, 255, 255, 0.08)',
    secondary: 'rgba(255, 255, 255, 0.04)',
    accent: 'rgba(108, 124, 255, 0.3)',
  },

  // Overlays for dark theme
  overlay: {
    light: 'rgba(255, 255, 255, 0.03)',
    medium: 'rgba(255, 255, 255, 0.06)',
    heavy: 'rgba(0, 0, 0, 0.5)',
  },
}

// =============================================================================
// EXISTING SPACING (Keep as-is)
// =============================================================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // NEW: Additional spacing values
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
}

// =============================================================================
// EXISTING RADIUS (Keep as-is)
// =============================================================================
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
  // NEW: Additional radius values
  none: 0,
  '2xl': 20,
}

// =============================================================================
// EXISTING FONTS (Keep as-is)
// =============================================================================
export const FONTS = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
}

// =============================================================================
// EXISTING TYPOGRAPHY (Keep as-is)
// =============================================================================
export const TYPOGRAPHY = {
  h1: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    lineHeight: 40,
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
  // NEW: Additional typography for dark theme
  display: {
    fontFamily: FONTS.bold,
    fontSize: 40,
    lineHeight: 48,
  },
  h4: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  labelSm: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    lineHeight: 16,
  },
}

// =============================================================================
// EXISTING SHADOWS (Keep as-is)
// =============================================================================
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  }),
  innerGlow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 0,
  }),
}

// NEW: Dark theme shadows
export const DARK_SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: DARK_COLORS.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 0,
  },
}

// =============================================================================
// EXISTING ANIMATION CONFIGS (Keep as-is)
// =============================================================================
export const SPRING_CONFIGS = {
  gentle: { damping: 20, stiffness: 90 },
  snappy: { damping: 15, stiffness: 150 },
  bouncy: { damping: 10, stiffness: 180 },
  stiff: { damping: 20, stiffness: 300 },
  // NEW
  smooth: { damping: 25, stiffness: 120 },
}

export const TIMING_CONFIGS = {
  fast: { duration: 150 },
  normal: { duration: 250 },
  slow: { duration: 400 },
  verySlow: { duration: 600 },
}
