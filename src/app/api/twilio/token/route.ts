import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { AccessToken, VoiceGrant } from 'twilio/lib/jwt/AccessToken'

export async function POST(request: NextRequest) {
  try {
    const { identity } = await request.json()

    if (!identity) {
      return NextResponse.json(
        { error: 'Identity is required' },
        { status: 400 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const apiKey = process.env.TWILIO_API_KEY
    const apiSecret = process.env.TWILIO_API_SECRET
    const appSid = process.env.TWILIO_TWIML_APP_SID

    if (!accountSid || !apiKey || !apiSecret || !appSid) {
      console.error('Missing Twilio credentials for token generation', {
        hasAccountSid: !!accountSid,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
        hasAppSid: !!appSid
      })
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          success: false
        },
        { status: 500 }
      )
    }

    console.log('Creating Twilio Access Token for identity:', identity)

    // Use official Twilio SDK to generate token
    const accessToken = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: identity,
      ttl: 3600 // 1 hour
    })

    // Create voice grant
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true
    })

    accessToken.addGrant(voiceGrant)
    const token = accessToken.toJwt()

    console.log('Token generated successfully using Twilio SDK:', {
      identity: identity,
      tokenLength: token.length,
      appSid: appSid.substring(0, 8) + '...'
    })

    return NextResponse.json({
      success: true,
      token,
      identity
    })

  } catch (error) {
    console.error('Error generating Twilio token:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to generate token',
        details: errorMessage,
        success: false
      },
      { status: 500 }
    )
  }
}