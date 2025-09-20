import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/claude'
import { TritonWebhookService } from '@/lib/triton-webhook'
import { brands } from '@/types/brand'

export async function POST(request: NextRequest) {
  console.log('Voice webhook called')
  
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callStatus = formData.get('CallStatus') as string
    const digits = formData.get('Digits') as string // For forwarding option

    console.log('Incoming call:', { callSid, from, to, callStatus, digits })

    // Find the brand based on the phone number being called
    const activeBrand = brands.find(b => b.phoneNumber === to) || brands[0]
    
    console.log('Active brand:', activeBrand.name, 'for number:', to)

    // Intelligent routing based on brand
    console.log(`Routing call for brand: ${activeBrand.name} (${activeBrand.id})`)

    // Create specific greeting based on brand
    let greeting = ''
    let followUpMessage = ''
    
    if (activeBrand.id === 'school') {
      greeting = "Hello, this is the school assistant for Levi and Lola Moses. I'm here to help with any school-related matters, take messages, or assist with scheduling."
      followUpMessage = "Please let me know how I can help you today with school matters for Levi or Lola."
    } else if (activeBrand.id === 'triton') {
      greeting = "Hello, thank you for calling Triton Handyman Services. I'm your AI assistant and I'm here to help with your home repair and maintenance needs."
      followUpMessage = "Please tell me about your project or how I can assist you today."
    } else {
      greeting = `Hello, thank you for calling the ${activeBrand.name}. How may I assist you today?`
      followUpMessage = "Please tell me how I can help you."
    }

    // Check if caller wants to be forwarded (bypass AI)
    if (digits === '0') {
      // Forward to your personal phone number
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">Connecting you now...</Say>
    <Dial timeout="30">
        <Number>+15551234567</Number>
    </Dial>
    <Say voice="Polly.Joanna">Sorry, I couldn't reach anyone. Please try again later.</Say>
</Response>`
      
      return new NextResponse(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Generate TwiML response with delay and forwarding option
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Pause length="3"/>
    <Say voice="Polly.Joanna">${greeting}</Say>
    <Pause length="1"/>
    <Say voice="Polly.Joanna">Press 0 at any time to speak directly with someone, or continue speaking with me.</Say>
    <Gather input="speech dtmf" timeout="10" numDigits="1" action="/api/twilio/webhooks/voice">
        <Say voice="Polly.Joanna">${followUpMessage}</Say>
    </Gather>
    <Say voice="Polly.Joanna">I didn't hear anything. Please call back if you need assistance. Goodbye!</Say>
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