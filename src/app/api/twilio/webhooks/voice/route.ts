import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/claude'
import { brands } from '@/types/brand'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callStatus = formData.get('CallStatus') as string

    console.log('Incoming call:', { callSid, from, to, callStatus })

    // Determine which brand is being called - for now, use Triton Handyman as default
    // In a real system, you'd have multiple numbers for different brands
    const activeBrand = brands.find(b => b.phoneNumber === to) || brands[0]
    
    // Generate AI response based on brand personality
    const aiResponse = await ClaudeService.generateResponse(
      `A caller from ${from} is calling ${activeBrand.name}. Generate an appropriate professional greeting that reflects this business.`,
      {
        phoneNumber: to,
        contactName: from,
        agentPersonality: activeBrand.aiPersonality
      }
    )

    const defaultGreeting = `Hello! Thank you for calling ${activeBrand.name}. How may I assist you today?`
    const responseText = aiResponse.success ? aiResponse.response : defaultGreeting

    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${responseText}</Say>
    <Gather input="speech" timeout="5" action="/api/twilio/webhooks/gather">
        <Say voice="alice">Please tell me how I can help you.</Say>
    </Gather>
    <Say voice="alice">I didn't hear anything. Please call back if you need assistance. Goodbye!</Say>
</Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Error handling voice webhook:', error)
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I apologize, but I'm experiencing technical difficulties. Please try calling back later.</Say>
</Response>`

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}