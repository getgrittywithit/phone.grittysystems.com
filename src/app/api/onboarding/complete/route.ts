import { NextRequest, NextResponse } from 'next/server'
import { TwilioSaasService } from '@/lib/twilio-saas'

interface OnboardingData {
  companyName: string
  useCase: string
  useCaseDescription: string
  aiPersonality: string
  welcomeMessage: string
  phoneNumber: string
  plan: string
  billingInfo: {
    planId: string
    billingCycle: 'monthly' | 'annual'
    price: number
    limits: {
      phoneNumbers: number
      monthlyMinutes: number
      hotlines: number
    }
  }
  userEmail: string
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    const onboardingData: OnboardingData = await request.json()

    const {
      companyName,
      useCase,
      useCaseDescription,
      aiPersonality,
      welcomeMessage,
      phoneNumber,
      plan,
      billingInfo,
      userEmail,
      userId
    } = onboardingData

    // 1. Create organization record (in real app, save to database)
    const organizationId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    const organization = {
      id: organizationId,
      name: companyName,
      type: 'hotline_customer' as const,
      plan: plan as any,
      createdAt: new Date(),
      limits: billingInfo.limits,
      usage: {
        phoneNumbers: 0,
        monthlyMinutes: 0,
        hotlines: 0,
        apiCalls: 0,
        lastCalculated: new Date()
      },
      features: getPlanFeatures(plan),
      stripeCustomerId: null, // Will be set during payment setup
      subscriptionId: null,
      currentPeriodEnd: null
    }

    // 2. Purchase phone number
    const twilioService = new TwilioSaasService()
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const hotlineId = `hotline_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const webhookUrl = `${baseUrl}/api/twilio/webhooks/hotline/${hotlineId}`

    let phoneNumberSid: string
    try {
      phoneNumberSid = await twilioService.purchasePhoneNumber(phoneNumber, webhookUrl)
    } catch (error) {
      console.error('Failed to purchase phone number:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to purchase phone number. Please try a different number.' 
        },
        { status: 400 }
      )
    }

    // 3. Create hotline brand record
    const hotlineBrand = {
      id: hotlineId,
      name: `${companyName} ${getUseCaseDisplayName(useCase)}`,
      icon: getUseCaseIcon(useCase),
      phoneNumber: phoneNumber,
      phoneNumberSid: phoneNumberSid,
      color: getUseCaseColor(useCase),
      description: useCaseDescription,
      aiPersonality: aiPersonality,
      organizationId: organizationId,
      type: 'hotline' as const,
      useCase: useCase as any,
      isActive: true,
      createdAt: new Date(),
      welcomeMessage: welcomeMessage,
      callCount: 0,
      totalMinutes: 0
    }

    // 4. In a real app, you would:
    // - Save organization to database
    // - Save hotline brand to database
    // - Create Stripe customer
    // - Set up subscription
    // - Send welcome email
    
    // For now, we'll simulate success and return the setup info
    console.log('Organization created:', organization)
    console.log('Hotline brand created:', hotlineBrand)

    return NextResponse.json({
      success: true,
      organization: {
        id: organizationId,
        name: companyName,
        plan: plan
      },
      hotline: {
        id: hotlineId,
        name: hotlineBrand.name,
        phoneNumber: phoneNumber,
        phoneNumberSid: phoneNumberSid,
        useCase: useCase,
        isActive: true,
        webhookUrl: webhookUrl
      },
      billing: {
        plan: plan,
        cycle: billingInfo.billingCycle,
        price: billingInfo.price,
        limits: billingInfo.limits
      },
      nextSteps: [
        'Set up your Stripe billing',
        'Test your hotline by calling it',
        'Configure additional settings',
        'Invite team members (if needed)'
      ]
    })

  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding setup' },
      { status: 500 }
    )
  }
}

function getPlanFeatures(plan: string): string[] {
  const featureMap = {
    starter: ['basic_analytics', 'email_summaries', 'custom_greetings'],
    business: ['basic_analytics', 'email_summaries', 'custom_greetings', 'webhooks', 'priority_support'],
    enterprise: ['all_features', 'white_label', 'api_access', 'dedicated_support']
  }
  
  return featureMap[plan as keyof typeof featureMap] || featureMap.starter
}

function getUseCaseDisplayName(useCase: string): string {
  const names = {
    'product-review': 'Feedback Line',
    'event-rsvp': 'RSVP Line',
    'survey': 'Survey Line',
    'support': 'Support Line',
    'lead-generation': 'Lead Line',
    'custom': 'Hotline'
  }
  
  return names[useCase as keyof typeof names] || 'Hotline'
}

function getUseCaseIcon(useCase: string): string {
  const icons = {
    'product-review': '⭐',
    'event-rsvp': '📅',
    'survey': '📊',
    'support': '🎧',
    'lead-generation': '📈',
    'custom': '📞'
  }
  
  return icons[useCase as keyof typeof icons] || '📞'
}

function getUseCaseColor(useCase: string): string {
  const colors = {
    'product-review': '#F59E0B',
    'event-rsvp': '#3B82F6', 
    'survey': '#10B981',
    'support': '#8B5CF6',
    'lead-generation': '#EF4444',
    'custom': '#6B7280'
  }
  
  return colors[useCase as keyof typeof colors] || '#6B7280'
}