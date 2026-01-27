import { CategoryInfo, DreamCategory } from '@/src/types';

export const DREAM_CATEGORIES: CategoryInfo[] = [
  {
    id: 'travel',
    title: 'Travel',
    icon: '✈️',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
  },
  {
    id: 'career',
    title: 'Career',
    icon: '💼',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  {
    id: 'fitness',
    title: 'Fitness',
    icon: '💪',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    id: 'wellness',
    title: 'Wellness',
    icon: '🧘',
    color: '#14B8A6',
    gradient: ['#14B8A6', '#0D9488'],
  },
  {
    id: 'learning',
    title: 'Learning',
    icon: '📚',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    id: 'creativity',
    title: 'Creativity',
    icon: '🎨',
    color: '#EC4899',
    gradient: ['#EC4899', '#DB2777'],
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: '💰',
    color: '#22C55E',
    gradient: ['#22C55E', '#16A34A'],
  },
  {
    id: 'relationships',
    title: 'Relationships',
    icon: '❤️',
    color: '#F43F5E',
    gradient: ['#F43F5E', '#E11D48'],
  },
];

export const getCategoryById = (id: DreamCategory): CategoryInfo | undefined => {
  return DREAM_CATEGORIES.find((cat) => cat.id === id);
};
