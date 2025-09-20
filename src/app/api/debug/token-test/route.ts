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
        identity: 'debug_user',
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
    
    // Decode to inspect payload
    const decoded = jwt.decode(token, { complete: true }) as any
    
    return NextResponse.json({
      success: true,
      token: token,
      tokenInfo: {
        header: decoded?.header,
        payload: {
          iss: decoded?.payload?.iss,
          sub: decoded?.payload?.sub,
          nbf: decoded?.payload?.nbf,
          exp: decoded?.payload?.exp,
          grants: decoded?.payload?.grants
        },
        signature: decoded?.signature?.substring(0, 10) + '...'
      },
      validation: {
        isValidJWT: !!decoded,
        hasVoiceGrants: !!decoded?.payload?.grants?.voice,
        hasOutgoingGrants: !!decoded?.payload?.grants?.voice?.outgoing,
        hasApplicationSid: !!decoded?.payload?.grants?.voice?.outgoing?.application_sid,
        applicationSidMatches: decoded?.payload?.grants?.voice?.outgoing?.application_sid === appSid
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}