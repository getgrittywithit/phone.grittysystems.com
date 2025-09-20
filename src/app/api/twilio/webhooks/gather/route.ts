import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/claude'
import { brands } from '@/types/brand'

export async function POST(request: NextRequest) {
  console.log('Gather webhook called')
  
  try {
    const formData = await request.formData()
    const speechResult = formData.get('SpeechResult') as string
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string

    console.log('Speech input received:', { speechResult, callSid, from, to })

    if (!speechResult || speechResult.trim() === '') {
      console.log('No speech result, asking for repeat')
      
      const noInputTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">I didn't catch that. Could you please repeat what you need help with?</Say>
    <Gather input="speech" timeout="8" action="/api/twilio/webhooks/gather">
        <Say voice="Polly.Joanna">I'm listening.</Say>
    </Gather>
    <Say voice="Polly.Joanna">Thank you for calling. Someone will get back to you. Goodbye!</Say>
</Response>`

      return new NextResponse(noInputTwiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Determine which brand received the call
    const activeBrand = brands.find(b => b.phoneNumber === to) || brands[0]
    console.log('Processing speech for brand:', activeBrand.name)
    
    // Create a more detailed prompt for the AI
    let aiPrompt = `Caller said: "${speechResult}"`
    
    if (activeBrand.id === 'school') {
      aiPrompt += ` This is a school-related call for Levi and Lola Moses. Please respond helpfully and offer to take notes or messages. Be warm but professional.`
    }
    
    // Generate AI response using Claude with brand personality
    const aiResponse = await ClaudeService.generateResponse(
      aiPrompt,
      {
        phoneNumber: to,
        contactName: from,
        agentPersonality: activeBrand.aiPersonality
      }
    )

    console.log('AI Response generated:', { success: aiResponse.success, response: aiResponse.response?.substring(0, 100) })

    const responseText = aiResponse.success 
      ? aiResponse.response 
      : "I understand you need assistance. Let me take a note for you and someone will get back to you soon."

    // Create TwiML response with AI-generated text
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">${responseText}</Say>
    <Gather input="speech" timeout="8" action="/api/twilio/webhooks/gather">
        <Say voice="Polly.Joanna">Is there anything else I can help you with?</Say>
    </Gather>
    <Say voice="Polly.Joanna">Thank you for calling. Have a great day!</Say>
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
    <Say voice="Polly.Joanna">I'm experiencing some technical difficulties. Please call back or someone will get back to you soon. Goodbye!</Say>
</Response>`

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}