import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, typography, spacing } from '@/src/constants/theme';
import { Quote } from '@/src/types';

interface QuoteCardProps {
  quote: Quote | null;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  if (!quote) return null;

  return (
    <LinearGradient
      colors={['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.05)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.quoteMarkContainer}>
        <Text style={styles.quoteMark}>"</Text>
      </View>
      <Text style={styles.quoteText}>{quote.text}</Text>
      <Text style={styles.author}>— {quote.author}</Text>
      <Text style={styles.label}>Quote Card</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    position: 'relative',
  },
  quoteMarkContainer: {
    position: 'absolute',
    top: 8,
    left: 12,
  },
  quoteMark: {
    fontSize: 48,
    color: 'rgba(139, 92, 246, 0.3)',
    fontFamily: typography.fontFamily.bold,
    lineHeight: 48,
  },
  quoteText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    fontStyle: 'italic',
    lineHeight: 22,
    marginTop: spacing.sm,
    marginLeft: spacing.xl,
    paddingRight: spacing.sm,
  },
  author: {
    color: colors.accent.gold,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  label: {
    color: colors.accent.pink,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
