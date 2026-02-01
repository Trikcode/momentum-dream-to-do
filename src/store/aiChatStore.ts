import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ChatMessage } from '@/src/lib/minimax'

interface AIChatState {
  messages: ChatMessage[]
  freeUsageCount: number
  addMessage: (message: ChatMessage) => void
  incrementUsage: () => void
  clearChat: () => void
  setMessages: (messages: ChatMessage[]) => void
}

export const useAIChatStore = create<AIChatState>()(
  persist(
    (set) => ({
      messages: [],
      freeUsageCount: 0,

      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      setMessages: (messages) => set({ messages }),

      incrementUsage: () =>
        set((state) => ({ freeUsageCount: state.freeUsageCount + 1 })),

      clearChat: () => set({ messages: [] }), // Keeps usage count, just clears history
    }),
    {
      name: 'momentum-ai-chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
