import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check which Twilio env vars are present (without exposing values)
  const envStatus = {
    TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
    TWILIO_API_KEY: !!process.env.TWILIO_API_KEY,
    TWILIO_API_SECRET: !!process.env.TWILIO_API_SECRET,
    TWILIO_TWIML_APP_SID: !!process.env.TWILIO_TWIML_APP_SID,
    TWILIO_PHONE_NUMBER: !!process.env.TWILIO_PHONE_NUMBER,
  }

  // Show lengths to help debug without exposing values
  const lengths = {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID?.length || 0,
    TWILIO_API_KEY: process.env.TWILIO_API_KEY?.length || 0,
    TWILIO_API_SECRET: process.env.TWILIO_API_SECRET?.length || 0,
    TWILIO_TWIML_APP_SID: process.env.TWILIO_TWIML_APP_SID?.length || 0,
  }

  // Check prefixes
  const prefixes = {
    TWILIO_ACCOUNT_SID_starts_with_AC: process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') || false,
    TWILIO_API_KEY_starts_with_SK: process.env.TWILIO_API_KEY?.startsWith('SK') || false,
    TWILIO_TWIML_APP_SID_starts_with_AP: process.env.TWILIO_TWIML_APP_SID?.startsWith('AP') || false,
  }

  return NextResponse.json({
    envStatus,
    lengths,
    prefixes,
    timestamp: new Date().toISOString()
  })
}