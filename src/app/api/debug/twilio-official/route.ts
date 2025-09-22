import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const apiKey = process.env.TWILIO_API_KEY!
    const apiSecret = process.env.TWILIO_API_SECRET!
    const appSid = process.env.TWILIO_TWIML_APP_SID!

    // Use require to avoid TypeScript issues
    const twilio = require('twilio')
    
    // Create token using official SDK
    const AccessToken = twilio.jwt.AccessToken
    const VoiceGrant = AccessToken.VoiceGrant

    const accessToken = new AccessToken(
      accountSid,
      apiKey,
      apiSecret,
      { ttl: 3600 }
    )

    accessToken.identity = 'test_user'

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true
    })

    accessToken.addGrant(voiceGrant)
    
    const officialToken = accessToken.toJwt()

    // Also create our manual token for comparison
    const jwt = require('jsonwebtoken')
    const now = Math.floor(Date.now() / 1000)
    const manualPayload = {
      iss: apiKey,
      sub: accountSid,
      nbf: now,
      exp: now + 3600,
      iat: now,
      grants: {
        identity: 'test_user',
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

    const manualToken = jwt.sign(manualPayload, apiSecret, { algorithm: 'HS256' })

    // Decode both tokens to compare
    const officialDecoded = jwt.decode(officialToken, { complete: true })
    const manualDecoded = jwt.decode(manualToken, { complete: true })

    return NextResponse.json({
      success: true,
      comparison: {
        officialToken: {
          length: officialToken.length,
          decoded: officialDecoded
        },
        manualToken: {
          length: manualToken.length,
          decoded: manualDecoded
        },
        differences: {
          lengthDiff: officialToken.length - manualToken.length,
          sameAlgorithm: officialDecoded?.header?.alg === manualDecoded?.header?.alg,
          payloadComparison: {
            official: Object.keys(officialDecoded?.payload || {}),
            manual: Object.keys(manualDecoded?.payload || {})
          }
        }
      },
      credentials: {
        accountSid: accountSid.substring(0, 10) + '...',
        apiKey: apiKey.substring(0, 10) + '...',
        appSid: appSid.substring(0, 10) + '...'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}