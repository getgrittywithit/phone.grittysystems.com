import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const apiKey = process.env.TWILIO_API_KEY!
    const apiSecret = process.env.TWILIO_API_SECRET!
    const authToken = process.env.TWILIO_AUTH_TOKEN!

    // Test 1: API Key authentication for various resources
    const apiKeyAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const tests = [
      {
        name: 'Basic Account Info',
        url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
        requiresAuth: 'both'
      },
      {
        name: 'Voice Applications',
        url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Applications.json`,
        requiresAuth: 'both'
      },
      {
        name: 'API Keys List',
        url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Keys.json`,
        requiresAuth: 'basic_only'
      },
      {
        name: 'JWT Tokens (if exists)',
        url: `https://accounts.twilio.com/v1/Accounts/${accountSid}/Tokens.json`,
        requiresAuth: 'api_key'
      }
    ]

    const results = []

    for (const test of tests) {
      const result = { name: test.name, basicAuth: null, apiKeyAuth: null }

      // Test with basic auth
      if (test.requiresAuth === 'both' || test.requiresAuth === 'basic_only') {
        try {
          const response = await fetch(test.url, {
            headers: { 'Authorization': `Basic ${basicAuth}` }
          })
          result.basicAuth = {
            status: response.status,
            success: response.ok,
            error: response.ok ? null : await response.text().then(t => t.substring(0, 200))
          }
        } catch (error) {
          result.basicAuth = {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      // Test with API key auth
      if (test.requiresAuth === 'both' || test.requiresAuth === 'api_key') {
        try {
          const response = await fetch(test.url, {
            headers: { 'Authorization': `Basic ${apiKeyAuth}` }
          })
          result.apiKeyAuth = {
            status: response.status,
            success: response.ok,
            error: response.ok ? null : await response.text().then(t => t.substring(0, 200))
          }
        } catch (error) {
          result.apiKeyAuth = {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      results.push(result)
    }

    // Also get information about the API Key itself
    let apiKeyInfo = null
    try {
      const keyResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Keys/${apiKey}.json`, {
        headers: { 'Authorization': `Basic ${basicAuth}` }
      })
      if (keyResponse.ok) {
        apiKeyInfo = await keyResponse.json()
      } else {
        apiKeyInfo = { error: await keyResponse.text() }
      }
    } catch (error) {
      apiKeyInfo = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    return NextResponse.json({
      success: true,
      permissionTests: results,
      apiKeyInfo: apiKeyInfo,
      credentials: {
        apiKey: apiKey,
        apiKeyType: apiKey.startsWith('SK') ? 'Standard/Restricted' : 'Main',
        accountSid: accountSid.substring(0, 10) + '...'
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}