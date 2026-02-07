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

import { useTheme } from '@/src/context/ThemeContext'
import { FONTS, SPACING, RADIUS, PALETTE } from '@/src/constants/new-theme'

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
  const { colors, isDark } = useTheme()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpand = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? [
                PALETTE.midnight.obsidian,
                PALETTE.midnight.slate,
                PALETTE.midnight.obsidian,
              ]
            : [colors.background, colors.backgroundSecondary, colors.background]
        }
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='arrow-back' size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          Frequently Asked Questions
        </Text>

        {FAQ_DATA.map((item, index) => (
          <Animated.View key={index} entering={FadeInDown.delay(index * 50)}>
            <FAQItem
              question={item.question}
              answer={item.answer}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleExpand(index)}
              colors={colors}
              isDark={isDark}
            />
          </Animated.View>
        ))}

        <View
          style={[
            styles.contactSection,
            {
              borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
            },
          ]}
        >
          <Text style={[styles.contactTitle, { color: colors.textSecondary }]}>
            Still need help?
          </Text>
          <Pressable
            style={[
              styles.contactButton,
              {
                backgroundColor: `${PALETTE.electric.cyan}15`,
                borderColor: `${PALETTE.electric.cyan}30`,
              },
            ]}
            onPress={() => router.push('/(modals)/feedback')}
          >
            <Ionicons
              name='chatbubble-outline'
              size={20}
              color={PALETTE.electric.cyan}
            />
            <Text
              style={[
                styles.contactButtonText,
                { color: PALETTE.electric.cyan },
              ]}
            >
              Contact Support
            </Text>
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
  colors,
  isDark,
}: {
  question: string
  answer: string
  isExpanded: boolean
  onToggle: () => void
  colors: any
  isDark: boolean
}) {
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? '180deg' : '0deg') }],
  }))

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.faqItem,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : colors.border,
        },
      ]}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: colors.text }]}>
          {question}
        </Text>
        <Animated.View style={iconStyle}>
          <Ionicons
            name='chevron-down'
            size={20}
            color={colors.textSecondary}
          />
        </Animated.View>
      </View>
      {isExpanded && (
        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
          {answer}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  faqItem: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
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
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
  contactSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
  },
  contactTitle: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    marginBottom: SPACING.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  contactButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
})
