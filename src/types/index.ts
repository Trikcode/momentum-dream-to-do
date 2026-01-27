export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  is_premium: boolean;
  streak_count: number;
  total_dreams: number;
  completed_dreams: number;
}

export interface Dream {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: DreamCategory;
  image_url?: string;
  progress: number;
  streak_count: number;
  is_active: boolean;
  created_at: string;
  target_date?: string;
  milestones: Milestone[];
  micro_actions: MicroAction[];
}

export interface Milestone {
  id: string;
  dream_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  completed_at?: string;
  order: number;
}

export interface MicroAction {
  id: string;
  dream_id: string;
  milestone_id?: string;
  title: string;
  description?: string;
  is_completed: boolean;
  completed_at?: string;
  is_daily: boolean;
  current_count?: number;
  target_count?: number;
  unit?: string;
}

export type DreamCategory =
  | 'travel'
  | 'career'
  | 'fitness'
  | 'wellness'
  | 'learning'
  | 'creativity'
  | 'finance'
  | 'relationships';

export interface CategoryInfo {
  id: DreamCategory;
  title: string;
  icon: string;
  color: string;
  gradient: string[];
}

export interface Quote {
  id: string;
  text: string;
  author: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface OnboardingState {
  currentStep: number;
  selectedCategories: DreamCategory[];
  firstDream?: Partial<Dream>;
}

export interface Stats {
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
  dreamsCompleted: number;
  weeklyProgress: number[];
}
