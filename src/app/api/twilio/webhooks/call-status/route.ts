import { NextRequest, NextResponse } from 'next/server'
import { TritonWebhookService } from '@/lib/triton-webhook'
import { ClaudeService } from '@/lib/claude'
import { brands } from '@/types/brand'

export async function POST(request: NextRequest) {
  console.log('Call status webhook called')
  
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callStatus = formData.get('CallStatus') as string
    const callDuration = formData.get('CallDuration') as string
    const recordingUrl = formData.get('RecordingUrl') as string

    console.log('Call status update:', { 
      callSid, 
      from, 
      to, 
      callStatus, 
      duration: callDuration 
    })

    // Only process completed calls to Triton number
    if (callStatus === 'completed' && to === '+18303577601') {
      console.log('Processing completed Triton call for webhook')
      
      try {
        // Generate call summary using Claude AI
        const summary = await generateCallSummary(callSid, from, callDuration, recordingUrl)
        
        // Send to Triton admin
        await TritonWebhookService.sendCallSummary({
          call_id: callSid,
          caller_number: from,
          caller_name: extractCallerName(from), // You might want to look this up
          duration: parseInt(callDuration) || 0,
          status: 'completed',
          summary: summary,
          transcript: recordingUrl ? 'Recording available' : undefined,
          priority: determinePriority(summary)
        })
        
        console.log('Successfully sent call summary to Triton admin')
      } catch (error) {
        console.error('Failed to process Triton call summary:', error)
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Error in call status webhook:', error)
    return new NextResponse('Error', { status: 500 })
  }
}

async function generateCallSummary(callSid: string, from: string, duration: string, recordingUrl?: string): Promise<string> {
  try {
    // If we have a recording, we could transcribe and summarize it
    // For now, generate a basic summary
    const durationMin = Math.floor(parseInt(duration) / 60)
    const durationSec = parseInt(duration) % 60
    
    const prompt = `Generate a brief professional summary for a handyman business call:
    - Call from: ${from}
    - Duration: ${durationMin}m ${durationSec}s
    - Call ID: ${callSid}
    
    Create a concise summary that would be useful for follow-up. Include:
    - Likely reason for calling (general handyman inquiry)
    - Next steps needed
    - Priority level suggestion
    
    Keep it under 100 words and professional.`

    const response = await ClaudeService.generateResponse(prompt, {
      phoneNumber: '+18303577601',
      contactName: from
    })
    
    return response.response || `Customer called regarding handyman services. Duration: ${durationMin}m ${durationSec}s. Follow-up needed to discuss project details.`
  } catch (error) {
    console.error('Failed to generate call summary:', error)
    const durationMin = Math.floor(parseInt(duration) / 60)
    return `Customer called from ${from}. Duration: ${durationMin} minutes. Follow-up needed to discuss project requirements.`
  }
}

function extractCallerName(phoneNumber: string): string | undefined {
  // In a real implementation, you might look up the name in a contact database
  // For now, return undefined to let Triton handle name resolution
  return undefined
}

function determinePriority(summary: string): 'low' | 'medium' | 'high' {
  const urgent = ['emergency', 'urgent', 'asap', 'immediately', 'leak', 'flooding']
  const high = ['broken', 'not working', 'repair', 'fix']
  
  const lowerSummary = summary.toLowerCase()
  
  if (urgent.some(word => lowerSummary.includes(word))) {
    return 'high'
  }
  if (high.some(word => lowerSummary.includes(word))) {
    return 'medium'
  }
  return 'low'
}