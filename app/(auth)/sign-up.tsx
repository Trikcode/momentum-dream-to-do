import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/src/store/authStore'

const { width } = Dimensions.get('window')

// ============================================================================
// LOCAL THEME (To ensure no breakage and perfect look)
// ============================================================================
const THEME = {
  colors: {
    background: '#0F1115',
    surface: '#181B25',
    primary: '#F43F5E',
    primaryGradient: ['#F43F5E', '#E11D48'],
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    border: 'rgba(255,255,255,0.1)',
    inputBg: 'rgba(20, 22, 30, 0.6)',
    error: '#EF4444',
  },
}

// ============================================================================
// CUSTOM COMPONENT: GLASS INPUT
// ============================================================================
const GlassInput = ({ label, icon, error, isPassword, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const borderColor = error
    ? THEME.colors.error
    : isFocused
      ? THEME.colors.primary
      : THEME.colors.border

  const iconColor = error
    ? THEME.colors.error
    : isFocused
      ? THEME.colors.primary
      : THEME.colors.textSecondary

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor }]}>
        {/* Glass Background */}
        <BlurView intensity={20} tint='dark' style={StyleSheet.absoluteFill} />

        <Ionicons
          name={icon}
          size={20}
          color={iconColor}
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor={THEME.colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            props.onBlur?.()
          }}
          secureTextEntry={isPassword && !showPassword}
          selectionColor={THEME.colors.primary}
          {...props}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={THEME.colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Animated.Text entering={FadeInUp} style={styles.errorText}>
          {error}
        </Animated.Text>
      )}
    </View>
  )
}

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpScreen() {
  const insets = useSafeAreaInsets()
  const [isLoading, setIsLoading] = useState(false)
  const signUp = useAuthStore((state) => state.signUp)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  const onSubmit = async (data: SignUpForm) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      setIsLoading(true)
      await signUp(data.email, data.password, data.fullName)
      router.replace('/(onboarding)/intro')
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      Alert.alert(
        'Registration Failed',
        error.message || 'Something went wrong',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      {/* Ambient Background Gradient */}
      <LinearGradient
        colors={[THEME.colors.background, '#161B22', THEME.colors.background]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Blur Orb (Top Right) */}
      <View style={styles.orb} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20 },
          ]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <BlurView
                intensity={30}
                tint='light'
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name='arrow-back' size={24} color='#FFF' />
            </Pressable>
          </Animated.View>

          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.header}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your journey to building momentum.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.form}
          >
            <Controller
              control={control}
              name='fullName'
              render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput
                  label='Full Name'
                  placeholder='Jane Doe'
                  icon='person-outline'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                  autoCapitalize='words'
                />
              )}
            />

            <Controller
              control={control}
              name='email'
              render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput
                  label='Email'
                  placeholder='jane@example.com'
                  icon='mail-outline'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType='email-address'
                  autoCapitalize='none'
                />
              )}
            />

            <Controller
              control={control}
              name='password'
              render={({ field: { onChange, onBlur, value } }) => (
                <GlassInput
                  label='Password'
                  placeholder='••••••••'
                  icon='lock-closed-outline'
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  isPassword
                  autoCapitalize='none'
                />
              )}
            />

            {/* Primary Button */}
            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
              ]}
            >
              <LinearGradient
                colors={THEME.colors.primaryGradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  StyleSheet.absoluteFill,
                  { justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color='#FFF' />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.divider}
          >
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Social Buttons */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(600)}
            style={styles.socialButtons}
          >
            <Pressable style={styles.socialButton}>
              <Ionicons name='logo-google' size={24} color='#FFF' />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name='logo-apple' size={24} color='#FFF' />
            </Pressable>
          </Animated.View>

          {/* Footer Link */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  orb: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: THEME.colors.primary,
    opacity: 0.15,
    filter: 'blur(80px)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: THEME.colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  // Custom Input Styles
  inputContainer: {
    gap: 8,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginLeft: 4,
  },
  inputWrapper: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: THEME.colors.text,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: THEME.colors.error,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 4,
  },
  // Primary Button
  primaryButton: {
    height: 56,
    borderRadius: 28,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginHorizontal: 16,
  },
  // Social
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  footerLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: THEME.colors.primary,
  },
})
