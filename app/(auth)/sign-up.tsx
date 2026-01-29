// app/(auth)/sign-up.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { useAuthStore } from '@/src/store/authStore'
import { COLORS, FONTS, SPACING } from '@/src/constants/theme'

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
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SignUpForm) => {
    try {
      setIsLoading(true)
      await signUp(data.email, data.password, data.fullName)
      router.replace('/(onboarding)/intro')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING.md },
        ]}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name='arrow-back' size={24} color={COLORS.neutral[900]} />
        </TouchableOpacity>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Start your journey to achieving your dreams
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.form}
        >
          <Controller
            control={control}
            name='fullName'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label='Full Name'
                placeholder='Jane Doe'
                leftIcon='person-outline'
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
              <Input
                label='Email'
                placeholder='jane@example.com'
                leftIcon='mail-outline'
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
              <Input
                label='Password'
                placeholder='••••••••'
                leftIcon='lock-closed-outline'
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                autoCapitalize='none'
              />
            )}
          />

          <Button
            title='Create Account'
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            size='lg'
            style={{ marginTop: SPACING.md }}
          />
        </Animated.View>

        {/* Divider */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.divider}
        >
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* Social Buttons */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.socialButtons}
        >
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons
              name='logo-google'
              size={24}
              color={COLORS.neutral[700]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name='logo-apple' size={24} color={COLORS.neutral[700]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Sign In Link */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(500)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.neutral[500],
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  form: {
    gap: SPACING.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  dividerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.neutral[400],
    marginHorizontal: SPACING.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  footerLink: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.primary[500],
  },
})
