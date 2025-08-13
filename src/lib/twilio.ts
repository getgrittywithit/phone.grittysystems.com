import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export class TwilioService {
  static async sendSMS(to: string, from: string, body: string) {
    try {
      const message = await client.messages.create({
        body,
        from,
        to,
      })
      return { success: true, sid: message.sid }
    } catch (error) {
      console.error('Error sending SMS:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: errorMessage }
    }
  }

  static async makeCall(to: string, from: string, twimlUrl: string) {
    try {
      const call = await client.calls.create({
        to,
        from,
        url: twimlUrl,
      })
      return { success: true, sid: call.sid }
    } catch (error) {
      console.error('Error making call:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: errorMessage }
    }
  }

  static async getCallDetails(callSid: string) {
    try {
      const call = await client.calls(callSid).fetch()
      return { success: true, call }
    } catch (error) {
      console.error('Error fetching call details:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: errorMessage }
    }
  }

  static async getMessageDetails(messageSid: string) {
    try {
      const message = await client.messages(messageSid).fetch()
      return { success: true, message }
    } catch (error) {
      console.error('Error fetching message details:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: errorMessage }
    }
  }

  static async buyPhoneNumber(areaCode?: string) {
    try {
      const listOptions: any = { limit: 1 }
      if (areaCode) {
        listOptions.areaCode = parseInt(areaCode)
      }
      
      const numbers = await client.availablePhoneNumbers('US')
        .local
        .list(listOptions)

      if (numbers.length === 0) {
        return { success: false, error: 'No available numbers found' }
      }

      const phoneNumber = await client.incomingPhoneNumbers.create({
        phoneNumber: numbers[0].phoneNumber
      })

      return { success: true, phoneNumber: phoneNumber.phoneNumber }
    } catch (error) {
      console.error('Error buying phone number:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: errorMessage }
    }
  }
}

export default client