import React from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets()

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
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: February 2025</Text>

        <Section title='1. Information We Collect'>
          We collect information you provide directly, including your name,
          email address, and the dreams and goals you create in the app. We also
          collect usage data to improve your experience.
        </Section>

        <Section title='2. How We Use Your Information'>
          Your data is used to provide and improve Momentum's features, send you
          relevant notifications, and personalize your experience. We never sell
          your personal data to third parties.
        </Section>

        <Section title='3. Data Storage & Security'>
          Your data is securely stored using industry-standard encryption. We
          use Supabase for our backend infrastructure, which provides
          enterprise-grade security.
        </Section>

        <Section title='4. Your Rights'>
          You can access, update, or delete your personal data at any time
          through your profile settings. To request a full data export or
          account deletion, contact us at privacy@momentumapp.com.
        </Section>

        <Section title='5. Analytics'>
          We use anonymized analytics to understand how users interact with
          Momentum. This helps us build better features and fix issues faster.
        </Section>

        <Section title='6. Third-Party Services'>
          Momentum integrates with RevenueCat for subscription management and
          Apple/Google for payment processing. These services have their own
          privacy policies.
        </Section>

        <Section title='7. Changes to This Policy'>
          We may update this policy from time to time. We'll notify you of
          significant changes via email or in-app notification.
        </Section>

        <Section title='8. Contact Us'>
          Questions about privacy? Email us at privacy@momentumapp.com
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
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

  lastUpdated: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: DARK.text.muted,
    marginBottom: SPACING.xl,
  },

  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: DARK.text.primary,
    marginBottom: SPACING.sm,
  },
  sectionText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: DARK.text.secondary,
    lineHeight: 22,
  },
})
