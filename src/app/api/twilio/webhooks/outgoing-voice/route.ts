import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/claude'
import { brands } from '@/types/brand'

interface CallTodoItem {
  id: string
  task: string
  completed: boolean
}

interface CallContext {
  context: string
  todoList: CallTodoItem[]
  brandId: string
}

export async function POST(request: NextRequest) {
  console.log('Outgoing voice webhook called')
  
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callStatus = formData.get('CallStatus') as string
    const speechResult = formData.get('SpeechResult') as string
    
    const url = new URL(request.url)
    const contextData = url.searchParams.get('data')
    
    let callContext: CallContext = {
      context: '',
      todoList: [],
      brandId: 'personal'
    }
    
    if (contextData) {
      try {
        callContext = JSON.parse(decodeURIComponent(contextData))
      } catch (e) {
        console.error('Error parsing context data:', e)
      }
    }

    console.log('Outgoing call context:', callContext)

    const activeBrand = brands.find(b => b.id === callContext.brandId) || brands[0]

    if (!speechResult) {
      const todoItems = callContext.todoList
        .filter(item => !item.completed)
        .map(item => `- ${item.task}`)
        .join('\n')

      const greeting = `Hello, this is an AI assistant calling on behalf of ${activeBrand.name}. ${callContext.context}`
      
      const todoPrompt = todoItems 
        ? `\n\nI need to accomplish these objectives during our call:\n${todoItems}`
        : ''

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Pause length="2"/>
    <Say voice="Polly.Joanna">${greeting}${todoPrompt}</Say>
    <Gather input="speech" timeout="10" speechTimeout="3" action="/api/twilio/webhooks/outgoing-voice?data=${encodeURIComponent(JSON.stringify(callContext))}">
        <Say voice="Polly.Joanna">How may I help you today?</Say>
    </Gather>
    <Say voice="Polly.Joanna">I didn't hear anything. I'll end the call now. Thank you for your time.</Say>
</Response>`

      return new NextResponse(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const todoItems = callContext.todoList
      .filter(item => !item.completed)
      .map(item => item.task)
      .join(', ')

    const systemPrompt = `You are an AI assistant making a phone call on behalf of ${activeBrand.name}.
    
    Context: ${callContext.context}
    
    Your objectives for this call are: ${todoItems}
    
    The person just said: "${speechResult}"
    
    Respond naturally and professionally, working towards accomplishing your objectives.
    Keep responses conversational and under 100 words.
    If you've accomplished your objectives, politely end the call.`

    const response = await ClaudeService.generateResponse(
      speechResult,
      {
        phoneNumber: activeBrand.phoneNumber,
        contactName: to,
        agentPersonality: activeBrand.aiPersonality
      }
    )

    const shouldContinue = !response.response.toLowerCase().includes('goodbye') && 
                          !response.response.toLowerCase().includes('end the call') &&
                          !response.response.toLowerCase().includes('thank you for your time')

    const twiml = shouldContinue 
      ? `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">${response.response}</Say>
    <Gather input="speech" timeout="10" speechTimeout="3" action="/api/twilio/webhooks/outgoing-voice?data=${encodeURIComponent(JSON.stringify(callContext))}">
        <Say voice="Polly.Joanna">Please continue.</Say>
    </Gather>
    <Say voice="Polly.Joanna">Thank you for your time. Have a great day!</Say>
</Response>`
      : `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Joanna">${response.response}</Say>
    <Hangup/>
</Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })

  } catch (error) {
    console.error('Error handling outgoing voice webhook:', error)
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I apologize, but I'm experiencing technical difficulties. I'll end the call now.</Say>
    <Hangup/>
</Response>`

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}