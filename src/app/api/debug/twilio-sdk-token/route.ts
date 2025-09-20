import { NextResponse } from 'next/server'
import { AccessToken } from 'twilio/lib/jwt/AccessToken'
import { VoiceGrant } from 'twilio/lib/jwt/AccessToken'

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const apiKey = process.env.TWILIO_API_KEY!
    const apiSecret = process.env.TWILIO_API_SECRET!
    const appSid = process.env.TWILIO_TWIML_APP_SID!

    // Create token using official Twilio SDK
    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: 'sdk_test_user'
    })

    // Create voice grant
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true
    })

    accessToken.addGrant(voiceGrant)

    const token = accessToken.toJwt()

    return NextResponse.json({
      success: true,
      token: token,
      tokenLength: token.length,
      sdkGenerated: true,
      comparison: {
        accountSid: accountSid.substring(0, 10) + '...',
        apiKey: apiKey.substring(0, 10) + '...',
        appSid: appSid.substring(0, 10) + '...'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}