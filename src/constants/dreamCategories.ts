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

export const DREAM_CATEGORIES: DreamCategory[] = [
  {
    id: '1',
    name: 'Travel & Adventure',
    slug: 'travel',
    description: 'Explore the world, solo trips, bucket list destinations',
    icon: { library: 'ionicons', name: 'airplane' },
    color: '#F43F5E',
    gradient: ['#F43F5E', '#E11D48'],
    examples: [
      'Visit 10 countries this year',
      'Solo trip to Japan',
      'Road trip across Europe',
      'Learn to scuba dive',
    ],
  },
  {
    id: '2',
    name: 'Career & Success',
    slug: 'career',
    description: 'Promotions, salary goals, dream jobs, side hustles',
    icon: { library: 'ionicons', name: 'rocket' },
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    examples: [
      'Get promoted to senior role',
      'Negotiate a raise',
      'Start a side business',
      'Build my personal brand',
    ],
  },
  {
    id: '3',
    name: 'Health & Fitness',
    slug: 'fitness',
    description: 'Workouts, wellness goals, healthy habits',
    icon: { library: 'ionicons', name: 'fitness' },
    color: '#22C55E',
    gradient: ['#22C55E', '#16A34A'],
    examples: [
      'Run a marathon',
      'Workout 4x per week',
      'Lose 20 pounds',
      'Complete a yoga challenge',
    ],
  },
  {
    id: '4',
    name: 'Financial Freedom',
    slug: 'finance',
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
    id: '5',
    name: 'Learning & Growth',
    slug: 'learning',
    description: 'New skills, courses, languages, certifications',
    icon: { library: 'ionicons', name: 'book' },
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
    examples: [
      'Learn Spanish fluently',
      'Complete coding bootcamp',
      'Read 24 books this year',
      'Get AWS certification',
    ],
  },
  {
    id: '6',
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
    id: '7',
    name: 'Creativity',
    slug: 'creativity',
    description: 'Art, writing, music, crafts, content creation',
    icon: { library: 'ionicons', name: 'color-palette' },
    color: '#06B6D4',
    gradient: ['#06B6D4', '#0891B2'],
    examples: [
      'Write a novel',
      'Learn to paint',
      'Start a YouTube channel',
      'Record an album',
    ],
  },
  {
    id: '8',
    name: 'Home & Lifestyle',
    slug: 'lifestyle',
    description: 'Dream home, organization, minimalism',
    icon: { library: 'ionicons', name: 'home' },
    color: '#84CC16',
    gradient: ['#84CC16', '#65A30D'],
    examples: [
      'Buy my first home',
      'Declutter entire house',
      'Create a morning routine',
      'Design my dream office',
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
