import twilio from 'twilio'

interface AvailableNumber {
  phoneNumber: string
  friendlyName: string
  locality: string
  region: string
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
  }
}

interface PhoneNumberSearchOptions {
  areaCode?: string
  contains?: string
  locality?: string
  region?: string
  limit?: number
}

export class TwilioSaasService {
  private client: twilio.Twilio

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
  }

  async searchAvailableNumbers(options: PhoneNumberSearchOptions): Promise<AvailableNumber[]> {
    try {
      const searchParams: any = {
        limit: options.limit || 10,
        voiceEnabled: true
      }

      if (options.areaCode) {
        searchParams.areaCode = parseInt(options.areaCode)
      }
      
      if (options.contains) {
        searchParams.contains = options.contains
      }

      if (options.locality) {
        searchParams.inLocality = options.locality
      }

      if (options.region) {
        searchParams.inRegion = options.region
      }

      const numbers = await this.client.availablePhoneNumbers('US')
        .local
        .list(searchParams)

      return numbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality || '',
        region: num.region || '',
        capabilities: {
          voice: num.capabilities?.voice || false,
          sms: num.capabilities?.sms || false,
          mms: num.capabilities?.mms || false
        }
      }))
    } catch (error) {
      console.error('Error searching available numbers:', error)
      throw new Error('Failed to search available phone numbers')
    }
  }

  async purchasePhoneNumber(phoneNumber: string, webhookUrl: string): Promise<string> {
    try {
      const purchasedNumber = await this.client.incomingPhoneNumbers.create({
        phoneNumber: phoneNumber,
        voiceUrl: webhookUrl,
        voiceMethod: 'POST',
        statusCallback: `${process.env.NEXTAUTH_URL}/api/twilio/webhooks/call-status`,
        statusCallbackMethod: 'POST'
      })

      return purchasedNumber.sid
    } catch (error) {
      console.error('Error purchasing phone number:', error)
      throw new Error('Failed to purchase phone number')
    }
  }

  async releasePhoneNumber(phoneNumberSid: string): Promise<boolean> {
    try {
      await this.client.incomingPhoneNumbers(phoneNumberSid).remove()
      return true
    } catch (error) {
      console.error('Error releasing phone number:', error)
      return false
    }
  }

  async updatePhoneNumberWebhook(phoneNumberSid: string, webhookUrl: string): Promise<boolean> {
    try {
      await this.client.incomingPhoneNumbers(phoneNumberSid).update({
        voiceUrl: webhookUrl,
        voiceMethod: 'POST'
      })
      return true
    } catch (error) {
      console.error('Error updating webhook:', error)
      return false
    }
  }

  async getPhoneNumberUsage(phoneNumberSid: string, startDate: Date, endDate: Date) {
    try {
      const calls = await this.client.calls.list({
        startTime: startDate,
        endTime: endDate,
        to: phoneNumberSid
      })

      const totalMinutes = calls.reduce((sum, call) => {
        return sum + (parseInt(call.duration || '0') / 60)
      }, 0)

      return {
        callCount: calls.length,
        totalMinutes: Math.ceil(totalMinutes),
        calls: calls.map(call => ({
          sid: call.sid,
          from: call.from,
          duration: call.duration,
          status: call.status,
          startTime: call.startTime
        }))
      }
    } catch (error) {
      console.error('Error getting usage:', error)
      throw new Error('Failed to get phone number usage')
    }
  }

  async searchTollFreeNumbers(options: Omit<PhoneNumberSearchOptions, 'areaCode'>): Promise<AvailableNumber[]> {
    try {
      const searchParams: any = {
        limit: options.limit || 10,
        voiceEnabled: true
      }

      if (options.contains) {
        searchParams.contains = options.contains
      }

      const numbers = await this.client.availablePhoneNumbers('US')
        .tollFree
        .list(searchParams)

      return numbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality || '',
        region: num.region || '',
        capabilities: {
          voice: num.capabilities?.voice || false,
          sms: num.capabilities?.sms || false,
          mms: num.capabilities?.mms || false
        }
      }))
    } catch (error) {
      console.error('Error searching toll-free numbers:', error)
      throw new Error('Failed to search toll-free numbers')
    }
  }
}