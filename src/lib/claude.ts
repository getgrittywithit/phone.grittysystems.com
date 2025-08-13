import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export class ClaudeService {
  static async generateResponse(
    prompt: string,
    context: {
      phoneNumber: string
      contactName?: string
      conversationHistory?: string[]
      agentPersonality?: string
    }
  ) {
    try {
      const systemPrompt = `You are an AI assistant for the phone number ${context.phoneNumber}. 
${context.agentPersonality || 'You are helpful, professional, and concise.'}

Context:
- Phone number: ${context.phoneNumber}
- Contact: ${context.contactName || 'Unknown caller'}
- Previous conversation: ${context.conversationHistory?.join('\n') || 'None'}

Instructions:
- Keep responses brief and conversational
- Be helpful and friendly
- If it's a business number, be professional
- If it's a personal/family number, be warm and personal
- Ask for clarification if needed
- Don't make assumptions about personal information`

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const response = message.content[0]
      return {
        success: true,
        response: response.type === 'text' ? response.text : 'I apologize, I cannot generate a response right now.'
      }
    } catch (error) {
      console.error('Error generating Claude response:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: errorMessage,
        response: 'I apologize, I am experiencing technical difficulties. Please try again later.'
      }
    }
  }

  static async generateCallScript(
    purpose: string,
    phoneNumberContext: string,
    callerInfo?: string
  ) {
    try {
      const prompt = `Generate a brief, natural phone conversation script for this scenario:
      
Purpose: ${purpose}
Phone context: ${phoneNumberContext}
Caller: ${callerInfo || 'Unknown'}

The script should be:
- Under 2 minutes when spoken
- Natural and conversational
- Appropriate for the context
- Include potential caller responses

Format as a simple dialogue.`

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const response = message.content[0]
      return {
        success: true,
        script: response.type === 'text' ? response.text : 'Script generation failed'
      }
    } catch (error) {
      console.error('Error generating call script:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}

export default anthropic