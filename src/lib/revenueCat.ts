import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
  INTRO_ELIGIBILITY_STATUS,
} from 'react-native-purchases'
import { Platform } from 'react-native'
import { supabase } from './supabase'

const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
}

export const ENTITLEMENT_ID = 'Momentum Pro'

export const PRODUCT_IDS = {
  monthly: 'momentum_pro_monthly',
  yearly: 'momentum_pro_yearly',
}

export interface SubscriptionInfo {
  isActive: boolean
  isTrial: boolean
  willRenew: boolean
  expiresAt: Date | null
  productId: string | null
  store: string | null
}

class RevenueCatService {
  private initialized = false

  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return

    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG)
      }

      const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android

      await Purchases.configure({
        apiKey,
        appUserID: userId || null,
      })

      this.initialized = true
      console.log(
        '✅ RevenueCat initialized',
        userId ? `for user ${userId}` : 'anonymously',
      )
    } catch (error) {
      console.error('❌ RevenueCat init error:', error)
      throw error
    }
  }

  async login(userId: string): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.logIn(userId)
      console.log('✅ RevenueCat logged in:', userId)
      return customerInfo
    } catch (error) {
      console.error('❌ RevenueCat login error:', error)
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      await Purchases.logOut()
      console.log('✅ RevenueCat logged out')
    } catch (error) {
      console.error('❌ RevenueCat logout error:', error)
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings()
      return offerings.current || null
    } catch (error) {
      console.error('❌ Error getting offerings:', error)
      return null
    }
  }

  async getIntroEligibility(
    productIds: string[],
  ): Promise<Record<string, boolean>> {
    try {
      const eligibility =
        await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds)

      const result: Record<string, boolean> = {}
      for (const [productId, status] of Object.entries(eligibility)) {
        result[productId] =
          status.status ===
          INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE
      }
      return result
    } catch (error) {
      console.error('❌ Error checking eligibility:', error)
      return {}
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<{
    success: boolean
    customerInfo?: CustomerInfo
    error?: string
    isCancelled?: boolean
  }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg)
      const isPremium =
        customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined

      return {
        success: isPremium,
        customerInfo,
      }
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false, isCancelled: true }
      }
      return {
        success: false,
        error: error.message || 'Purchase failed',
      }
    }
  }

  async restorePurchases(): Promise<{
    success: boolean
    customerInfo?: CustomerInfo
    error?: string
  }> {
    try {
      const customerInfo = await Purchases.restorePurchases()
      const isPremium =
        customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined

      return {
        success: isPremium,
        customerInfo,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to restore purchases',
      }
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo()
    } catch (error) {
      console.error('❌ Error getting customer info:', error)
      return null
    }
  }

  async checkPremiumStatus(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo()
      if (!customerInfo) return false
      return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
    } catch (error) {
      return false
    }
  }

  getSubscriptionInfo(customerInfo: CustomerInfo): SubscriptionInfo {
    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID]

    if (!entitlement) {
      return {
        isActive: false,
        isTrial: false,
        willRenew: false,
        expiresAt: null,
        productId: null,
        store: null,
      }
    }

    return {
      isActive: true,
      isTrial: entitlement.periodType === 'TRIAL',
      willRenew: entitlement.willRenew,
      expiresAt: entitlement.expirationDate
        ? new Date(entitlement.expirationDate)
        : null,
      productId: entitlement.productIdentifier,
      store: entitlement.store,
    }
  }

  addCustomerInfoUpdateListener(
    listener: (customerInfo: CustomerInfo) => void,
  ): () => void {
    Purchases.addCustomerInfoUpdateListener(listener)
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener)
    }
  }

  // Sync local database with RevenueCat (fallback for offline support)
  async syncWithDatabase(
    userId: string,
    customerInfo: CustomerInfo,
  ): Promise<void> {
    try {
      const info = this.getSubscriptionInfo(customerInfo)

      await supabase
        .from('profiles')
        .update({
          is_premium: info.isActive,
          subscription_status: info.isActive
            ? info.isTrial
              ? 'trialing'
              : 'active'
            : 'free',
          subscription_expires_at: info.expiresAt?.toISOString() || null,
          is_trial: info.isTrial,
          trial_ends_at: info.isTrial ? info.expiresAt?.toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      console.log('✅ Synced subscription to database')
    } catch (error) {
      console.error('❌ Error syncing to database:', error)
    }
  }
}

export const revenueCatService = new RevenueCatService()
