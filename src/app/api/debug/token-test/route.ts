import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const apiKey = process.env.TWILIO_API_KEY!
    const apiSecret = process.env.TWILIO_API_SECRET!
    const appSid = process.env.TWILIO_TWIML_APP_SID!

    // Create JWT token with correct Twilio format
    const now = Math.floor(Date.now() / 1000)
    
    // Try both formats to see which one works
    const correctPayload = {
      iss: apiKey,
      sub: accountSid,
      nbf: now,
      exp: now + 3600,
      jti: `${apiKey}-${now}`, // Add jti (JWT ID) - sometimes required
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

    const alternativePayload = {
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

    const tokenWithJti = jwt.sign(correctPayload, apiSecret, { algorithm: 'HS256' })
    const tokenWithoutJti = jwt.sign(alternativePayload, apiSecret, { algorithm: 'HS256' })
    
    // Decode both to inspect
    const decodedWithJti = jwt.decode(tokenWithJti, { complete: true }) as any
    const decodedWithoutJti = jwt.decode(tokenWithoutJti, { complete: true }) as any
    
    return NextResponse.json({
      success: true,
      currentToken: tokenWithoutJti, // This matches our current implementation
      improvedToken: tokenWithJti,
      currentDecoded: {
        header: decodedWithoutJti?.header,
        payload: decodedWithoutJti?.payload
      },
      improvedDecoded: {
        header: decodedWithJti?.header,
        payload: decodedWithJti?.payload
      },
      envCheck: {
        accountSid: accountSid.substring(0, 10) + '...',
        apiKey: apiKey.substring(0, 10) + '...',
        appSid: appSid.substring(0, 10) + '...',
        apiSecretLength: apiSecret.length
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}