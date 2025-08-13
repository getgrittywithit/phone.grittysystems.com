import { NextRequest, NextResponse } from 'next/server'
import { TwilioService } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  try {
    const { to, from } = await request.json()

    if (!to || !from) {
      return NextResponse.json(
        { success: false, error: 'Phone numbers are required' },
        { status: 400 }
      )
    }

    // Create TwiML URL for the call
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const twimlUrl = `${baseUrl}/api/twilio/webhooks/voice`

    const result = await TwilioService.makeCall(to, from, twimlUrl)

    if (result.success) {
      return NextResponse.json({
        success: true,
        callSid: result.sid,
        message: 'Call initiated successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error making call:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initiate call' },
      { status: 500 }
    )
  }
}