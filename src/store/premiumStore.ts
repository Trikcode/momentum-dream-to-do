// src/store/premiumStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PurchasesPackage, PurchasesOffering, CustomerInfo } from 'react-native-purchases';
import { revenueCatService, ENTITLEMENT_ID } from '@/src/lib/revenueCat';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  freeLimit?: number | string;
  premiumValue: string;
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
    id: 'advanced_stats',
    name: 'Advanced Insights',
    description: 'Deep analytics and progress predictions',
    icon: 'analytics',
    freeLimit: 'Basic',
    premiumValue: 'Advanced',
  },
  {
    id: 'custom_themes',
    name: 'Custom Themes',
    description: 'Personalize your app appearance',
    icon: 'color-palette',
    freeLimit: 'None',
    premiumValue: '10+ Themes',
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
];

interface PremiumState {
  // Status
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  
  // Offerings
  offerings: PurchasesOffering | null;
  selectedPackage: PurchasesPackage | null;
  
  // UI State
  showPaywall: boolean;
  showSuccess: boolean;
  purchaseError: string | null;
  
  // Actions
  initialize: (userId?: string) => Promise<void>;
  fetchOfferings: () => Promise<void>;
  checkPremiumStatus: () => Promise<boolean>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  setSelectedPackage: (pkg: PurchasesPackage | null) => void;
  setShowPaywall: (show: boolean) => void;
  setShowSuccess: (show: boolean) => void;
  clearError: () => void;
  
  // Feature checks
  canAccessFeature: (featureId: string) => boolean;
  getDreamsLimit: () => number;
  getRemainingDreams: (currentCount: number) => number;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPremium: false,
      isLoading: false,
      customerInfo: null,
      offerings: null,
      selectedPackage: null,
      showPaywall: false,
      showSuccess: false,
      purchaseError: null,

      initialize: async (userId?: string) => {
        try {
          set({ isLoading: true });
          
          await revenueCatService.initialize(userId);
          
          // Check premium status
          const customerInfo = await revenueCatService.getCustomerInfo();
          const isPremium = customerInfo?.entitlements.active[ENTITLEMENT_ID] !== undefined;
          
          set({
            isPremium,
            customerInfo,
            isLoading: false,
          });

          // Fetch offerings in background
          get().fetchOfferings();

          // Listen for updates
          revenueCatService.addCustomerInfoUpdateListener((info) => {
            const isPremium = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
            set({ isPremium, customerInfo: info });
          });

        } catch (error) {
          console.error('Failed to initialize premium:', error);
          set({ isLoading: false });
        }
      },

      fetchOfferings: async () => {
        try {
          const offerings = await revenueCatService.getOfferings();
          set({ offerings });
        } catch (error) {
          console.error('Failed to fetch offerings:', error);
        }
      },

      checkPremiumStatus: async () => {
        try {
          const isPremium = await revenueCatService.checkPremiumStatus();
          set({ isPremium });
          return isPremium;
        } catch (error) {
          return false;
        }
      },

      purchasePackage: async (pkg) => {
        try {
          set({ isLoading: true, purchaseError: null });
          
          const result = await revenueCatService.purchasePackage(pkg);
          
          if (result.success) {
            set({
              isPremium: true,
              customerInfo: result.customerInfo,
              showPaywall: false,
              showSuccess: true,
              isLoading: false,
            });
            return true;
          } else {
            set({
              purchaseError: result.error || 'Purchase failed',
              isLoading: false,
            });
            return false;
          }
        } catch (error: any) {
          set({
            purchaseError: error.message || 'Purchase failed',
            isLoading: false,
          });
          return false;
        }
      },

      restorePurchases: async () => {
        try {
          set({ isLoading: true, purchaseError: null });
          
          const result = await revenueCatService.restorePurchases();
          
          if (result.success) {
            set({
              isPremium: true,
              customerInfo: result.customerInfo,
              showPaywall: false,
              showSuccess: true,
              isLoading: false,
            });
            return true;
          } else {
            set({
              purchaseError: 'No previous purchases found',
              isLoading: false,
            });
            return false;
          }
        } catch (error: any) {
          set({
            purchaseError: error.message || 'Failed to restore',
            isLoading: false,
          });
          return false;
        }
      },

      setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
      setShowPaywall: (show) => set({ showPaywall: show }),
      setShowSuccess: (show) => set({ showSuccess: show }),
      clearError: () => set({ purchaseError: null }),

      // Feature access helpers
      canAccessFeature: (featureId) => {
        const { isPremium } = get();
        
        // Features available to free users
        const freeFeatures = ['basic_stats', 'limited_dreams'];
        
        if (freeFeatures.includes(featureId)) {
          return true;
        }
        
        return isPremium;
      },

      getDreamsLimit: () => {
        return get().isPremium ? Infinity : 3;
      },

      getRemainingDreams: (currentCount) => {
        const limit = get().getDreamsLimit();
        if (limit === Infinity) return Infinity;
        return Math.max(0, limit - currentCount);
      },
    }),
    {
      name: 'premium-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremium: state.isPremium,
      }),
    }
  )
);