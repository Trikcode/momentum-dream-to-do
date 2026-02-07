// src/store/premiumStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  PurchasesPackage,
  PurchasesOffering,
  CustomerInfo,
} from 'react-native-purchases'
import { revenueCatService, SubscriptionInfo } from '@/src/lib/revenueCat'

export interface PremiumFeature {
  id: string
  name: string
  description: string
  icon: string
  freeLimit?: number | string
  premiumValue: string
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'unlimited_dreams',
    name: 'Unlimited Dreams',
    description: 'Create as many dreams as you want',
    icon: 'planet',
    freeLimit: 3,
    premiumValue: 'Unlimited',
  },
  {
    id: 'ai_coaching',
    name: 'AI Dream Coach',
    description: 'Get personalized guidance and action plans',
    icon: 'sparkles',
    freeLimit: 'None',
    premiumValue: 'Full Access',
  },

  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get help faster when you need it',
    icon: 'headset',
    freeLimit: 'Standard',
    premiumValue: 'Priority',
  },
  {
    id: 'export_data',
    name: 'Export & Backup',
    description: 'Export your journey data anytime',
    icon: 'cloud-download',
    freeLimit: 'None',
    premiumValue: 'Full Export',
  },
]

interface PremiumState {
  // Status
  isPremium: boolean
  isLoading: boolean
  subscriptionInfo: SubscriptionInfo | null
  customerInfo: CustomerInfo | null

  // Trial
  isTrialEligible: boolean
  trialDuration: string | null // e.g., "7 days"

  // Offerings
  offerings: PurchasesOffering | null
  selectedPackage: PurchasesPackage | null
  introEligibility: Record<string, boolean>

  // UI State
  showPaywall: boolean
  showSuccess: boolean
  purchaseError: string | null

  // Actions
  initialize: (userId?: string) => Promise<void>
  fetchOfferings: () => Promise<void>
  checkPremiumStatus: () => Promise<boolean>
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>
  restorePurchases: () => Promise<boolean>
  setSelectedPackage: (pkg: PurchasesPackage | null) => void
  setShowPaywall: (show: boolean) => void
  setShowSuccess: (show: boolean) => void
  clearError: () => void
  refreshSubscription: () => Promise<void>

  // Feature checks
  canAccessFeature: (featureId: string) => boolean
  getDreamsLimit: () => number
  getRemainingDreams: (currentCount: number) => number
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPremium: false,
      isLoading: false,
      subscriptionInfo: null,
      customerInfo: null,
      isTrialEligible: false,
      trialDuration: null,
      offerings: null,
      selectedPackage: null,
      introEligibility: {},
      showPaywall: false,
      showSuccess: false,
      purchaseError: null,

      initialize: async (userId?: string) => {
        try {
          set({ isLoading: true })

          await revenueCatService.initialize(userId)

          // If user is logged in, login to RevenueCat
          if (userId) {
            await revenueCatService.login(userId)
          }

          // Get customer info
          const customerInfo = await revenueCatService.getCustomerInfo()

          if (customerInfo) {
            const subscriptionInfo =
              revenueCatService.getSubscriptionInfo(customerInfo)
            const isPremium = subscriptionInfo.isActive

            set({
              isPremium,
              subscriptionInfo,
              customerInfo,
            })

            // Sync to database
            if (userId) {
              await revenueCatService.syncWithDatabase(userId, customerInfo)
            }
          }

          // Fetch offerings in background
          get().fetchOfferings()

          // Listen for updates
          revenueCatService.addCustomerInfoUpdateListener(async (info) => {
            const subscriptionInfo = revenueCatService.getSubscriptionInfo(info)
            set({
              isPremium: subscriptionInfo.isActive,
              subscriptionInfo,
              customerInfo: info,
            })

            // Sync to database
            if (userId) {
              await revenueCatService.syncWithDatabase(userId, info)
            }
          })
        } catch (error) {
          console.error('Failed to initialize premium:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchOfferings: async () => {
        try {
          const offerings = await revenueCatService.getOfferings()
          set({ offerings })

          if (offerings) {
            const eligibility: Record<string, boolean> = {}
            let hasAnyTrial = false
            let trialDuration: string | null = null

            for (const pkg of offerings.availablePackages) {
              const hasTrial = revenueCatService.hasFreeTrial(pkg)
              eligibility[pkg.product.identifier] = hasTrial

              if (hasTrial && !trialDuration) {
                hasAnyTrial = true
                trialDuration = revenueCatService.getFreeTrialDuration(pkg)
              }
            }

            set({
              introEligibility: eligibility,
              isTrialEligible: hasAnyTrial,
              trialDuration,
            })
          }
        } catch (error) {
          console.error('Failed to fetch offerings:', error)
        }
      },

      checkPremiumStatus: async () => {
        try {
          const isPremium = await revenueCatService.checkPremiumStatus()
          set({ isPremium })
          return isPremium
        } catch (error) {
          return false
        }
      },

      purchasePackage: async (pkg) => {
        try {
          set({ isLoading: true, purchaseError: null })

          const result = await revenueCatService.purchasePackage(pkg)

          if (result.isCancelled) {
            set({ isLoading: false })
            return false
          }

          if (result.success && result.customerInfo) {
            const subscriptionInfo = revenueCatService.getSubscriptionInfo(
              result.customerInfo,
            )

            set({
              isPremium: true,
              subscriptionInfo,
              customerInfo: result.customerInfo,
              showPaywall: false,
              showSuccess: true,
              isLoading: false,
            })
            return true
          } else {
            set({
              purchaseError: result.error || 'Purchase failed',
              isLoading: false,
            })
            return false
          }
        } catch (error: any) {
          set({
            purchaseError: error.message || 'Purchase failed',
            isLoading: false,
          })
          return false
        }
      },

      restorePurchases: async () => {
        try {
          set({ isLoading: true, purchaseError: null })

          const result = await revenueCatService.restorePurchases()

          if (result.success && result.customerInfo) {
            const subscriptionInfo = revenueCatService.getSubscriptionInfo(
              result.customerInfo,
            )

            set({
              isPremium: true,
              subscriptionInfo,
              customerInfo: result.customerInfo,
              showPaywall: false,
              showSuccess: true,
              isLoading: false,
            })
            return true
          } else {
            set({
              purchaseError: 'No previous purchases found',
              isLoading: false,
            })
            return false
          }
        } catch (error: any) {
          set({
            purchaseError: error.message || 'Failed to restore',
            isLoading: false,
          })
          return false
        }
      },

      refreshSubscription: async () => {
        try {
          const customerInfo = await revenueCatService.getCustomerInfo()
          if (customerInfo) {
            const subscriptionInfo =
              revenueCatService.getSubscriptionInfo(customerInfo)
            set({
              isPremium: subscriptionInfo.isActive,
              subscriptionInfo,
              customerInfo,
            })
          }
        } catch (error) {
          console.error('Error refreshing subscription:', error)
        }
      },

      setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
      setShowPaywall: (show) => set({ showPaywall: show }),
      setShowSuccess: (show) => set({ showSuccess: show }),
      clearError: () => set({ purchaseError: null }),

      canAccessFeature: (featureId) => {
        const { isPremium } = get()
        const freeFeatures = ['basic_stats', 'limited_dreams']
        if (freeFeatures.includes(featureId)) return true
        return isPremium
      },

      getDreamsLimit: () => {
        return get().isPremium ? Infinity : 3
      },

      getRemainingDreams: (currentCount) => {
        const limit = get().getDreamsLimit()
        if (limit === Infinity) return Infinity
        return Math.max(0, limit - currentCount)
      },
    }),
    {
      name: 'premium-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremium: state.isPremium,
        subscriptionInfo: state.subscriptionInfo,
      }),
    },
  ),
)
