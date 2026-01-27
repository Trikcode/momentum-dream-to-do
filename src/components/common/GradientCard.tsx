import React from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows } from '@/src/constants/theme';

interface GradientCardProps {
  children: React.ReactNode;
  gradient?: string[];
  style?: ViewStyle;
  borderGradient?: boolean;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  gradient = colors.gradients.card,
  style,
  borderGradient = false,
}) => {
  if (borderGradient) {
    return (
      <LinearGradient
        colors={colors.gradients.primary as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.borderGradient, style]}
      >
        <View style={styles.innerCard}>{children}</View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradient as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: 16,
    ...shadows.card,
  },
  borderGradient: {
    borderRadius: borderRadius.lg,
    padding: 1.5,
    ...shadows.card,
  },
  innerCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg - 1,
    padding: 16,
  },
});
