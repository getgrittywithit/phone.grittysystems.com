import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const apiKey = process.env.TWILIO_API_KEY!
    const apiSecret = process.env.TWILIO_API_SECRET!
    const appSid = process.env.TWILIO_TWIML_APP_SID!
    const authToken = process.env.TWILIO_AUTH_TOKEN!

    // Create test JWT token
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: apiKey,
      sub: accountSid,
      nbf: now,
      exp: now + 3600,
      iat: now,
      grants: {
        identity: 'debug_test_user',
        voice: {
          outgoing: {
            application_sid: appSid
          },
          incoming: {
            allow: true
          }
        }
      }
    }

    const token = jwt.sign(payload, apiSecret, { algorithm: 'HS256' })

    // Check TwiML app configuration
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const appResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Applications/${appSid}.json`, {
      headers: {
        'Authorization': `Basic ${basicAuth}`
      }
    })

    const appData = await appResponse.json()

    return NextResponse.json({
      success: true,
      token: {
        length: token.length,
        payload: payload,
        generated: true
      },
      twimlApp: {
        status: appResponse.status,
        found: appResponse.ok,
        data: appResponse.ok ? {
          sid: appData.sid,
          friendlyName: appData.friendly_name,
          voiceUrl: appData.voice_url,
          voiceMethod: appData.voice_method,
          statusCallback: appData.status_callback
        } : null,
        error: !appResponse.ok ? appData : null
      },
      credentials: {
        accountSid: accountSid.substring(0, 10) + '...',
        apiKey: apiKey.substring(0, 10) + '...',
        appSid: appSid.substring(0, 10) + '...',
        hasAuthToken: !!authToken,
        hasApiSecret: !!apiSecret
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}