import { NextRequest, NextResponse } from 'next/server'
import { TwilioService } from '@/lib/twilio'
import { ClaudeService } from '@/lib/claude'
import { brands } from '@/types/brand'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const messageSid = formData.get('MessageSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const body = formData.get('Body') as string

    console.log('Incoming SMS:', { messageSid, from, to, body })

    // Determine which brand received the message
    const activeBrand = brands.find(b => b.phoneNumber === to) || brands[0]
    
    // Determine if we should auto-respond
    const shouldAutoRespond = true // You can add logic here based on time, sender, etc.

    if (shouldAutoRespond && body) {
      // Generate AI response using Claude with brand personality
      const aiResponse = await ClaudeService.generateResponse(
        body,
        {
          phoneNumber: to,
          contactName: from,
          agentPersonality: `${activeBrand.aiPersonality} You are responding via text message for ${activeBrand.name}, so keep responses brief and friendly.`
        }
      )

      if (aiResponse.success) {
        // Send auto-reply
        const result = await TwilioService.sendSMS(
          from, // to
          to,   // from (our number)
          aiResponse.response
        )

        console.log('Auto-reply sent:', result)
      }
    }

    // Here you would typically save to database
    console.log('SMS saved to database (not implemented yet)')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling SMS webhook:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}