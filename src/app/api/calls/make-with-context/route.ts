import { NextRequest, NextResponse } from 'next/server'
import { TwilioService } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  try {
    const { to, from, context, todoList, brandId } = await request.json()

    if (!to || !from) {
      return NextResponse.json(
        { success: false, error: 'Phone numbers are required' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const encodedContext = encodeURIComponent(JSON.stringify({
      context: context || '',
      todoList: todoList || [],
      brandId: brandId || 'personal'
    }))
    
    const twimlUrl = `${baseUrl}/api/twilio/webhooks/outgoing-voice?data=${encodedContext}`

    const result = await TwilioService.makeCall(to, from, twimlUrl)

    if (result.success) {
      return NextResponse.json({
        success: true,
        callSid: result.sid,
        message: 'AI call initiated successfully with context'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error making contextual call:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initiate contextual call' },
      { status: 500 }
    )
  }
}