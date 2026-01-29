import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from 'react-native-purchases'
import { Platform } from 'react-native'

const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
}

export const ENTITLEMENT_ID = 'DreamDo Pro'

// Product identifiers
export const PRODUCT_IDS = {
  monthly: 'dreamdo_premium_monthly',
  yearly: 'dreamdo_premium_yearly',
  lifetime: 'dreamdo_premium_lifetime',
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
      console.log('RevenueCat initialized successfully')
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error)
      throw error
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings()

      if (offerings.current) {
        return offerings.current
      }

      return null
    } catch (error) {
      console.error('Failed to get offerings:', error)
      return null
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<{
    success: boolean
    customerInfo?: CustomerInfo
    error?: string
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
        return {
          success: false,
          error: 'Purchase cancelled',
        }
      }

      console.error('Purchase failed:', error)
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
      console.error('Restore failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to restore purchases',
      }
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo()
      return customerInfo
    } catch (error) {
      console.error('Failed to get customer info:', error)
      return null
    }
  }

  async checkPremiumStatus(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo()

      if (!customerInfo) return false

      return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
    } catch (error) {
      console.error('Failed to check premium status:', error)
      return false
    }
  }

  async login(userId: string): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.logIn(userId)
      return customerInfo
    } catch (error) {
      console.error('Failed to login to RevenueCat:', error)
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      await Purchases.logOut()
    } catch (error) {
      console.error('Failed to logout from RevenueCat:', error)
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
}

export const revenueCatService = new RevenueCatService()
