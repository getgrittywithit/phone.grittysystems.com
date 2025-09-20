import { NextRequest } from 'next/server'

export type DashboardMode = 'personal' | 'hotlines' | 'admin'

export interface DashboardContext {
  mode: DashboardMode
  organizationId: string
  userId: string
  userRole: string
  features: string[]
}

export function getDashboardMode(request: NextRequest): DashboardMode {
  const pathname = request.nextUrl.pathname
  
  if (pathname.startsWith('/dashboard/hotlines')) {
    return 'hotlines'
  } else if (pathname.startsWith('/admin')) {
    return 'admin'
  } else {
    return 'personal'
  }
}

export function getDashboardContext(
  mode: DashboardMode,
  user: any,
  organization: any
): DashboardContext {
  const baseFeatures = ['basic_calls', 'ai_responses', 'call_history']
  
  switch (mode) {
    case 'personal':
      return {
        mode,
        organizationId: 'owner',
        userId: user.id,
        userRole: 'owner',
        features: [
          ...baseFeatures,
          'unlimited_numbers',
          'unlimited_minutes',
          'custom_brands',
          'advanced_ai',
          'webhooks',
          'api_access',
          'admin_features'
        ]
      }
      
    case 'hotlines':
      const planFeatures = getPlanFeatures(organization.plan)
      return {
        mode,
        organizationId: organization.id,
        userId: user.id,
        userRole: user.role,
        features: [...baseFeatures, ...planFeatures]
      }
      
    case 'admin':
      return {
        mode,
        organizationId: 'admin',
        userId: user.id,
        userRole: 'admin',
        features: [
          ...baseFeatures,
          'platform_analytics',
          'user_management',
          'billing_management',
          'feature_flags'
        ]
      }
      
    default:
      return {
        mode: 'personal',
        organizationId: 'owner',
        userId: user.id,
        userRole: 'owner',
        features: baseFeatures
      }
  }
}

function getPlanFeatures(plan: string): string[] {
  const planFeatureMap = {
    free: ['basic_analytics'],
    starter: ['basic_analytics', 'email_summaries', 'custom_greetings'],
    business: ['basic_analytics', 'email_summaries', 'custom_greetings', 'webhooks', 'priority_support'],
    enterprise: ['all_features', 'white_label', 'api_access', 'dedicated_support']
  }
  
  return planFeatureMap[plan as keyof typeof planFeatureMap] || planFeatureMap.free
}