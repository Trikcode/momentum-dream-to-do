// app/(modals)/help-center.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

const FAQ_DATA = [
  {
    question: 'What are Power Moves?',
    answer:
      "Power Moves are small, actionable steps that help you make progress on your dreams every day. They're designed to be achievable so you build momentum without feeling overwhelmed.",
  },
  {
    question: 'How does momentum work?',
    answer:
      "Your momentum grows as you complete daily Power Moves. Unlike streaks, momentum is forgiving—a missed day slows you down but doesn't reset your progress. Consistency builds unstoppable momentum!",
  },
  {
    question: 'What are Sparks?',
    answer:
      'Sparks are XP you earn by completing Power Moves. Harder tasks earn more Sparks. Collect Sparks to level up and unlock achievements.',
  },
  {
    question: 'How many dreams can I have?',
    answer:
      'Free users can have up to 3 active dreams. Premium unlocks unlimited dreams so you can pursue everything that matters to you.',
  },
  {
    question: "What's included in Premium?",
    answer:
      "Premium includes unlimited dreams, AI coaching, advanced insights, custom themes, and priority support. It's designed for ambitious dreamers who want to accelerate their progress.",
  },
  {
    question: 'How do I contact support?',
    answer:
      'Use the "Send Feedback" option in your profile, or email us at support@momentumapp.com. We typically respond within 24 hours.',
  },
]

export default function HelpCenterScreen() {
  const insets = useSafeAreaInsets()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={DARK.gradients.bg as [string, string, string]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color={DARK.text.primary} />
        </Pressable>
        <Text style={styles.title}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {FAQ_DATA.map((item, index) => (
          <Animated.View key={index} entering={FadeInDown.delay(index * 50)}>
            <FAQItem
              question={item.question}
              answer={item.answer}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleExpand(index)}
            />
          </Animated.View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Pressable
            style={styles.contactButton}
            onPress={() => router.push('/(modals)/feedback')}
          >
            <Ionicons
              name='chatbubble-outline'
              size={20}
              color={DARK.accent.rose}
            />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

function FAQItem({
  question,
  answer,
  isExpanded,
  onToggle,
}: {
  question: string
  answer: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? '180deg' : '0deg') }],
  }))

  return (
    <Pressable onPress={onToggle} style={styles.faqItem}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Animated.View style={iconStyle}>
          <Ionicons name='chevron-down' size={20} color={DARK.text.secondary} />
        </Animated.View>
      </View>
      {isExpanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { padding: SPACING.xs },
  title: { fontFamily: FONTS.semiBold, fontSize: 17, color: DARK.text.primary },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },

  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: DARK.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  faqItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: DARK.text.primary,
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: DARK.text.secondary,
    lineHeight: 20,
    marginTop: SPACING.sm,
  },

  contactSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  contactTitle: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: DARK.text.secondary,
    marginBottom: SPACING.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  contactButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: DARK.accent.rose,
  },
})
