// src/constants/dreamCategories.ts
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'

export interface DreamCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: {
    library: 'ionicons' | 'material' | 'feather'
    name: string
  }
  color: string
  gradient: [string, string]
  examples: string[]
}

// IDs now match the local CATEGORIES in pick-dreams.tsx
export const DREAM_CATEGORIES: DreamCategory[] = [
  {
    id: 'health', // ← matches pick-dreams
    name: 'Fitness & Health',
    slug: 'health',
    description: 'Workouts, wellness goals, healthy habits',
    icon: { library: 'ionicons', name: 'fitness' },
    color: '#F43F5E',
    gradient: ['#F43F5E', '#E11D48'],
    examples: [
      'Run a marathon',
      'Workout 4x per week',
      'Lose 20 pounds',
      'Complete a yoga challenge',
    ],
  },
  {
    id: 'career', // ← matches pick-dreams
    name: 'Career & Biz',
    slug: 'career',
    description: 'Promotions, salary goals, dream jobs, side hustles',
    icon: { library: 'ionicons', name: 'briefcase' },
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
    examples: [
      'Get promoted to senior role',
      'Negotiate a raise',
      'Start a side business',
      'Build my personal brand',
    ],
  },
  {
    id: 'wealth', // ← matches pick-dreams
    name: 'Wealth',
    slug: 'wealth',
    description: 'Savings goals, investments, debt freedom',
    icon: { library: 'ionicons', name: 'wallet' },
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    examples: [
      'Save $10,000 emergency fund',
      'Pay off all credit cards',
      'Start investing',
      'Build passive income',
    ],
  },
  {
    id: 'mind', // ← matches pick-dreams
    name: 'Mindfulness',
    slug: 'mind',
    description: 'Mental health, meditation, inner peace',
    icon: { library: 'ionicons', name: 'leaf' },
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
    examples: [
      'Meditate daily for 10 minutes',
      'Start a gratitude journal',
      'Digital detox weekends',
      'Practice deep breathing',
    ],
  },
  {
    id: 'skills', // ← matches pick-dreams
    name: 'New Skills',
    slug: 'skills',
    description: 'Learn something new, courses, certifications',
    icon: { library: 'ionicons', name: 'school' },
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    examples: [
      'Learn a new language',
      'Complete coding bootcamp',
      'Read 24 books this year',
      'Get AWS certification',
    ],
  },
  {
    id: 'travel', // ← matches pick-dreams
    name: 'Travel',
    slug: 'travel',
    description: 'Explore the world, solo trips, bucket list destinations',
    icon: { library: 'ionicons', name: 'airplane' },
    color: '#06B6D4',
    gradient: ['#06B6D4', '#0891B2'],
    examples: [
      'Visit 10 countries this year',
      'Solo trip to Japan',
      'Road trip across Europe',
      'Learn to scuba dive',
    ],
  },
  {
    id: 'relationships', // ← matches pick-dreams
    name: 'Relationships',
    slug: 'relationships',
    description: 'Friendships, family, community, networking',
    icon: { library: 'ionicons', name: 'heart' },
    color: '#EC4899',
    gradient: ['#EC4899', '#DB2777'],
    examples: [
      'Make 5 new close friends',
      'Call family weekly',
      'Host monthly dinner parties',
      'Find a mentor',
    ],
  },
  {
    id: 'creativity', // ← matches pick-dreams
    name: 'Creativity',
    slug: 'creativity',
    description: 'Art, writing, music, crafts, content creation',
    icon: { library: 'ionicons', name: 'color-palette' },
    color: '#F97316',
    gradient: ['#F97316', '#EA580C'],
    examples: [
      'Write a novel',
      'Learn to paint',
      'Start a YouTube channel',
      'Record an album',
    ],
  },
]

// Get icon component based on library
export const getCategoryIcon = (
  category: DreamCategory,
  size: number = 24,
  color: string = '#FFF',
) => {
  const { library, name } = category.icon

  switch (library) {
    case 'ionicons':
      return { IconComponent: Ionicons, iconName: name as any }
    case 'material':
      return { IconComponent: MaterialCommunityIcons, iconName: name as any }
    case 'feather':
      return { IconComponent: Feather, iconName: name as any }
    default:
      return { IconComponent: Ionicons, iconName: 'star' as any }
  }
}

export const getCategoryById = (id: string): DreamCategory | undefined => {
  return DREAM_CATEGORIES.find((cat) => cat.id === id)
}
