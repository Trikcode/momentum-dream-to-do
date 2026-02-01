// src/components/shared/Toast.tsx
import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  SlideInUp,
  SlideOutUp,
  Easing,
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme'

const { width } = Dimensions.get('window')

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const insets = useSafeAreaInsets()

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()

    // Haptic feedback based on type
    if (toast.type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else if (toast.type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto dismiss
    setTimeout(() => {
      hideToast(id)
    }, toast.duration || 3000)
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View
        style={[styles.container, { top: insets.top + SPACING.md }]}
        pointerEvents='box-none'
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => hideToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) {
  const typeConfig = {
    success: {
      icon: 'checkmark-circle' as const,
      color: COLORS.success[500],
      bgColor: COLORS.success[50],
    },
    error: {
      icon: 'close-circle' as const,
      color: COLORS.error,
      bgColor: '#FEE2E2',
    },
    warning: {
      icon: 'warning' as const,
      color: COLORS.warning,
      bgColor: COLORS.accent[50],
    },
    info: {
      icon: 'information-circle' as const,
      color: COLORS.info,
      bgColor: '#EFF6FF',
    },
  }

  const config = typeConfig[toast.type]

  return (
    <Animated.View
      entering={SlideInUp.duration(350).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutUp.duration(250).easing(Easing.in(Easing.cubic))}
      style={styles.toast}
    >
      <BlurView intensity={80} tint='light' style={styles.blur}>
        <View style={[styles.toastContent, { borderLeftColor: config.color }]}>
          <View
            style={[styles.iconContainer, { backgroundColor: config.bgColor }]}
          >
            <Ionicons name={config.icon} size={22} color={config.color} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{toast.title}</Text>
            {toast.message && (
              <Text style={styles.message} numberOfLines={2}>
                {toast.message}
              </Text>
            )}
          </View>
        </View>
      </BlurView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
    gap: SPACING.sm,
  },
  toast: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  blur: {
    borderRadius: RADIUS.lg,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
    color: COLORS.neutral[900],
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
})
