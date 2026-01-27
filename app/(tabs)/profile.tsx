import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/src/constants/theme';
import { useStore } from '@/src/store/useStore';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeText?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, showBadge, badgeText }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuItemLeft}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color={colors.accent.purple} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {showBadge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isPremium, dreams, currentStreak, setHasCompletedOnboarding } = useStore();

  const userName = user?.name || 'Alex';
  const userEmail = user?.email || 'alex@example.com';
  const totalTasks = dreams.reduce((acc, d) => acc + d.micro_actions.length, 0);
  const completedTasks = dreams.reduce(
    (acc, d) => acc + d.micro_actions.filter((a) => a.is_completed).length,
    0
  );

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset App',
      'This will reset the onboarding flow. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setHasCompletedOnboarding(false);
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={colors.gradients.primary as [string, string]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>

          {/* Premium badge */}
          {isPremium ? (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>👑 Pro Member</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/paywall')}
              style={styles.upgradeBadge}
            >
              <LinearGradient
                colors={['#F59E0B', '#FB923C']}
                style={styles.upgradeGradient}
              >
                <Text style={styles.upgradeText}>⭐ Upgrade to Pro</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dreams.length}</Text>
            <Text style={styles.statLabel}>Dreams</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => Alert.alert('Notifications', 'Coming soon!')}
          />
          <MenuItem
            icon="color-palette-outline"
            label="Appearance"
            onPress={() => Alert.alert('Appearance', 'Coming soon!')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy"
            onPress={() => Alert.alert('Privacy', 'Coming soon!')}
          />
        </View>

        <View style={styles.menuSection}>
          <MenuItem
            icon="chatbubble-outline"
            label="AI Dream Coach"
            onPress={() => router.push('/ai-coach')}
            showBadge
            badgeText="NEW"
          />
          <MenuItem
            icon="diamond-outline"
            label="DreamDo Pro"
            onPress={() => router.push('/paywall')}
          />
        </View>

        <View style={styles.menuSection}>
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Alert.alert('Help', 'Contact support@dreamdo.app')}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About"
            onPress={() => Alert.alert('DreamDo', 'Version 1.0.0\n\nMade with ❤️ for dreamers')}
          />
          <MenuItem
            icon="refresh-outline"
            label="Reset Onboarding"
            onPress={handleResetOnboarding}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DreamDo v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for dreamers</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxxl,
  },
  userName: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    marginTop: spacing.md,
  },
  userEmail: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
  premiumBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  premiumBadgeText: {
    color: colors.accent.gold,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
  },
  upgradeBadge: {
    marginTop: spacing.md,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  upgradeGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  upgradeText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
  },
  statLabel: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
  },
  menuSection: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    marginLeft: spacing.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.accent.pink,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  badgeText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.sm,
  },
  footerSubtext: {
    color: colors.text.muted,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
});
