import { NextRequest, NextResponse } from 'next/server'

// API endpoint for Triton admin panel to access call data
export async function GET(request: NextRequest) {
  try {
    // Extract API key or auth token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '10'
    const offset = searchParams.get('offset') || '0'

    // Get calls for Triton brand only
    // TODO: Implement database query for Triton calls
    const calls = [
      {
        id: 'call-123',
        from: '+15551234567',
        to: '+18303577601',
        status: 'completed',
        duration: 120,
        timestamp: new Date().toISOString(),
        brand: 'triton'
      }
    ]

    return NextResponse.json({
      success: true,
      data: calls,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: calls.length
      }
    })

  } catch (error) {
    console.error('Error fetching Triton calls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calls' }, 
      { status: 500 }
    )
  }
}