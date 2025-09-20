export type OrganizationType = 'personal' | 'business' | 'hotline_customer'
export type PlanType = 'free' | 'starter' | 'business' | 'enterprise' | 'owner'

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  plan: PlanType
  createdAt: Date
  updatedAt: Date
  
  // Billing info for SaaS customers
  stripeCustomerId?: string
  subscriptionId?: string
  currentPeriodEnd?: Date
  
  // Usage limits based on plan
  limits: {
    phoneNumbers: number
    monthlyMinutes: number
    hotlines: number
    apiCalls?: number
  }
  
  // Current usage
  usage: {
    phoneNumbers: number
    monthlyMinutes: number
    hotlines: number
    apiCalls: number
    lastCalculated: Date
  }
  
  // Features enabled for this org
  features: string[]
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  invitedBy?: string
  invitedAt?: Date
  joinedAt?: Date
}

// Plan definitions
export const PLAN_FEATURES = {
  free: {
    phoneNumbers: 0,
    monthlyMinutes: 0,
    hotlines: 0,
    features: ['basic_analytics']
  },
  starter: {
    phoneNumbers: 1,
    monthlyMinutes: 200,
    hotlines: 1,
    features: ['basic_analytics', 'email_summaries', 'custom_greetings']
  },
  business: {
    phoneNumbers: 3,
    monthlyMinutes: 800,
    hotlines: 3,
    features: ['basic_analytics', 'email_summaries', 'custom_greetings', 'webhooks', 'priority_support']
  },
  enterprise: {
    phoneNumbers: -1, // unlimited
    monthlyMinutes: 2000,
    hotlines: -1, // unlimited
    features: ['all_features', 'white_label', 'api_access', 'dedicated_support']
  },
  owner: {
    phoneNumbers: -1,
    monthlyMinutes: -1,
    hotlines: -1,
    features: ['all_features', 'admin_access', 'billing_management']
  }
}

export const PLAN_PRICING = {
  starter: { monthly: 29, annual: 290 },
  business: { monthly: 79, annual: 790 },
  enterprise: { monthly: 199, annual: 1990 }
}