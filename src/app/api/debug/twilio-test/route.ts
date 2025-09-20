import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const apiKey = process.env.TWILIO_API_KEY!
const apiSecret = process.env.TWILIO_API_SECRET!
const appSid = process.env.TWILIO_TWIML_APP_SID!

export async function GET() {
  const results = {
    basicAuth: { tested: false, success: false, error: null as any },
    apiKeyAuth: { tested: false, success: false, error: null as any },
    jwtStructure: { tested: false, success: false, error: null as any },
    envVars: {
      hasAccountSid: !!accountSid,
      hasAuthToken: !!authToken,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      hasAppSid: !!appSid,
      lengths: {
        accountSid: accountSid?.length || 0,
        apiKey: apiKey?.length || 0,
        apiSecret: apiSecret?.length || 0,
        appSid: appSid?.length || 0
      },
      prefixes: {
        accountSidValid: accountSid?.startsWith('AC'),
        apiKeyValid: apiKey?.startsWith('SK'),
        appSidValid: appSid?.startsWith('AP')
      }
    }
  }

  // Test 1: Basic Auth with Account SID and Auth Token
  try {
    results.basicAuth.tested = true
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      headers: {
        'Authorization': `Basic ${basicAuth}`
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      results.basicAuth.success = true
      results.basicAuth.error = null
    } else {
      results.basicAuth.success = false
      results.basicAuth.error = data.message || 'Auth failed'
    }
  } catch (error) {
    results.basicAuth.success = false
    results.basicAuth.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test 2: API Key Auth
  if (apiKey && apiSecret) {
    try {
      results.apiKeyAuth.tested = true
      const apiKeyAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
        headers: {
          'Authorization': `Basic ${apiKeyAuth}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        results.apiKeyAuth.success = true
        results.apiKeyAuth.error = null
      } else {
        results.apiKeyAuth.success = false
        results.apiKeyAuth.error = data.message || 'API Key auth failed'
      }
    } catch (error) {
      results.apiKeyAuth.success = false
      results.apiKeyAuth.error = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Test 3: JWT Structure and Twilio Token Validation
  if (apiKey && apiSecret && appSid) {
    try {
      results.jwtStructure.tested = true
      
      // Create a test JWT token using the same method as our token endpoint
      const now = Math.floor(Date.now() / 1000)
      const payload = {
        iss: apiKey,
        sub: accountSid,
        nbf: now,
        exp: now + 3600,
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

      const token = jwt.sign(payload, apiSecret, { algorithm: 'HS256' })
      
      // Decode to verify structure
      const decoded = jwt.decode(token) as any
      
      // Test the token with Twilio's validation by trying to use it
      try {
        const twilioValidationResponse = await fetch(`https://accounts.twilio.com/v1/Accounts/${accountSid}/Tokens/validate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })

        const twilioValidationResult = await twilioValidationResponse.text()
        
        results.jwtStructure.success = true
        results.jwtStructure.error = {
          tokenLength: token.length,
          hasValidStructure: !!decoded?.grants?.voice,
          issuer: decoded?.iss?.substring(0, 4) + '...',
          subject: decoded?.sub?.substring(0, 4) + '...',
          twilioValidation: {
            status: twilioValidationResponse.status,
            statusText: twilioValidationResponse.statusText,
            response: twilioValidationResult.substring(0, 200)
          }
        }
      } catch (twilioError) {
        results.jwtStructure.success = true
        results.jwtStructure.error = {
          tokenLength: token.length,
          hasValidStructure: !!decoded?.grants?.voice,
          issuer: decoded?.iss?.substring(0, 4) + '...',
          subject: decoded?.sub?.substring(0, 4) + '...',
          twilioValidationError: twilioError instanceof Error ? twilioError.message : 'Twilio validation failed'
        }
      }
    } catch (error) {
      results.jwtStructure.success = false
      results.jwtStructure.error = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  return NextResponse.json(results)
}