// DreamDo Theme - Dreamy & Energetic
export const colors = {
  // Primary colors
  background: {
    primary: '#0D0B1E',
    secondary: '#1A1730',
    card: '#252042',
    cardLight: '#2E2854',
  },
  // Accent colors
  accent: {
    purple: '#8B5CF6',
    indigo: '#6366F1',
    pink: '#EC4899',
    gold: '#F59E0B',
    sunset: '#FB923C',
    teal: '#14B8A6',
  },
  // Gradients
  gradients: {
    primary: ['#8B5CF6', '#6366F1'],
    sunset: ['#F59E0B', '#FB923C'],
    fire: ['#FB923C', '#EF4444'],
    purple: ['#A855F7', '#8B5CF6', '#6366F1'],
    card: ['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.05)'],
  },
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0B0',
    muted: '#6B6B80',
    accent: '#F59E0B',
  },
  // Status colors
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  // Border
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography = {
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export const shadows = {
  card: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};
