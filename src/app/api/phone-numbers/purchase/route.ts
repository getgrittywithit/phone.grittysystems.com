import { NextRequest, NextResponse } from 'next/server'
import { TwilioSaasService } from '@/lib/twilio-saas'

export async function POST(request: NextRequest) {
  try {
    const { 
      phoneNumber, 
      hotlineId, 
      userId, 
      organizationId,
      hotlineName,
      useCase 
    } = await request.json()

    if (!phoneNumber || !hotlineId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const twilioService = new TwilioSaasService()
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/twilio/webhooks/hotline/${hotlineId}`

    try {
      const phoneNumberSid = await twilioService.purchasePhoneNumber(phoneNumber, webhookUrl)

      // In a real app, you'd save this to your database
      // await db.hotline.update({
      //   where: { id: hotlineId },
      //   data: {
      //     phoneNumber,
      //     phoneNumberSid,
      //     status: 'active',
      //     purchasedAt: new Date()
      //   }
      // })

      return NextResponse.json({
        success: true,
        phoneNumber,
        phoneNumberSid,
        webhookUrl,
        message: 'Phone number purchased and configured successfully'
      })
    } catch (purchaseError) {
      console.error('Purchase failed:', purchaseError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to purchase phone number. It may have been taken by another customer.' 
        },
        { status: 409 }
      )
    }
  } catch (error) {
    console.error('Error in phone number purchase:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}