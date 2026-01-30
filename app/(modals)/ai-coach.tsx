import React, { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  FadeInUp,
  Layout,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

// Logic
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

// Types (Mocked if missing)
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ANIMATED COMPONENTS

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user'

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      layout={Layout.springify()}
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {!isUser && (
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[DARK.accent.violet, '#7C3AED']}
            style={styles.avatarGradient}
          >
            <Ionicons name='sparkles' size={14} color='#FFF' />
          </LinearGradient>
        </View>
      )}

      <View
        style={[
          styles.bubbleContent,
          isUser ? styles.userBubbleContent : styles.assistantBubbleContent,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {message.content}
        </Text>
      </View>
    </Animated.View>
  )
}

const TypingIndicator = () => {
  const dot1 = useSharedValue(0)
  const dot2 = useSharedValue(0)
  const dot3 = useSharedValue(0)

  useEffect(() => {
    const breathe = (sv: any, delay: number) => {
      setTimeout(() => {
        sv.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 400 }),
            withTiming(0, { duration: 400 }),
          ),
          -1,
        )
      }, delay)
    }
    breathe(dot1, 0)
    breathe(dot2, 150)
    breathe(dot3, 300)
  }, [])

  const style1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }))
  const style2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }))
  const style3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }))

  return (
    <View style={styles.typingRow}>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={[DARK.accent.violet, '#7C3AED']}
          style={styles.avatarGradient}
        >
          <Ionicons name='sparkles' size={14} color='#FFF' />
        </LinearGradient>
      </View>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, style1]} />
        <Animated.View style={[styles.typingDot, style2]} />
        <Animated.View style={[styles.typingDot, style3]} />
      </View>
    </View>
  )
}

const QuickActions = ({ onSelect }: { onSelect: (t: string) => void }) => {
  const actions = [
    {
      label: '✨ Suggest Habits',
      text: 'Suggest daily micro-habits for my goal.',
    },
    {
      label: '🎯 Break Down Goal',
      text: 'Help me break down my big dream into steps.',
    },
    { label: '🔥 Boost Motivation', text: 'I need some motivation right now!' },
  ]

  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Ideas</Text>
      <View style={styles.quickActionsGrid}>
        {actions.map((action, i) => (
          <Pressable
            key={i}
            onPress={() => onSelect(action.text)}
            style={styles.actionChip}
          >
            <Text style={styles.actionChipText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function AICoachScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const scrollViewRef = useRef<ScrollView>(null)

  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello Dreamer! I'm your AI Coach. I'm here to help you turn your biggest ambitions into daily actions. What are you working on today?",
      timestamp: new Date(),
    },
  ])

  // Mocking AI response for UI demo purposes
  // Replace this with useTextGeneration from @fastshot/ai
  const generateResponse = async (prompt: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content:
            "That sounds like a powerful goal. Let's start small. Try dedicating just 15 minutes today to research. Momentum is built one step at a time.",
          timestamp: new Date(),
        },
      ])
      setIsLoading(false)
      scrollToBottom()
    }, 1500)
  }

  const scrollToBottom = () => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100,
    )
  }

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    scrollToBottom()

    await generateResponse(userMsg.content)
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: DARK.bg.primary }} />
        <LinearGradient
          colors={DARK.gradients.bg as [string, string, string]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name='close' size={24} color={DARK.text.secondary} />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Coach</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}

          {messages.length < 3 && !isLoading && (
            <QuickActions
              onSelect={(text) => {
                setInputText(text)
                handleSend()
              }}
            />
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: insets.bottom + SPACING.sm },
          ]}
        >
          <BlurView
            intensity={20}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.inputInner}>
            <TextInput
              style={styles.textInput}
              placeholder='Ask for advice...'
              placeholderTextColor={DARK.text.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={DARK.gradients.primary as [string, string]}
                style={styles.sendGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size='small' color='#FFF' />
                ) : (
                  <Ionicons name='arrow-up' size={20} color='#FFF' />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.bg.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(15, 17, 21, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerInfo: { alignItems: 'center' },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: DARK.text.primary,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 10,
    color: '#10B981',
    fontFamily: FONTS.medium,
  },

  // Chat
  chatContainer: { flex: 1 },
  chatContent: { padding: SPACING.md },

  messageBubble: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  userBubble: { justifyContent: 'flex-end' },
  assistantBubble: { justifyContent: 'flex-start' },

  avatarContainer: {
    marginRight: SPACING.sm,
    marginTop: 'auto',
  },
  avatarGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bubbleContent: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  userBubbleContent: {
    backgroundColor: DARK.accent.rose,
    borderBottomRightRadius: 4,
  },
  assistantBubbleContent: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  userText: { color: '#FFF' },
  assistantText: { color: DARK.text.primary },

  // Typing
  typingRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DARK.text.tertiary,
  },

  // Quick Actions
  quickActionsContainer: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  quickActionsTitle: {
    color: DARK.text.muted,
    fontSize: 12,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  actionChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionChipText: {
    color: DARK.text.secondary,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },

  // Input
  inputBar: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.xl,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontFamily: FONTS.regular,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
