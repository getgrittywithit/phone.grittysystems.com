interface CallSummaryData {
  call_id: string
  caller_number: string
  caller_name?: string
  duration: number
  status: 'completed' | 'no-answer' | 'busy' | 'failed'
  summary: string
  transcript?: string
  priority: 'low' | 'medium' | 'high'
}

export class TritonWebhookService {
  private static readonly TRITON_WEBHOOK_URL = process.env.TRITON_WEBHOOK_URL || 
    'https://triton-handyman-backend-production.up.railway.app/api/external-phone/call-summary'
  
  private static readonly PHONE_API_TOKEN = process.env.PHONE_API_TOKEN

  static async sendCallSummary(callData: CallSummaryData): Promise<boolean> {
    if (!this.PHONE_API_TOKEN) {
      console.error('PHONE_API_TOKEN not configured for Triton webhook')
      return false
    }

    try {
      console.log('Sending call summary to Triton:', { 
        call_id: callData.call_id,
        caller: callData.caller_number,
        duration: callData.duration 
      })

      const response = await fetch(this.TRITON_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.PHONE_API_TOKEN}`
        },
        body: JSON.stringify(callData)
      })

      if (!response.ok) {
        throw new Error(`Triton webhook failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Triton webhook success:', result)
      return true

    } catch (error) {
      console.error('Failed to send call summary to Triton:', error)
      return false
    }
  }

  static async sendCallStats(stats: {
    total_calls: number
    answered_calls: number
    missed_calls: number
    average_duration: number
    date: string
  }): Promise<boolean> {
    // Optional: Send daily stats to Triton admin
    try {
      const response = await fetch(
        this.TRITON_WEBHOOK_URL.replace('/call-summary', '/stats'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.PHONE_API_TOKEN}`
          },
          body: JSON.stringify(stats)
        }
      )

      return response.ok
    } catch (error) {
      console.error('Failed to send stats to Triton:', error)
      return false
    }
  }
}