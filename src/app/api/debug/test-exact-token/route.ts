import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get the exact same token that the browser would get
    const tokenResponse = await fetch('https://phone.grittysystems.com/api/twilio/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'moses_family_user' })
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenData.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get token',
        details: tokenData
      })
    }

    const token = tokenData.token
    
    // Decode the token to inspect its contents
    const jwt = require('jsonwebtoken')
    const decoded = jwt.decode(token, { complete: true })
    
    // Verify the token signature manually
    const apiSecret = process.env.TWILIO_API_SECRET!
    let signatureValid = false
    let verificationError = null
    
    try {
      jwt.verify(token, apiSecret, { algorithms: ['HS256'] })
      signatureValid = true
    } catch (error) {
      verificationError = error instanceof Error ? error.message : 'Unknown verification error'
    }

    // Try to validate with Twilio's REST API
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const authToken = process.env.TWILIO_AUTH_TOKEN!
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    
    let twilioValidation = null
    try {
      // Try to use the token to make a simple API call to test validation
      const testResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      twilioValidation = {
        status: testResponse.status,
        statusText: testResponse.statusText,
        success: testResponse.ok,
        error: null
      }
      
      if (!testResponse.ok) {
        const errorData = await testResponse.text()
        twilioValidation.error = errorData.substring(0, 500)
      }
    } catch (error) {
      twilioValidation = {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      success: true,
      tokenFromBrowser: {
        length: token.length,
        signature: token.split('.')[2].substring(0, 20) + '...'
      },
      decoded: {
        header: decoded?.header,
        payload: decoded?.payload
      },
      localValidation: {
        signatureValid,
        verificationError
      },
      twilioApiValidation: twilioValidation,
      credentials: {
        hasApiSecret: !!process.env.TWILIO_API_SECRET,
        apiSecretLength: process.env.TWILIO_API_SECRET?.length || 0,
        apiKey: process.env.TWILIO_API_KEY?.substring(0, 10) + '...',
        accountSid: accountSid.substring(0, 10) + '...'
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