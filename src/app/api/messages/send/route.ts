import { NextRequest, NextResponse } from 'next/server'
import { TwilioService } from '@/lib/twilio'
import { supabaseAdmin } from '@/lib/supabase'
import { brands } from '@/types/brand'

export async function POST(request: NextRequest) {
  try {
    const { to, from, message } = await request.json()

    if (!to || !from || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone numbers and message are required' },
        { status: 400 }
      )
    }

    // Send SMS via Twilio
    const result = await TwilioService.sendSMS(to, from, message)

    if (result.success) {
      // Find the brand based on the from number
      const brand = brands.find(b => b.phoneNumber === from)
      const brandId = brand?.id || 'unknown'

      // Check if SMS conversation exists
      const { data: existingConv, error: convError } = await supabaseAdmin
        .from('sms_conversations')
        .select('id')
        .eq('phone_number', to)
        .eq('brand_id', brandId)
        .single()

      let conversationId = existingConv?.id

      // Create SMS conversation if it doesn't exist
      if (!existingConv && convError?.code === 'PGRST116') {
        const { data: newConv, error: createError } = await supabaseAdmin
          .from('sms_conversations')
          .insert({
            phone_number: to,
            brand_id: brandId,
            last_message_at: new Date().toISOString(),
            unread_count: 0
          })
          .select('id')
          .single()

        if (createError) {
          console.error('Error creating SMS conversation:', createError)
        } else {
          conversationId = newConv?.id
        }
      }

      // Store the SMS message in the database
      if (conversationId) {
        const { error: messageError } = await supabaseAdmin
          .from('sms_messages')
          .insert({
            conversation_id: conversationId,
            phone_number: to,
            content: message,
            direction: 'outbound',
            status: 'sent',
            brand_id: brandId,
            twilio_sid: result.sid
          })

        if (messageError) {
          console.error('Error storing SMS message:', messageError)
        }
      }

      return NextResponse.json({
        success: true,
        messageSid: result.sid,
        message: 'SMS sent successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}