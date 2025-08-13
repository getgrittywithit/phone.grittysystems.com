import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/claude'
import { brands } from '@/types/brand'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const speechResult = formData.get('SpeechResult') as string
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string

    console.log('Speech input received:', { speechResult, callSid, from, to })

    if (!speechResult) {
      const noInputTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I didn't catch that. Could you please repeat what you need help with?</Say>
    <Gather input="speech" timeout="5" action="/api/twilio/webhooks/gather">
        <Say voice="alice">I'm listening.</Say>
    </Gather>
    <Say voice="alice">Thank you for calling. Goodbye!</Say>
</Response>`

      return new NextResponse(noInputTwiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Determine which brand received the call
    const activeBrand = brands.find(b => b.phoneNumber === to) || brands[0]
    
    // Generate AI response using Claude with brand personality
    const aiResponse = await ClaudeService.generateResponse(
      speechResult,
      {
        phoneNumber: to,
        contactName: from,
        agentPersonality: `${activeBrand.aiPersonality} Be concise and professional when helping callers for ${activeBrand.name}.`
      }
    )

    const responseText = aiResponse.success 
      ? aiResponse.response 
      : "I understand you need assistance. Let me transfer you to voicemail so someone can get back to you."

    // Create TwiML response with AI-generated text
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${responseText}</Say>
    <Gather input="speech" timeout="5" action="/api/twilio/webhooks/gather">
        <Say voice="alice">Is there anything else I can help you with?</Say>
    </Gather>
    <Say voice="alice">Thank you for calling. Have a great day!</Say>
</Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Error handling gather webhook:', error)
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Thank you for your call. Someone will get back to you soon. Goodbye!</Say>
</Response>`

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}