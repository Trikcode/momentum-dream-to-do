import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTextGeneration } from '@fastshot/ai';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/src/constants/theme';
import { ChatMessage } from '@/src/types';
import * as Haptics from 'expo-haptics';

// System prompt for the AI Dream Coach
const SYSTEM_PROMPT = `You are DreamDo AI Coach, an enthusiastic and supportive AI assistant that helps users achieve their dreams and goals. Your personality is:

- Encouraging and motivational
- Practical and action-oriented
- Empathetic and understanding
- Concise but helpful

When users share their dreams or goals:
1. Acknowledge their dream positively
2. Break it down into specific, actionable micro-steps
3. Suggest daily habits that support the goal
4. Provide encouragement and motivation

Keep responses concise (2-3 paragraphs max) and use emojis sparingly to add warmth.
Format action items as numbered lists for clarity.`;

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {!isUser && (
        <View style={styles.assistantAvatar}>
          <Text style={styles.avatarEmoji}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.messageContent,
          isUser ? styles.userContent : styles.assistantContent,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
};

// Typing indicator component
const TypingIndicator: React.FC = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1
    );
    setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1
      );
    }, 100);
    setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1
      );
    }, 200);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <View style={styles.typingContainer}>
      <View style={styles.assistantAvatar}>
        <Text style={styles.avatarEmoji}>🤖</Text>
      </View>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, dot1Style]} />
        <Animated.View style={[styles.typingDot, dot2Style]} />
        <Animated.View style={[styles.typingDot, dot3Style]} />
      </View>
    </View>
  );
};

// Quick action buttons
const QuickActions: React.FC<{ onSelect: (text: string) => void }> = ({ onSelect }) => {
  const actions = [
    { label: 'Generate Vision Board', text: 'Help me visualize my dream' },
    { label: 'Suggest Micro-Actions', text: 'Suggest daily micro-actions for my goal' },
  ];

  return (
    <View style={styles.quickActions}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.quickActionButton}
          onPress={() => onSelect(action.text)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            style={styles.quickActionGradient}
          >
            <Text style={styles.quickActionText}>{action.label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function AICoachScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "That's an amazing dream! Let's break it down into micro-actions:\n\n1. Outline your plot (1 week).\n2. Develop character profiles (3 days).\n3. Write 500 words daily (ongoing).",
      timestamp: new Date(),
    },
  ]);

  const { generateText, isLoading, error, reset } = useTextGeneration({
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response || "I'm here to help you achieve your dreams! What would you like to work on today?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      scrollToBottom();
    },
    onError: (err) => {
      console.error('AI generation error:', err);
      // Add error message as assistant response
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment! 🙏",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    scrollToBottom();

    // Build context from recent messages
    const recentMessages = messages.slice(-4).map((m) =>
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n');

    const prompt = `${SYSTEM_PROMPT}\n\nConversation history:\n${recentMessages}\n\nUser: ${userMessage.content}\n\nAssistant:`;

    // Generate AI response
    reset();
    await generateText(prompt);
  };

  const handleQuickAction = (text: string) => {
    setInputText(text);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>AI Dream Coach</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome message */}
          {messages.length === 1 && (
            <View style={styles.welcomeSection}>
              <LinearGradient
                colors={colors.gradients.primary as [string, string]}
                style={styles.welcomeAvatar}
              >
                <Text style={styles.welcomeEmoji}>🤖</Text>
              </LinearGradient>
              <Text style={styles.welcomeTitle}>Hi! I'm your Dream Coach</Text>
              <Text style={styles.welcomeText}>
                I can help you break down big dreams into achievable daily actions.
                What dream would you like to work on?
              </Text>
            </View>
          )}

          {/* Messages list */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          {/* Quick actions - show when no recent user messages */}
          {messages.length <= 2 && !isLoading && (
            <QuickActions onSelect={handleQuickAction} />
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input area */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything about your dreams..."
              placeholderTextColor={colors.text.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.primary} />
              ) : (
                <LinearGradient
                  colors={
                    inputText.trim()
                      ? (colors.gradients.primary as [string, string])
                      : ['#4A4A5A', '#3A3A4A']
                  }
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendText}>Send</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    alignItems: 'center',
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.lg,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
  },
  welcomeSection: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  welcomeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  welcomeEmoji: {
    fontSize: 40,
  },
  welcomeTitle: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  messageContent: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userContent: {
    backgroundColor: colors.accent.purple,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  assistantContent: {
    backgroundColor: colors.background.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.muted,
    marginHorizontal: 2,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  quickActionButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  quickActionGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: borderRadius.full,
  },
  quickActionText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  inputContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  sendText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
  },
});
