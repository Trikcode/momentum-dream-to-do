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
import { useAIChatStore } from '@/src/store/aiChatStore'
import { generateAIResponse, ChatMessage } from '@/src/lib/minimax'
import {
  FONTS,
  SPACING,
  RADIUS,
  SHADOWS,
  PALETTE,
  GRADIENTS,
} from '@/src/constants/new-theme'
import { usePremiumStore } from '@/src/store/premiumStore'

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
            colors={GRADIENTS.electric}
            style={styles.avatarGradient}
          >
            <Ionicons
              name='sparkles'
              size={10}
              color={PALETTE.midnight.obsidian}
            />
          </LinearGradient>
        </View>
      )}

      {isUser ? (
        <LinearGradient
          colors={GRADIENTS.electricAlt}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={styles.messageText}>{message.content}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.aiBubble]}>
          <Text style={[styles.messageText, { color: PALETTE.slate[200] }]}>
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
          colors={GRADIENTS.electric}
          style={styles.avatarGradient}
        >
          <Ionicons
            name='sparkles'
            size={10}
            color={PALETTE.midnight.obsidian}
          />
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
          <Ionicons
            name={item.icon as any}
            size={14}
            color={PALETTE.electric.cyan}
          />
          <Text style={styles.actionText}>{item.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  </Animated.View>
)

const WelcomeView = ({ name }: { name: string }) => (
  <Animated.View
    entering={FadeIn.duration(600)}
    style={styles.welcomeContainer}
  >
    <View style={styles.welcomeLogo}>
      <LinearGradient colors={GRADIENTS.electric} style={styles.logoGradient}>
        <Ionicons
          name='chatbubble-ellipses'
          size={32}
          color={PALETTE.midnight.obsidian}
        />
      </LinearGradient>
    </View>
    <Text style={styles.welcomeTitle}>Hi {name}</Text>
    <Text style={styles.welcomeSubtitle}>
      I can help you plan, focus, and win.{'\n'}What's on your mind?
    </Text>
  </Animated.View>
)

export default function AICoachScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const scrollViewRef = useRef<ScrollView>(null)

  const profile = useAuthStore((s) => s.profile)
  const { messages, addMessage, clearChat, freeUsageCount, incrementUsage } =
    useAIChatStore()

  const { isPremium } = usePremiumStore()

  const FREE_LIMIT = 5
  const remainingFree = Math.max(0, FREE_LIMIT - freeUsageCount)

  const userName = profile?.full_name?.split(' ')[0] || 'there'
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const keyboardHeight = useRef(new RNAnimated.Value(0)).current

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 500)
    }
  }, [])

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

    const userMsg: ChatMessage = { role: 'user', content: msgText }
    addMessage(userMsg)

    if (!isPremium) {
      incrementUsage()
    }

    setInputText('')
    setIsLoading(true)
    scrollToBottom()

    try {
      const aiResponse = await generateAIResponse(messages, msgText, userName)
      const aiMsg: ChatMessage = { role: 'assistant', content: aiResponse }
      addMessage(aiMsg)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (err) {
      console.error('AI error:', err)
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
    <View
      style={[styles.container, { backgroundColor: PALETTE.midnight.obsidian }]}
    >
      <StatusBar barStyle='light-content' />

      <LinearGradient
        colors={[PALETTE.midnight.obsidian, PALETTE.midnight.slate]}
        style={StyleSheet.absoluteFill}
      />

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

          {messages.length > 0 ? (
            <Pressable onPress={handleClearChat} style={styles.backButton}>
              <Ionicons
                name='trash-outline'
                size={20}
                color={PALETTE.slate[400]}
              />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

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

      <RNAnimated.View
        style={[
          styles.inputContainer,
          {
            bottom: keyboardHeight,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          },
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={80}
            tint='dark'
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.inputBorder} />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder={'Ask for advice...'}
            placeholderTextColor={PALETTE.slate[500]}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType='send'
            onSubmitEditing={() => handleSend()}
            blurOnSubmit={false}
            selectionColor={PALETTE.electric.cyan}
          />

          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={GRADIENTS.electric}
              style={StyleSheet.absoluteFill}
            />
            {isLoading ? (
              <ActivityIndicator
                size='small'
                color={PALETTE.midnight.obsidian}
              />
            ) : (
              <Ionicons
                name='arrow-up'
                size={20}
                color={PALETTE.midnight.obsidian}
              />
            )}
          </TouchableOpacity>
        </View>
      </RNAnimated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: PALETTE.electric.emerald,
  },
  statusText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: PALETTE.slate[400],
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  welcomeLogo: {
    marginBottom: 20,
    ...SHADOWS.glow(PALETTE.electric.cyan),
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
    color: PALETTE.slate[400],
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  quickActionContainer: {
    marginBottom: 20,
  },
  quickActionScroll: {
    gap: 12,
    paddingHorizontal: 4,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#FFF',
    lineHeight: 22,
  },
  typingRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.slate[400],
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
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
    borderColor: 'rgba(255,255,255,0.1)',
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
