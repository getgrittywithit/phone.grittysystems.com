import { NextRequest, NextResponse } from 'next/server'

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

    try {
      // Use require to avoid TypeScript issues
      const twilio = require('twilio')
      
      // Try using Main API Key (Account SID + Auth Token) for JWT generation
      // This often has full permissions that Restricted API Keys might lack
      const authToken = process.env.TWILIO_AUTH_TOKEN!
      
      console.log('Attempting JWT generation with Main API Key (Account SID + Auth Token)')
      
      // Create token using official SDK with Main API Key
      const AccessToken = twilio.jwt.AccessToken
      const VoiceGrant = AccessToken.VoiceGrant

      const accessToken = new AccessToken(
        accountSid,
        accountSid, // Use Account SID as the issuer instead of API Key
        authToken,  // Use Auth Token as the secret instead of API Secret
        { 
          ttl: 3600,
          identity: identity 
        }
      )

      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: appSid,
        incomingAllow: true
      })

      accessToken.addGrant(voiceGrant)
      const token = accessToken.toJwt()

      console.log('Token generated successfully using Main API Key:', {
        identity: identity,
        tokenLength: token.length,
        issuer: 'Account SID',
        appSid: appSid.substring(0, 8) + '...'
      })

      return NextResponse.json({
        success: true,
        token,
        identity,
        method: 'main_api_key'
      })
    } catch (mainKeyError) {
      console.error('Failed to use Main API Key, trying Restricted API Key:', mainKeyError)
      
      try {
        // Use require to avoid TypeScript issues
        const twilio = require('twilio')
        
        // Create token using official SDK with Restricted API Key
        const AccessToken = twilio.jwt.AccessToken
        const VoiceGrant = AccessToken.VoiceGrant

        const accessToken = new AccessToken(
          accountSid,
          apiKey,
          apiSecret,
          { 
            ttl: 3600,
            identity: identity 
          }
        )

        const voiceGrant = new VoiceGrant({
          outgoingApplicationSid: appSid,
          incomingAllow: true
        })

        accessToken.addGrant(voiceGrant)
        const token = accessToken.toJwt()

        console.log('Token generated successfully using Restricted API Key:', {
          identity: identity,
          tokenLength: token.length,
          appSid: appSid.substring(0, 8) + '...'
        })

        return NextResponse.json({
          success: true,
          token,
          identity,
          method: 'restricted_api_key'
        })
      } catch (restrictedKeyError) {
        console.error('Both Main and Restricted API Key failed:', restrictedKeyError)
        
        // Fallback to manual JWT generation with Restricted API Key
        const jwt = require('jsonwebtoken')
        const now = Math.floor(Date.now() / 1000)
        const payload = {
          iss: apiKey,
          sub: accountSid,
          nbf: now,
          exp: now + 3600,
          iat: now,
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

        const token = jwt.sign(payload, apiSecret, { algorithm: 'HS256' })

        console.log('Token generated using manual fallback method:', {
          identity: identity,
          tokenLength: token.length,
          appSid: appSid.substring(0, 8) + '...'
        })

        return NextResponse.json({
          success: true,
          token,
          identity,
          method: 'manual_fallback'
        })
      }
    }

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