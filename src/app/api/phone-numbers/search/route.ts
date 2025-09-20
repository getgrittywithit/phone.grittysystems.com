import { NextRequest, NextResponse } from 'next/server'
import { TwilioSaasService } from '@/lib/twilio-saas'

export async function POST(request: NextRequest) {
  try {
    const { areaCode, contains, locality, region, type = 'local' } = await request.json()

    const twilioService = new TwilioSaasService()
    
    let availableNumbers
    
    if (type === 'toll-free') {
      availableNumbers = await twilioService.searchTollFreeNumbers({
        contains,
        locality,
        region,
        limit: 20
      })
    } else {
      availableNumbers = await twilioService.searchAvailableNumbers({
        areaCode,
        contains,
        locality,
        region,
        limit: 20
      })
    }

    return NextResponse.json({
      success: true,
      numbers: availableNumbers,
      searchParams: { areaCode, contains, locality, region, type }
    })
  } catch (error) {
    console.error('Error searching phone numbers:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search available phone numbers'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const areaCode = url.searchParams.get('areaCode')
    const type = url.searchParams.get('type') || 'local'

    const twilioService = new TwilioSaasService()
    
    let availableNumbers
    
    if (type === 'toll-free') {
      availableNumbers = await twilioService.searchTollFreeNumbers({ limit: 10 })
    } else {
      availableNumbers = await twilioService.searchAvailableNumbers({
        areaCode: areaCode || undefined,
        limit: 10
      })
    }

    return NextResponse.json({
      success: true,
      numbers: availableNumbers
    })
  } catch (error) {
    console.error('Error fetching phone numbers:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch available phone numbers'
      },
      { status: 500 }
    )
  }
}