import { NextRequest, NextResponse } from 'next/server'
import { TwilioService } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  try {
    const { to, from, message } = await request.json()

    if (!to || !from || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone numbers and message are required' },
        { status: 400 }
      )
    }

    const result = await TwilioService.sendSMS(to, from, message)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageSid: result.sid,
        message: 'SMS sent successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}