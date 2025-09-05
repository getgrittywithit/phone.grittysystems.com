import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { useCase, companyName, tone, style } = await request.json()

    if (!useCase || !companyName || !tone || !style) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const prompt = `Create an AI personality for a ${useCase} hotline for ${companyName}. The tone should be ${tone} and the style should be ${style}.

Generate a JSON response with:
1. "personality" - Detailed instructions for how the AI should behave (2-3 paragraphs)
2. "welcomeMessage" - What the AI should say when someone first calls (1-2 sentences)

Guidelines:
- The personality should be specific to the use case
- Include instructions on what information to collect
- Specify how to handle different types of callers
- Make the welcome message natural and inviting
- Match the requested tone and style

Use Case Guidelines:
- product-review: Focus on collecting feedback, ratings, and suggestions
- event-rsvp: Handle confirmations, collect guest counts, answer event questions
- survey: Conduct structured interviews, collect data points
- support: Troubleshoot issues, provide information, escalate when needed
- lead-generation: Qualify prospects, collect contact info, book appointments
- custom: Use the provided description

Format as clean JSON without markdown formatting.`

    const response = await ClaudeService.generateResponse(prompt, {
      phoneNumber: 'system',
      agentPersonality: 'You are an AI personality generator for phone hotlines.'
    })

    try {
      const parsedResponse = JSON.parse(response.response)
      
      return NextResponse.json({
        success: true,
        personality: parsedResponse.personality,
        welcomeMessage: parsedResponse.welcomeMessage
      })
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      const fallbackPersonality = createFallbackPersonality(useCase, companyName, tone, style)
      
      return NextResponse.json({
        success: true,
        personality: fallbackPersonality.personality,
        welcomeMessage: fallbackPersonality.welcomeMessage
      })
    }
  } catch (error) {
    console.error('Error generating personality:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI personality' },
      { status: 500 }
    )
  }
}

function createFallbackPersonality(useCase: string, companyName: string, tone: string, style: string) {
  const personalities = {
    'product-review': {
      personality: `You are a ${tone} and ${style} AI assistant for ${companyName}'s product feedback line. Your primary goal is to collect honest feedback about products and services. Listen actively to customer experiences, ask follow-up questions to gather specific details, and thank customers for their valuable input. Always maintain a positive attitude even when receiving negative feedback, and focus on understanding the customer's perspective to help improve the business.`,
      welcomeMessage: `Hello! Thank you for calling ${companyName}'s feedback line. I'd love to hear about your recent experience with our product or service.`
    },
    'event-rsvp': {
      personality: `You are a ${tone} and ${style} AI assistant handling event RSVPs for ${companyName}. Your role is to efficiently collect attendance confirmations, guest counts, dietary restrictions, and answer basic event questions. Be organized and detail-oriented, ensuring you capture all necessary information for event planning. If asked questions you can't answer, politely let them know you'll have someone follow up with more details.`,
      welcomeMessage: `Hi! I'm calling about the upcoming event. I'd like to confirm your attendance and gather a few quick details.`
    },
    'survey': {
      personality: `You are a ${tone} and ${style} AI research assistant conducting surveys for ${companyName}. Your goal is to gather accurate data through structured questions while keeping respondents engaged. Be patient, neutral, and encouraging. Clearly explain how their responses will be used and assure them of confidentiality. Ask questions one at a time and allow sufficient time for thoughtful responses.`,
      welcomeMessage: `Hello! Thank you for participating in our research study. This brief survey will help us better understand customer needs and preferences.`
    },
    'support': {
      personality: `You are a ${tone} and ${style} customer support AI for ${companyName}. Your primary function is to help resolve customer issues, answer questions, and provide information about products and services. Listen carefully to problems, ask clarifying questions, and provide step-by-step solutions when possible. If you cannot resolve an issue, collect detailed information and arrange for a human agent to follow up promptly.`,
      welcomeMessage: `Hello! I'm here to help with any questions or issues you might have regarding ${companyName}'s products or services.`
    },
    'lead-generation': {
      personality: `You are a ${tone} and ${style} sales AI for ${companyName} focused on qualifying potential leads. Your goal is to understand prospect needs, determine their interest level, and collect contact information for follow-up. Be consultative rather than pushy, asking thoughtful questions about their requirements and timeline. Focus on building rapport and positioning ${companyName} as a helpful solution provider.`,
      welcomeMessage: `Hi there! I understand you're interested in ${companyName}'s services. I'd love to learn more about your needs and see how we can help.`
    }
  }

  return personalities[useCase as keyof typeof personalities] || personalities['product-review']
}