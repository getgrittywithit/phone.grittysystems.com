import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const apiKey = process.env.TWILIO_API_KEY!
    const apiSecret = process.env.TWILIO_API_SECRET!
    const appSid = process.env.TWILIO_TWIML_APP_SID!

    // Generate a token using the SDK
    const twilio = require('twilio')
    const AccessToken = twilio.jwt.AccessToken
    const VoiceGrant = AccessToken.VoiceGrant

    const accessToken = new AccessToken(
      accountSid,
      apiKey,
      apiSecret,
      { 
        ttl: 3600,
        identity: 'verify_test_user'
      }
    )

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true
    })

    accessToken.addGrant(voiceGrant)
    const token = accessToken.toJwt()

    // Verify the token signature manually
    const jwt = require('jsonwebtoken')
    
    try {
      const verified = jwt.verify(token, apiSecret, { algorithms: ['HS256'] })
      
      return NextResponse.json({
        success: true,
        tokenGenerated: true,
        signatureValid: true,
        tokenLength: token.length,
        payload: verified,
        credentials: {
          apiKey: apiKey,
          apiKeyPrefix: apiKey.substring(0, 4),
          apiSecretLength: apiSecret.length,
          accountSid: accountSid.substring(0, 10) + '...',
          appSid: appSid.substring(0, 10) + '...'
        }
      })
    } catch (verifyError) {
      return NextResponse.json({
        success: false,
        tokenGenerated: true,
        signatureValid: false,
        error: verifyError instanceof Error ? verifyError.message : 'Verification failed',
        tokenLength: token.length
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}