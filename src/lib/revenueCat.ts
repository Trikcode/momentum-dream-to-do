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

      if (!apiKey) {
        console.warn(
          '⚠️ RevenueCat API key not configured, skipping initialization',
        )
        return
      }

      await Purchases.configure({
        apiKey,
        appUserID: userId || null,
      })

      this.initialized = true
    } catch (error) {
      throw error
    }
  }

  async login(userId: string): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.logIn(userId)
      return customerInfo
    } catch (error) {
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      await Purchases.logOut()
    } catch (error) {}
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

  hasFreeTrial(pkg: PurchasesPackage): boolean {
    // iOS: Check introPrice with price = 0
    if (pkg.product.introPrice?.price === 0) {
      return true
    }

    // Android: Check for freePhase in subscription options
    const product = pkg.product as any

    // Check defaultOption
    if (product.defaultOption?.freePhase) {
      return true
    }

    if (product.subscriptionOptions) {
      for (const option of product.subscriptionOptions) {
        if (option.freePhase) {
          return true
        }
      }
    }

    return false
  }

  getFreeTrialDuration(pkg: PurchasesPackage): string | null {
    // iOS: Get from introPrice
    if (pkg.product.introPrice?.price === 0) {
      const intro = pkg.product.introPrice
      const count = intro.periodNumberOfUnits
      const unit = intro.periodUnit

      if (unit === 'DAY') return `${count} day${count > 1 ? 's' : ''}`
      if (unit === 'WEEK') return `${count} week${count > 1 ? 's' : ''}`
      if (unit === 'MONTH') return `${count} month${count > 1 ? 's' : ''}`
      if (unit === 'YEAR') return `${count} year${count > 1 ? 's' : ''}`
      return `${count} ${unit.toLowerCase()}`
    }

    // Android: Get from freePhase
    const product = pkg.product as any
    const freePhase =
      product.defaultOption?.freePhase ||
      product.subscriptionOptions?.find((opt: any) => opt.freePhase)?.freePhase

    if (freePhase?.billingPeriod) {
      // Android uses ISO 8601 duration format: P7D, P1W, P1M, etc.
      const match = freePhase.billingPeriod.match(/P(\d+)([DWMY])/)
      if (match) {
        const count = parseInt(match[1])
        const unit = match[2]
        if (unit === 'D') return `${count} day${count > 1 ? 's' : ''}`
        if (unit === 'W') return `${count} week${count > 1 ? 's' : ''}`
        if (unit === 'M') return `${count} month${count > 1 ? 's' : ''}`
        if (unit === 'Y') return `${count} year${count > 1 ? 's' : ''}`
      }
    }

    return null
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
    } catch (error) {
      console.error('❌ Error syncing to database:', error)
    }
  }
}

export const revenueCatService = new RevenueCatService()
