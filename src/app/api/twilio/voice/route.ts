import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // This is the TwiML endpoint for voice calls
    // It should return TwiML XML to handle the call
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">This call is connected to Phone Hub. Please hold while we connect you.</Say>
  <Dial>
    <Client>browser_user</Client>
  </Dial>
</Response>`

    return new Response(twiml, {
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  } catch (error) {
    console.error('Error in voice webhook:', error)
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, there was an error processing your call.</Say>
  <Hangup/>
</Response>`

    return new Response(errorTwiml, {
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  }
}

export async function GET() {
  // Return OK for health checks
  return NextResponse.json({ status: 'TwiML voice endpoint active' })
}