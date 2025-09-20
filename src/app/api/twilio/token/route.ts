import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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

    // Create JWT token manually with correct Twilio format
    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: apiKey,
      sub: accountSid,
      nbf: now,
      exp: now + 3600, // 1 hour expiration
      iat: now, // Add issued at time - sometimes required
      grants: {
        identity: identity,
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

    // Use HS256 algorithm as required by Twilio
    const token = jwt.sign(payload, apiSecret, { 
      algorithm: 'HS256'
    })

    console.log('Token generated successfully:', {
      identity: identity,
      tokenLength: token.length,
      appSid: appSid.substring(0, 8) + '...',
      issuer: apiKey.substring(0, 8) + '...',
      subject: accountSid.substring(0, 8) + '...'
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