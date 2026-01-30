// src/components/home/MantraHeader.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { DARK, FONTS, SPACING, RADIUS } from '@/src/constants/theme'
import { getMantra } from '@/src/constants/language'
import { format } from 'date-fns'

export function MantraHeader({
  userName,
  chapter,
}: {
  userName: string
  chapter: number
}) {
  const [mantra, setMantra] = useState('')
  const firstName = userName.split(' ')[0]
  const today = format(new Date(), 'EEEE, MMM d')

  useEffect(() => {
    setMantra(getMantra())
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.topRow}>
        <Text style={styles.date}>{today}</Text>
        <View style={styles.chapterTag}>
          <Ionicons name='bookmark' size={10} color={DARK.accent.gold} />
          <Text style={styles.chapterText}>Chapter {chapter}</Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200)}
        style={styles.greetingWrapper}
      >
        <Text style={styles.greeting}>Hello,</Text>
        {/* Gradient Text Effect using MaskedView is ideal, but for now using a subtle text gradient simulation */}
        <Text style={[styles.greeting, { color: DARK.accent.rose }]}>
          {firstName}
        </Text>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(300)} style={styles.mantra}>
        "{mantra}"
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  date: {
    color: DARK.text.tertiary,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chapterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  chapterText: {
    color: DARK.accent.gold,
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  greetingWrapper: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'baseline',
  },
  greeting: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: DARK.text.primary,
    letterSpacing: -1,
  },
  mantra: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: DARK.text.secondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
})
