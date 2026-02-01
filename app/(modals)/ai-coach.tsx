// app/(modals)/ai-coach.tsx
import React, { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Pressable,
  Keyboard,
  Animated as RNAnimated,
  StatusBar,
  Alert,
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
  FadeIn,
  Layout,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import { useAuthStore } from '@/src/store/authStore'
import { useAIChatStore } from '@/src/store/aiChatStore' // <--- NEW IMPORT
import { generateAIResponse, ChatMessage } from '@/src/lib/minimax'
import { FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { usePremiumStore } from '@/src/store/premiumStore'

// =============================================================================
// THEME
// =============================================================================
const THEME = {
  colors: {
    background: '#0F1115',
    primary: ['#A855F7', '#7C3AED'] as const,
    userBubble: ['#F43F5E', '#E11D48'] as const,
    aiBubble: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    border: 'rgba(255,255,255,0.1)',
  },
}

// =============================================================================
// COMPONENTS
// =============================================================================

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user'

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      layout={Layout.springify()}
      style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}
    >
      {!isUser && (
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={THEME.colors.primary}
            style={styles.avatarGradient}
          >
            <Ionicons name='sparkles' size={10} color='#FFF' />
          </LinearGradient>
        </View>
      )}

      {isUser ? (
        <LinearGradient
          colors={THEME.colors.userBubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={styles.messageText}>{message.content}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.aiBubble]}>
          <Text style={[styles.messageText, { color: '#E2E8F0' }]}>
            {message.content}
          </Text>
        </View>
      )}
    </Animated.View>
  )
}

const TypingIndicator = () => {
  const dot1 = useSharedValue(0)
  const dot2 = useSharedValue(0)
  const dot3 = useSharedValue(0)

  useEffect(() => {
    const animate = (sv: any, delay: number) => {
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
    animate(dot1, 0)
    animate(dot2, 150)
    animate(dot3, 300)
  }, [])

  const s1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }))
  const s2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }))
  const s3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }))

  return (
    <View style={styles.typingRow}>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={THEME.colors.primary}
          style={styles.avatarGradient}
        >
          <Ionicons name='sparkles' size={10} color='#FFF' />
        </LinearGradient>
      </View>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.dot, s1]} />
        <Animated.View style={[styles.dot, s2]} />
        <Animated.View style={[styles.dot, s3]} />
      </View>
    </View>
  )
}

// Minimal Quick Actions (Horizontal Chips)
const QUICK_ACTIONS = [
  {
    icon: 'flash-outline',
    label: 'Break down goal',
    text: 'Help me break down my goal into 3 small actionable steps.',
  },
  {
    icon: 'calendar-outline',
    label: 'Daily habits',
    text: 'Suggest 1 micro-habit I can start today.',
  },
  {
    icon: 'flame-outline',
    label: 'Motivate me',
    text: 'I am feeling stuck. Give me a pep talk.',
  },
]

const QuickActions = ({ onSelect }: { onSelect: (t: string) => void }) => (
  <Animated.View
    entering={FadeIn.delay(300)}
    style={styles.quickActionContainer}
  >
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quickActionScroll}
    >
      {QUICK_ACTIONS.map((item, i) => (
        <Pressable
          key={i}
          style={({ pressed }) => [
            styles.actionChip,
            pressed && styles.actionChipPressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            onSelect(item.text)
          }}
        >
          <Ionicons name={item.icon as any} size={14} color='#A855F7' />
          <Text style={styles.actionText}>{item.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  </Animated.View>
)

// Minimal Welcome View (No Card)
const WelcomeView = ({ name }: { name: string }) => (
  <Animated.View
    entering={FadeIn.duration(600)}
    style={styles.welcomeContainer}
  >
    <View style={styles.welcomeLogo}>
      <LinearGradient colors={THEME.colors.primary} style={styles.logoGradient}>
        <Ionicons name='chatbubble-ellipses' size={32} color='#FFF' />
      </LinearGradient>
    </View>
    <Text style={styles.welcomeTitle}>Hi {name}</Text>
    <Text style={styles.welcomeSubtitle}>
      I can help you plan, focus, and win.{'\n'}What's on your mind?
    </Text>
  </Animated.View>
)

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function AICoachScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const scrollViewRef = useRef<ScrollView>(null)

  const profile = useAuthStore((s) => s.profile)
  const { messages, addMessage, clearChat, freeUsageCount, incrementUsage } =
    useAIChatStore()

  const { isPremium, getDreamsLimit, setShowPaywall } = usePremiumStore()

  const FREE_LIMIT = 5
  const remainingFree = Math.max(0, FREE_LIMIT - freeUsageCount)

  const userName = profile?.full_name?.split(' ')[0] || 'there'
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Keyboard Animation
  const keyboardHeight = useRef(new RNAnimated.Value(0)).current

  // Scroll to bottom on load if there are messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 500)
    }
  }, [])

  // Keyboard Handler
  useEffect(() => {
    const keyboardWillShow = (e: any) => {
      RNAnimated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? e.duration : 250,
        useNativeDriver: false,
      }).start()
      scrollToBottom()
    }

    const keyboardWillHide = (e: any) => {
      RNAnimated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? e.duration : 250,
        useNativeDriver: false,
      }).start()
    }

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, keyboardWillShow)
    const hideSub = Keyboard.addListener(hideEvent, keyboardWillHide)

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  // Clear Chat Logic (Premium Only)
  const handleClearChat = () => {
    Alert.alert(
      'Start New Chat?',
      'This will clear your current conversation history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearChat()
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          },
        },
      ],
    )
  }

  const showUpgradePrompt = () => {
    Alert.alert(
      'Limit Reached',
      'You have used your 5 free AI coaching sessions. Upgrade to Premium for unlimited coaching!',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: () => router.push('/(modals)/premium' as any),
        },
      ],
    )
  }

  const handleSend = async (text?: string) => {
    const msgText = text || inputText.trim()
    if (!msgText || isLoading) return

    if (!isPremium && freeUsageCount >= FREE_LIMIT) {
      showUpgradePrompt()
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Optimistic Update
    const userMsg: ChatMessage = { role: 'user', content: msgText }
    addMessage(userMsg) // Save to persistent store

    // Increment usage for free users
    if (!isPremium) {
      incrementUsage()
    }

    setInputText('')
    setIsLoading(true)
    scrollToBottom()

    try {
      const aiResponse = await generateAIResponse(messages, msgText, userName)
      const aiMsg: ChatMessage = { role: 'assistant', content: aiResponse }
      addMessage(aiMsg) // Save to persistent store
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (err) {
      console.error('AI error:', err)
      // We don't save error messages to store usually, just show them locally or alert
      Alert.alert(
        'Connection Error',
        'Could not reach the coach. Please try again.',
      )
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* Background */}
      <LinearGradient
        colors={[THEME.colors.background, '#151A23']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name='chevron-down' size={24} color='#FFF' />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Momentum Coach</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {isPremium ? 'Premium' : `${remainingFree} free messages left`}
              </Text>
            </View>
          </View>

          {/* New Chat Button (Only visible if messages exist & Premium/History enabled) */}
          {messages.length > 0 ? (
            <Pressable onPress={handleClearChat} style={styles.backButton}>
              <Ionicons name='trash-outline' size={20} color='#94A3B8' />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      {/* Chat Area */}
      <RNAnimated.View style={{ flex: 1, marginBottom: keyboardHeight }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode='interactive'
          keyboardShouldPersistTaps='handled'
        >
          {messages.length === 0 && <WelcomeView name={userName} />}

          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          {isLoading && <TypingIndicator />}

          {messages.length === 0 && !isLoading && (
            <QuickActions onSelect={(t) => handleSend(t)} />
          )}
        </ScrollView>
      </RNAnimated.View>

      {/* Input Bar */}
      <RNAnimated.View
        style={[
          styles.inputContainer,
          {
            bottom: keyboardHeight,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          },
        ]}
      >
        <BlurView intensity={80} tint='dark' style={StyleSheet.absoluteFill} />
        <View style={styles.inputBorder} />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder={'Ask for advice...'}
            placeholderTextColor='rgba(255,255,255,0.4)'
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType='send'
            onSubmitEditing={() => handleSend()}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={THEME.colors.primary}
              style={StyleSheet.absoluteFill}
            />
            {isLoading ? (
              <ActivityIndicator size='small' color='#FFF' />
            ) : (
              <Ionicons name='arrow-up' size={20} color='#FFF' />
            )}
          </TouchableOpacity>
        </View>
      </RNAnimated.View>
    </View>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },

  // Header
  header: {
    backgroundColor: 'rgba(15, 17, 21, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    zIndex: 20,
  },
  headerContent: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: '#FFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },

  // Scroll Content
  scrollContent: {
    padding: 20,
    paddingTop: 30,
  },

  // Welcome View (Minimal)
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  welcomeLogo: {
    marginBottom: 20,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#FFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  // Minimal Quick Actions (Chips)
  quickActionContainer: {
    marginBottom: 20,
  },
  quickActionScroll: {
    gap: 12,
    paddingHorizontal: 4, // slight offset
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  actionChipPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: '#FFF',
  },

  // Messages
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },

  avatarContainer: {
    marginRight: 8,
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  avatarGradient: {
    width: 26,
    height: 26,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: THEME.colors.aiBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  messageText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#FFF',
    lineHeight: 22,
  },

  // Typing
  typingRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.aiBubble,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.textSecondary,
  },

  // Input Bar (Absolute)
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 6,
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontFamily: FONTS.regular,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
