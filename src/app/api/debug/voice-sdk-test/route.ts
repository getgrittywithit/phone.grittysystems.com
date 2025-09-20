import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const apiKey = process.env.TWILIO_API_KEY!
    const apiSecret = process.env.TWILIO_API_SECRET!
    const appSid = process.env.TWILIO_TWIML_APP_SID!

    // Create JWT token exactly like our token endpoint
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: apiKey,
      sub: accountSid,
      nbf: now,
      exp: now + 3600,
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
    
    // Try to validate the token with Twilio's client credentials
    // This simulates what the Voice SDK does
    const twilioAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
    
    const validationResult = await fetch(`https://accounts.twilio.com/v1/Accounts/${accountSid}/Tokens/${token}/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${twilioAuth}`
      }
    })
    
    const validationData = await validationResult.text()
    
    return NextResponse.json({
      success: true,
      tokenGenerated: true,
      tokenLength: token.length,
      validation: {
        status: validationResult.status,
        statusText: validationResult.statusText,
        response: validationData.substring(0, 500),
        headers: Object.fromEntries(validationResult.headers.entries())
      },
      payload: {
        issuer: payload.iss,
        subject: payload.sub,
        identity: payload.grants.identity,
        hasVoiceGrants: !!payload.grants.voice,
        appSid: payload.grants.voice?.outgoing?.application_sid
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}